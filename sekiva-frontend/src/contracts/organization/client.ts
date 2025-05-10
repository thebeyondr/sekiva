import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { BlockchainTransactionClient } from "@partisiablockchain/blockchain-api-transaction-client";
import { ShardedClient } from "@/client/ShardedClient";
import { OrganizationApi } from "./api";
import { OrganizationState } from "./generated";

/**
 * Client for interacting with a deployed Organization contract.
 * Provides convenience methods and wraps the OrganizationApi.
 */
export class OrganizationClient {
  private api: OrganizationApi;

  /**
   * Creates a new OrganizationClient
   *
   * @param shardedClient - Client for interacting with the Partisia blockchain
   * @param contractAddress - Address of the organization contract
   * @param transactionClient - Optional client for sending transactions (required for write operations)
   */
  constructor(
    shardedClient: ShardedClient,
    contractAddress: BlockchainAddress,
    transactionClient?: BlockchainTransactionClient
  ) {
    this.api = new OrganizationApi(
      shardedClient,
      contractAddress,
      transactionClient
    );
  }

  /**
   * Gets the state of the organization contract
   */
  async getState(): Promise<OrganizationState> {
    return this.api.getState();
  }

  /**
   * Gets the owner of the organization
   */
  async getOwner(): Promise<BlockchainAddress> {
    const state = await this.api.getState();
    return state.owner;
  }

  /**
   * Gets the administrators of the organization
   */
  async getAdministrators(): Promise<BlockchainAddress[]> {
    const state = await this.api.getState();
    return state.administrators;
  }

  /**
   * Gets the members of the organization
   */
  async getMembers(): Promise<BlockchainAddress[]> {
    const state = await this.api.getState();
    return state.members;
  }

  /**
   * Gets the ballots associated with the organization
   */
  async getBallots(): Promise<BlockchainAddress[]> {
    const state = await this.api.getState();
    return state.ballots;
  }

  /**
   * Gets organization metadata as a formatted object
   */
  async getMetadata(): Promise<{
    name: string;
    description: string;
    profileImage: string;
    bannerImage: string;
    website: string;
    xAccount: string;
    discordServer: string;
  }> {
    const state = await this.api.getState();
    return {
      name: state.name,
      description: state.description,
      profileImage: state.profileImage,
      bannerImage: state.bannerImage,
      website: state.website,
      xAccount: state.xAccount,
      discordServer: state.discordServer,
    };
  }

  /**
   * Checks if an address is an administrator of the organization
   *
   * @param address - The address to check
   */
  async isAdministrator(address: BlockchainAddress): Promise<boolean> {
    const administrators = await this.getAdministrators();
    return administrators.some(
      (admin) => admin.asString() === address.asString()
    );
  }

  /**
   * Checks if an address is a member of the organization
   *
   * @param address - The address to check
   */
  async isMember(address: BlockchainAddress): Promise<boolean> {
    const members = await this.getMembers();
    return members.some((member) => member.asString() === address.asString());
  }

  /**
   * Adds an administrator to the organization
   *
   * @param address - The address to add as administrator
   */
  async addAdministrator(address: BlockchainAddress) {
    return this.api.addAdministrator(address);
  }

  /**
   * Removes an administrator from the organization
   *
   * @param address - The address to remove
   */
  async removeAdministrator(address: BlockchainAddress) {
    return this.api.removeAdministrator(address);
  }

  /**
   * Adds a member to the organization
   *
   * @param address - The address to add as member
   */
  async addMember(address: BlockchainAddress) {
    return this.api.addMember(address);
  }

  /**
   * Removes a member from the organization
   *
   * @param address - The address to remove
   */
  async removeMember(address: BlockchainAddress) {
    return this.api.removeMember(address);
  }

  /**
   * Adds multiple members to the organization in a single transaction
   *
   * @param addresses - Array of addresses to add as members
   */
  async addMembers(addresses: BlockchainAddress[]) {
    return this.api.addMembers(addresses);
  }

  /**
   * Removes multiple members from the organization in a single transaction
   *
   * @param addresses - Array of addresses to remove
   */
  async removeMembers(addresses: BlockchainAddress[]) {
    return this.api.removeMembers(addresses);
  }

  /**
   * Adds a ballot to the organization
   *
   * @param address - Address of the ballot contract
   */
  async addBallot(address: BlockchainAddress) {
    return this.api.addBallot(address);
  }

  /**
   * Updates organization metadata
   *
   * @param metadata - Object containing metadata fields to update
   */
  async updateMetadata(metadata: {
    name?: string;
    description?: string;
    profileImage?: string;
    bannerImage?: string;
    website?: string;
    xAccount?: string;
    discordServer?: string;
  }) {
    return this.api.updateMetadata(
      metadata.name,
      metadata.description,
      metadata.profileImage,
      metadata.bannerImage,
      metadata.website,
      metadata.xAccount,
      metadata.discordServer
    );
  }

  /**
   * Creates a client with the transaction client configured for a specific account
   *
   * @param shardedClient - The sharded client to use
   * @param contractAddress - The address of the organization contract
   * @param transactionClient - The transaction client configured with account info
   */
  static withAccount(
    shardedClient: ShardedClient,
    contractAddress: BlockchainAddress,
    transactionClient: BlockchainTransactionClient
  ): OrganizationClient {
    return new OrganizationClient(
      shardedClient,
      contractAddress,
      transactionClient
    );
  }
}
