import { useAuth } from "@/auth/useAuth";
import { CLIENT, TESTNET_URL } from "@/partisia-config";
import {
  OrganizationState,
  deserializeState,
  deployBallot,
  BallotInit,
} from "@/contracts/OrganizationGenerated";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import {
  BlockchainTransactionClient,
  SentTransaction,
} from "@partisiablockchain/blockchain-api-transaction-client";
import {
  useMutation,
  useQuery,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useBallotContract } from "./useBallotContract";

export interface TransactionPointer {
  identifier: string;
  destinationShardId: string;
}

export function useOrganizationContract() {
  const getState = async (address: string): Promise<OrganizationState> => {
    const contract = await CLIENT.getContractData(address, true);
    if (!contract) throw new Error("Could not find data for contract");
    let stateBuffer: Buffer;
    if (typeof contract.serializedContract === "string") {
      stateBuffer = Buffer.from(contract.serializedContract, "base64");
    } else if (
      typeof contract.serializedContract === "object" &&
      contract.serializedContract !== null &&
      "data" in contract.serializedContract &&
      typeof (contract.serializedContract as { data?: string }).data ===
        "string"
    ) {
      stateBuffer = Buffer.from(
        (contract.serializedContract as { data: string }).data,
        "base64"
      );
    } else {
      throw new Error("Unexpected contract state format");
    }
    const state = deserializeState(stateBuffer);
    return state;
  };

  return useMemo(
    () => ({
      getState,
    }),
    []
  );
}

export function useDeployBallot() {
  const { account } = useAuth();
  const queryClient = useQueryClient();
  const [transactionPointer, setTransactionPointer] =
    useState<TransactionPointer | null>(null);

  const mutation = useMutation({
    mutationFn: async (params: {
      organizationAddress: BlockchainAddress;
      ballotInfo: BallotInit;
    }) => {
      if (!account) throw new Error("Wallet not connected");
      console.log("Deploying ballot with account", account.getAddress());
      try {
        const txClient = BlockchainTransactionClient.create(
          TESTNET_URL,
          account
        );
        const rpc = deployBallot(params.ballotInfo);
        const txn: SentTransaction = await txClient.signAndSend(
          { address: params.organizationAddress.asString(), rpc },
          10_000_000
        );
        console.log("Ballot deployed with txn", txn);

        if (txn.transactionPointer) {
          const pointer: TransactionPointer = {
            identifier: txn.transactionPointer.identifier,
            destinationShardId:
              txn.transactionPointer.destinationShardId.toString(),
          };
          setTransactionPointer(pointer);
        }

        return txn;
      } catch (err) {
        throw new Error(
          "Error deploying ballot: " +
            (err instanceof Error ? err.message : String(err))
        );
      }
    },
    onSuccess: (_, params) => {
      // Invalidate and refetch organization data
      queryClient.invalidateQueries({
        queryKey: ["organization", params.organizationAddress.asString()],
      });
    },
  });

  return {
    ...mutation,
    transactionPointer,
  };
}

// Hook that combines organization data with ballot data
export function useOrganizationWithBallots(orgAddress: BlockchainAddress) {
  const { getState } = useOrganizationContract();
  const { getState: getBallotState } = useBallotContract();

  // Get the organization state
  const orgQuery = useQuery({
    queryKey: ["organization", orgAddress.asString()],
    queryFn: () => {
      console.log(
        "[useOrganizationWithBallots] Fetching org state for",
        orgAddress.asString()
      );
      return getState(orgAddress.asString());
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  console.log("[useOrganizationWithBallots] Org query state:", {
    isLoading: orgQuery.isLoading,
    error: orgQuery.error,
    data: orgQuery.data
      ? {
          ...orgQuery.data,
          ballots: orgQuery.data.ballots?.map((b) => b.asString()),
        }
      : null,
  });

  // Get all ballots for the organization in parallel
  const ballotStatesQueries = useQueries({
    queries: (orgQuery.data?.ballots || []).map((ballotAddress) => ({
      queryKey: ["ballot", ballotAddress.asString()],
      queryFn: () => {
        console.log(
          "[useOrganizationWithBallots] Fetching ballot state for",
          ballotAddress.asString()
        );
        return getBallotState(ballotAddress.asString());
      },
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      enabled: !!orgQuery.data?.ballots,
    })),
  });

  console.log("[useOrganizationWithBallots] Ballot queries state:", {
    isLoading: ballotStatesQueries.some((q) => q.isLoading),
    errors: ballotStatesQueries.map((q) => q.error).filter(Boolean),
    data: ballotStatesQueries.map((q) => q.data),
  });

  // Combine organization with its ballots
  const ballots = ballotStatesQueries
    .map((query, index) => {
      if (!query.data || !orgQuery.data?.ballots) return null;
      const ballotAddress = orgQuery.data.ballots[index];
      return {
        address: ballotAddress,
        state: query.data,
      } as const;
    })
    .filter((ballot): ballot is NonNullable<typeof ballot> => ballot !== null);

  return {
    organization: orgQuery.data,
    ballots,
    loading: orgQuery.isLoading || ballotStatesQueries.some((q) => q.isLoading),
    error:
      (orgQuery.error || ballotStatesQueries.find((q) => q.error)?.error) ??
      null,
    refresh: () => {
      orgQuery.refetch();
      return Promise.all(ballotStatesQueries.map((q) => q.refetch()));
    },
  };
}
