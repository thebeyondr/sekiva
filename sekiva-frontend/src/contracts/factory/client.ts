import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { BlockchainTransactionClient } from "@partisiablockchain/blockchain-api-transaction-client";
import { ShardedClient } from "@/client/ShardedClient";
import { SekivaFactoryApi, SekivaFactoryBasicState } from "./api";
import { OrganizationInfo } from "./generated";

/**
 * Client for interacting with the Sekiva Factory contract.
 * Provides convenience methods and wraps the SekivaFactoryApi.
 */
export class SekivaFactoryClient {
  private api: SekivaFactoryApi;

  /**
   * Creates a new SekivaFactoryClient
   *
   * @param shardedClient - Client for interacting with the Partisia blockchain
   * @param transactionClient - Optional client for sending transactions (required for write operations)
   */
  constructor(
    shardedClient: ShardedClient,
    transactionClient?: BlockchainTransactionClient
  ) {
    this.api = new SekivaFactoryApi(shardedClient, transactionClient);
  }

  /**
   * Gets the basic state of the factory contract
   */
  async getState(): Promise<SekivaFactoryBasicState> {
    return this.api.basicState();
  }

  /**
   * Gets all organizations created by the factory
   */
  async getOrganizations(): Promise<BlockchainAddress[]> {
    const state = await this.api.basicState();
    return state.organizations;
  }

  /**
   * Gets all ballots created by the factory
   */
  async getBallots(): Promise<BlockchainAddress[]> {
    const state = await this.api.basicState();
    return state.ballots;
  }

  /**
   * Gets organizations a user is a member of
   *
   * @param address - The blockchain address of the user
   */
  async getUserMemberships(
    address: BlockchainAddress
  ): Promise<BlockchainAddress[]> {
    const state = await this.api.basicState();
    return state.userOrgMemberships.get(address) || [];
  }

  /**
   * Gets ballots for a specific organization
   *
   * @param orgAddress - The blockchain address of the organization
   */
  async getOrganizationBallots(
    orgAddress: BlockchainAddress
  ): Promise<BlockchainAddress[]> {
    const state = await this.api.basicState();
    return state.organizationBallots.get(orgAddress) || [];
  }

  /**
   * Deploys a new organization
   *
   * @param orgInfo - Information about the organization to create
   * @returns Transaction response
   */
  async deployOrganization(orgInfo: OrganizationInfo) {
    return this.api.deployOrganization(orgInfo);
  }

  /**
   * Deploys a new ballot
   *
   * @param options - Ballot options
   * @param title - Ballot title
   * @param description - Ballot description
   * @param organization - Organization address this ballot belongs to
   * @returns Transaction response
   */
  async deployBallot(
    options: string[],
    title: string,
    description: string,
    organization: BlockchainAddress
  ) {
    return this.api.deployBallot(options, title, description, organization);
  }

  /**
   * Creates a client with the transaction client configured for a specific account
   *
   * @param shardedClient - The sharded client to use
   * @param transactionClient - The transaction client configured with account info
   */
  static withAccount(
    shardedClient: ShardedClient,
    transactionClient: BlockchainTransactionClient
  ): SekivaFactoryClient {
    return new SekivaFactoryClient(shardedClient, transactionClient);
  }
}
