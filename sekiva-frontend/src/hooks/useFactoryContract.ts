import {
  deployOrganization,
  deserializeState,
  SekivaFactoryState,
} from "@/contracts/SekivaFactoryGenerated";
import { useTransaction } from "@/hooks/useTransaction";
import { CLIENT } from "@/partisia-config";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

// 02c4f69673a0e991815c7d41f9cb04803476a1e29c
// 02768301908ff0d35e53ef5c44b000d509f08e4e09
const FACTORY_ADDRESS = "02768301908ff0d35e53ef5c44b000d509f08e4e09";

export interface OrganizationInit {
  name: string;
  description: string;
  profileImage: string;
  bannerImage: string;
  xUrl: string;
  discordUrl: string;
  websiteUrl: string;
  administrator: BlockchainAddress;
}

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
  const { sendTransaction, requiresWalletConnection } = useTransaction();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (init: OrganizationInit) => {
      const rpc = deployOrganization(
        init.name,
        init.description,
        init.profileImage,
        init.bannerImage,
        init.xUrl,
        init.discordUrl,
        init.websiteUrl,
        init.administrator
      );
      return sendTransaction({
        type: "regular",
        address: FACTORY_ADDRESS,
        rpc,
        gasCost: 100_000,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  return {
    ...mutation,
    requiresWalletConnection,
  };
}
