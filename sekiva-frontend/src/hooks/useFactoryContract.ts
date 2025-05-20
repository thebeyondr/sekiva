import { useAuth } from "@/auth/useAuth";
import { CLIENT, TESTNET_URL } from "@/partisia-config";
import {
  deployOrganization,
  OrganizationInit,
  deserializeState,
  SekivaFactoryState,
} from "@/contracts/SekivaFactoryGenerated";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import {
  BlockchainTransactionClient,
  SentTransaction,
} from "@partisiablockchain/blockchain-api-transaction-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";

// 0260ad74b28b38c48409f55b5f4a60ec6898ebfc1e
const FACTORY_ADDRESS = "02e2001a2aa0ad2caf29687d5b8e6fb7dfb1d5f1ff";

function getByAddress<K extends { asString?: () => string } | string, V>(
  map: Map<K, V>,
  address: K
): V | undefined {
  const addressStr =
    typeof address === "string"
      ? address
      : typeof address.asString === "function"
        ? address.asString()
        : "";
  const found = Array.from(map.entries()).find(
    ([key]) =>
      (typeof key === "string"
        ? key
        : typeof key.asString === "function"
          ? key.asString()
          : "") === addressStr
  );
  return found ? found[1] : undefined;
}

export function useFactoryContract() {
  const getState = async (): Promise<SekivaFactoryState> => {
    const contract = await CLIENT.getContractData(FACTORY_ADDRESS, true);
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
    return deserializeState(stateBuffer);
  };

  const getOrganizations = async () => {
    const state = await getState();
    return state.organizations;
  };

  const getUserMemberships = async (address: BlockchainAddress) => {
    const state = await getState();
    return getByAddress(state.userOrgMemberships, address) || [];
  };

  return useMemo(
    () => ({
      getState,
      getOrganizations,
      getUserMemberships,
    }),
    []
  );
}

export interface TransactionPointer {
  identifier: string;
  destinationShardId: string;
}

export function useDeployOrganization() {
  const { account } = useAuth();
  const queryClient = useQueryClient();
  const [transactionPointer, setTransactionPointer] =
    useState<TransactionPointer | null>(null);

  const mutation = useMutation({
    mutationFn: async (orgInfo: OrganizationInit) => {
      if (!account) throw new Error("Wallet not connected");
      console.log("Deploying organization with account", account.getAddress());
      try {
        const txClient = BlockchainTransactionClient.create(
          TESTNET_URL,
          account
        );
        const rpc = deployOrganization(orgInfo);
        const txn: SentTransaction = await txClient.signAndSend(
          { address: FACTORY_ADDRESS, rpc },
          10_000_000
        );
        console.log("Organization deployed with txn", txn);

        // Extract transaction pointer info
        if (txn.transactionPointer) {
          const pointer = {
            identifier: txn.transactionPointer.identifier,
            destinationShardId: txn.transactionPointer.destinationShardId,
          };
          setTransactionPointer(pointer);
        }

        return txn;
      } catch (err) {
        throw new Error(
          "Error deploying organization: " +
            (err instanceof Error ? err.message : String(err))
        );
      }
    },
    onSuccess: () => {
      // Invalidate and refetch organizations list
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  return {
    ...mutation,
    transactionPointer,
  };
}
