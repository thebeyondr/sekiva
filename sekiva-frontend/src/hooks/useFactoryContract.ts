import { useAuth } from "@/auth/useAuth";
import { CLIENT, TESTNET_URL } from "@/partisia-config";
import {
  deployOrganization,
  OrganizationInfo,
  deserializeState,
  SekivaFactoryState,
  deployBallot,
} from "@/contracts/SekivaFactoryGenerated";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import {
  BlockchainTransactionClient,
  SentTransaction,
} from "@partisiablockchain/blockchain-api-transaction-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// with an org: 022c2353d9d52f50713581b9d5979997a84fdbf38d
// without an org: 024f8690bb3270929c64d279c5dc2462e8ec33c074
const FACTORY_ADDRESS = "024f8690bb3270929c64d279c5dc2462e8ec33c074";

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

  return {
    getState,
    getOrganizations: async () => {
      const state = await getState();
      return state.organizations;
    },
    getBallots: async () => {
      const state = await getState();
      return state.ballots;
    },
    getUserMemberships: async (address: BlockchainAddress) => {
      const state = await getState();
      return getByAddress(state.userOrgMemberships, address) || [];
    },
    getOrganizationBallots: async (orgAddress: BlockchainAddress) => {
      const state = await getState();
      return getByAddress(state.organizationBallots, orgAddress) || [];
    },
  };
}

export function useDeployOrganization() {
  const { account } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orgInfo: OrganizationInfo) => {
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
}

export function useDeployBallot() {
  const { account } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ballotInfo: {
      options: string[];
      title: string;
      description: string;
      organization: BlockchainAddress;
    }) => {
      if (!account) throw new Error("Wallet not connected");
      console.log("Deploying ballot with account", account.getAddress());
      try {
        const txClient = BlockchainTransactionClient.create(
          TESTNET_URL,
          account
        );
        const rpc = deployBallot(
          ballotInfo.options,
          ballotInfo.title,
          ballotInfo.description,
          ballotInfo.organization
        );
        const txn: SentTransaction = await txClient.signAndSend(
          { address: FACTORY_ADDRESS, rpc },
          10_000_000
        );
        console.log("Ballot deployed with txn", txn);
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
      queryClient.invalidateQueries({ queryKey: ["ballots"] });
    },
  });
}
