import {
  OrganizationGenerated,
  OrganizationState,
  addMember as addMemberRpc,
  removeMember as removeMemberRpc,
  addAdministrator as addAdminRpc,
  removeAdministrator as removeAdminRpc,
  updateMetadata as updateMetadataRpc,
} from "@/contracts/organization/OrganizationGenerated";
import {
  BlockchainTransactionClient,
  SentTransaction,
} from "@partisiablockchain/blockchain-api-transaction-client";
import { BlockchainAddress } from "@partisiablockchain/abi-client";

// Types
export type OrganizationId = string;

export const getOrganizationState = async (
  id: OrganizationId
): Promise<OrganizationState> => {
  const client = new OrganizationGenerated(
    undefined,
    BlockchainAddress.fromString(id)
  );
  return client.getState();
};

export interface OrganizationClient {
  getState: () => Promise<OrganizationState>;
  addMember: (memberAddress: string) => Promise<SentTransaction>;
  removeMember: (memberAddress: string) => Promise<SentTransaction>;
  addAdministrator: (adminAddress: string) => Promise<SentTransaction>;
  removeAdministrator: (adminAddress: string) => Promise<SentTransaction>;
  updateMetadata: (metadata: {
    name?: string;
    description?: string;
    profileImage?: string;
    bannerImage?: string;
    website?: string;
    xAccount?: string;
    discordServer?: string;
  }) => Promise<SentTransaction>;
}

export const createOrganizationClient = (
  contractAddress: OrganizationId,
  transactionClient: BlockchainTransactionClient
): OrganizationClient => ({
  getState: () => getOrganizationState(contractAddress),
  addMember: async (memberAddress: string) => {
    const rpc = addMemberRpc(BlockchainAddress.fromString(memberAddress));
    return transactionClient.signAndSend(
      { address: contractAddress, rpc },
      100_000
    );
  },
  removeMember: async (memberAddress: string) => {
    const rpc = removeMemberRpc(BlockchainAddress.fromString(memberAddress));
    return transactionClient.signAndSend(
      { address: contractAddress, rpc },
      100_000
    );
  },
  addAdministrator: async (adminAddress: string) => {
    const rpc = addAdminRpc(BlockchainAddress.fromString(adminAddress));
    return transactionClient.signAndSend(
      { address: contractAddress, rpc },
      100_000
    );
  },
  removeAdministrator: async (adminAddress: string) => {
    const rpc = removeAdminRpc(BlockchainAddress.fromString(adminAddress));
    return transactionClient.signAndSend(
      { address: contractAddress, rpc },
      100_000
    );
  },
  updateMetadata: async (metadata) => {
    const rpc = updateMetadataRpc(
      metadata.name,
      metadata.description,
      metadata.profileImage,
      metadata.bannerImage,
      metadata.website,
      metadata.xAccount,
      metadata.discordServer
    );
    return transactionClient.signAndSend(
      { address: contractAddress, rpc },
      150_000
    );
  },
});
