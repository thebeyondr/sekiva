import { useAuth } from "@/auth/useAuth";
import { CLIENT, TESTNET_URL } from "@/partisia-config";
import {
  addAdministrator,
  removeAdministrator,
  addMember,
  removeMember,
  addBallot,
  addMembers,
  removeMembers,
  updateMetadata,
  OrganizationState,
  deserializeState,
} from "@/contracts/organization/OrganizationGenerated";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { BlockchainTransactionClient } from "@partisiablockchain/blockchain-api-transaction-client";

export function useOrganizationContract() {
  const { account } = useAuth();

  const getTransactionClient = () => {
    if (!account) throw new Error("Wallet not connected");
    return BlockchainTransactionClient.create(TESTNET_URL, account);
  };

  // Read state using the generated class
  const getState = async (
    orgAddress: BlockchainAddress
  ): Promise<OrganizationState> => {
    const contract = await CLIENT.getContractData(orgAddress.asString(), true);
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

  // Write actions
  return {
    getState,
    addAdministrator: async (
      orgAddress: BlockchainAddress,
      memberAddress: BlockchainAddress
    ) => {
      const txClient = getTransactionClient();
      const rpc = addAdministrator(memberAddress);
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
    removeAdministrator: async (
      orgAddress: BlockchainAddress,
      memberAddress: BlockchainAddress
    ) => {
      const txClient = getTransactionClient();
      const rpc = removeAdministrator(memberAddress);
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
    addMember: async (
      orgAddress: BlockchainAddress,
      memberAddress: BlockchainAddress
    ) => {
      const txClient = getTransactionClient();
      const rpc = addMember(memberAddress);
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
    removeMember: async (
      orgAddress: BlockchainAddress,
      memberAddress: BlockchainAddress
    ) => {
      const txClient = getTransactionClient();
      const rpc = removeMember(memberAddress);
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
    addBallot: async (
      orgAddress: BlockchainAddress,
      ballotAddress: BlockchainAddress
    ) => {
      const txClient = getTransactionClient();
      const rpc = addBallot(ballotAddress);
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
    addMembers: async (
      orgAddress: BlockchainAddress,
      memberAddresses: BlockchainAddress[]
    ) => {
      const txClient = getTransactionClient();
      const rpc = addMembers(memberAddresses);
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
    removeMembers: async (
      orgAddress: BlockchainAddress,
      memberAddresses: BlockchainAddress[]
    ) => {
      const txClient = getTransactionClient();
      const rpc = removeMembers(memberAddresses);
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
    updateMetadata: async (
      orgAddress: BlockchainAddress,
      fields: {
        name?: string;
        description?: string;
        profileImage?: string;
        bannerImage?: string;
        website?: string;
        xAccount?: string;
        discordServer?: string;
      }
    ) => {
      const txClient = getTransactionClient();
      const rpc = updateMetadata(
        fields.name,
        fields.description,
        fields.profileImage,
        fields.bannerImage,
        fields.website,
        fields.xAccount,
        fields.discordServer
      );
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
  };
}
