import { useAuth } from "@/auth/useAuth";
import { TESTNET_URL, SHARD_PRIORITY } from "@/partisia-config";
import {
  OrganizationState,
  deserializeState,
  deployBallot,
  addAdministrator,
  removeAdministrator,
  addMember,
  removeMember,
  addMembers,
} from "@/contracts/OrganizationGenerated";
import { BlockchainAddress, BN } from "@partisiablockchain/abi-client";
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
import { ShardId } from "@/partisia-config";

export type OrganizationId = string;

export type Organization = OrganizationState & {
  lastUpdated: number;
  shardId: ShardId;
};

export interface BallotInit {
  options: string[];
  title: string;
  description: string;
  administrator: BlockchainAddress;
  durationSeconds: BN;
}

export interface TransactionPointer {
  identifier: string;
  destinationShardId: string;
}

const fetchOrganizationFromShard = async (
  id: OrganizationId,
  shard: ShardId
): Promise<Organization> => {
  const response = await fetch(
    `${TESTNET_URL}/shards/${shard}/blockchain/contracts/${id}`
  ).then((res) => res.json());

  if (!response?.serializedContract?.state?.data) {
    throw new Error(`No contract data from ${shard}`);
  }

  const stateBuffer = Buffer.from(
    response.serializedContract.state.data,
    "base64"
  );
  const state = deserializeState(stateBuffer);
  return { ...state, lastUpdated: Date.now(), shardId: shard };
};

export const getOrganizationState = async (
  id: OrganizationId
): Promise<Organization> => {
  let lastError: Error | null = null;

  for (const shard of SHARD_PRIORITY) {
    try {
      const org = await fetchOrganizationFromShard(id, shard);
      return org;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (shard === SHARD_PRIORITY[SHARD_PRIORITY.length - 1]) {
        throw lastError;
      }
      continue;
    }
  }
  throw lastError;
};

export function useOrganizationContract() {
  const { account } = useAuth();
  const queryClient = useQueryClient();

  const addMemberMutation = useMutation({
    mutationFn: async ({
      orgAddress,
      memberAddress,
    }: {
      orgAddress: string;
      memberAddress: string;
    }) => {
      if (!account) throw new Error("Wallet not connected");
      const txClient = BlockchainTransactionClient.create(TESTNET_URL, account);
      const rpc = addMember(BlockchainAddress.fromString(memberAddress));
      const txn = await txClient.signAndSend(
        { address: orgAddress, rpc },
        100_000
      );
      return txn;
    },
    onSuccess: (_, { orgAddress }) => {
      queryClient.invalidateQueries({ queryKey: ["organization", orgAddress] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async ({
      orgAddress,
      memberAddress,
    }: {
      orgAddress: string;
      memberAddress: string;
    }) => {
      if (!account) throw new Error("Wallet not connected");
      const txClient = BlockchainTransactionClient.create(TESTNET_URL, account);
      const rpc = removeMember(BlockchainAddress.fromString(memberAddress));
      const txn = await txClient.signAndSend(
        { address: orgAddress, rpc },
        100_000
      );
      return txn;
    },
    onSuccess: (_, { orgAddress }) => {
      queryClient.invalidateQueries({ queryKey: ["organization", orgAddress] });
    },
  });

  const promoteMemberMutation = useMutation({
    mutationFn: async ({
      orgAddress,
      memberAddress,
    }: {
      orgAddress: string;
      memberAddress: string;
    }) => {
      if (!account) throw new Error("Wallet not connected");
      const txClient = BlockchainTransactionClient.create(TESTNET_URL, account);
      const rpc = addAdministrator(BlockchainAddress.fromString(memberAddress));
      const txn = await txClient.signAndSend(
        { address: orgAddress, rpc },
        100_000
      );
      return txn;
    },
    onSuccess: (_, { orgAddress }) => {
      queryClient.invalidateQueries({ queryKey: ["organization", orgAddress] });
    },
  });

  const demoteMemberMutation = useMutation({
    mutationFn: async ({
      orgAddress,
      memberAddress,
    }: {
      orgAddress: string;
      memberAddress: string;
    }) => {
      if (!account) throw new Error("Wallet not connected");
      const txClient = BlockchainTransactionClient.create(TESTNET_URL, account);
      const rpc = removeAdministrator(
        BlockchainAddress.fromString(memberAddress)
      );
      const txn = await txClient.signAndSend(
        { address: orgAddress, rpc },
        100_000
      );
      return txn;
    },
    onSuccess: (_, { orgAddress }) => {
      queryClient.invalidateQueries({ queryKey: ["organization", orgAddress] });
    },
  });

  const addMembersMutation = useMutation({
    mutationFn: async ({
      orgAddress,
      memberAddresses,
    }: {
      orgAddress: string;
      memberAddresses: string[];
    }) => {
      if (!account) throw new Error("Wallet not connected");
      const txClient = BlockchainTransactionClient.create(TESTNET_URL, account);
      const addresses = memberAddresses.map((addr) =>
        BlockchainAddress.fromString(addr)
      );
      const rpc = addMembers(addresses);
      const txn = await txClient.signAndSend(
        { address: orgAddress, rpc },
        100_000
      );
      return txn;
    },
    onSuccess: (_, { orgAddress }) => {
      queryClient.invalidateQueries({ queryKey: ["organization", orgAddress] });
    },
  });

  return useMemo(
    () => ({
      getState: getOrganizationState,
      addMember: (orgAddress: string, memberAddress: string) =>
        addMemberMutation.mutateAsync({ orgAddress, memberAddress }),
      removeMember: (orgAddress: string, memberAddress: string) =>
        removeMemberMutation.mutateAsync({ orgAddress, memberAddress }),
      promoteMember: (orgAddress: string, memberAddress: string) =>
        promoteMemberMutation.mutateAsync({ orgAddress, memberAddress }),
      demoteMember: (orgAddress: string, memberAddress: string) =>
        demoteMemberMutation.mutateAsync({ orgAddress, memberAddress }),
      addMembers: (orgAddress: string, memberAddresses: string[]) =>
        addMembersMutation.mutateAsync({ orgAddress, memberAddresses }),
    }),
    [
      addMemberMutation,
      removeMemberMutation,
      promoteMemberMutation,
      demoteMemberMutation,
      addMembersMutation,
    ]
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
        const rpc = deployBallot(
          params.ballotInfo.options,
          params.ballotInfo.title,
          params.ballotInfo.description,
          params.ballotInfo.administrator,
          params.ballotInfo.durationSeconds
        );
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
    queryFn: () => getState(orgAddress.asString()),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  // Get all ballots for the organization in parallel
  const ballotStatesQueries = useQueries({
    queries: (orgQuery.data?.ballots || []).map((ballotAddress) => ({
      queryKey: ["ballot", ballotAddress.asString()],
      queryFn: () => getBallotState(ballotAddress.asString()),
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      enabled: !!orgQuery.data?.ballots,
    })),
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
