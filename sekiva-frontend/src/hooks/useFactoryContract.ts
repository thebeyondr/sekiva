import { useAuth } from "@/auth/useAuth";
import { CLIENT, TESTNET_URL } from "@/partisia-config";
import {
  deployOrganization,
  OrganizationInfo,
  deserializeState,
  SekivaFactoryState,
  deployBallot,
} from "@/contracts/factory/SekivaFactoryGenerated";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { BlockchainTransactionClient } from "@partisiablockchain/blockchain-api-transaction-client";
import { BallotState } from "@/contracts/ballot/BallotGenerated";

const FACTORY_ADDRESS = "022c2353d9d52f50713581b9d5979997a84fdbf38d";

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
  const { account } = useAuth();

  const getTransactionClient = () => {
    if (!account) throw new Error("Wallet not connected");
    return BlockchainTransactionClient.create(TESTNET_URL, account);
  };

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
    deployOrganization: async (orgInfo: OrganizationInfo) => {
      const txClient = getTransactionClient();
      const rpc = deployOrganization(orgInfo);
      return txClient.signAndSend({ address: FACTORY_ADDRESS, rpc }, 1_000_000);
    },
    deployBallot: async (ballotInfo: BallotState) => {
      const txClient = getTransactionClient();
      const rpc = deployBallot(
        ballotInfo.options,
        ballotInfo.title,
        ballotInfo.description,
        ballotInfo.organization
      );
      return txClient.signAndSend({ address: FACTORY_ADDRESS, rpc }, 1_000_000);
    },
  };
}
