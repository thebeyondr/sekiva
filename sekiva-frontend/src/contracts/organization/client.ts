import {
  deserializeState,
  OrganizationState,
  addAdministrator,
  removeAdministrator,
  addMember,
  removeMember,
  addBallot,
  addMembers,
  removeMembers,
  updateMetadata,
} from "./OrganizationGenerated";

import { BlockchainTransactionClient } from "@partisiablockchain/blockchain-api-transaction-client";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { ShardedClient } from "@/client/ShardedClient";

/**
 * Client for interacting with a deployed Organization contract.
 * Provides convenience methods for interacting with the organization contract.
 */
export class OrganizationClient {
  private readonly transactionClient: BlockchainTransactionClient | undefined;
  private readonly client: ShardedClient;
  private readonly contractAddress: BlockchainAddress;

  constructor(
    shardedClient: ShardedClient,
    contractAddress: BlockchainAddress,
    transactionClient?: BlockchainTransactionClient
  ) {
    this.transactionClient = transactionClient;
    this.client = shardedClient;
    this.contractAddress = contractAddress;
  }

  private _getState(): Promise<OrganizationState> {
    const contractAddressStr = this.contractAddress.asString();

    console.log(
      `Fetching organization data for address: ${contractAddressStr}`
    );

    return this.client
      .getContractData(contractAddressStr, true)
      .then((contract) => {
        if (contract == null) {
          throw new Error("Could not find data for organization contract");
        }

        console.log("Organization data retrieved:", contract);

        interface ExtendedContractData {
          serializedContract?: unknown;
          state?: {
            owner?: string;
            administrators?: string[];
            members?: string[];
            name?: string;
            description?: string;
            profileImage?: string;
            bannerImage?: string;
            website?: string;
            xAccount?: string;
            discordServer?: string;
            ballots?: string[];
            [key: string]: unknown;
          };
          [key: string]: unknown;
        }

        const extendedContract = contract as unknown as ExtendedContractData;

        if (extendedContract.serializedContract) {
          console.log("Contract has serializedContract data");
          try {
            let stateBuffer: Buffer;

            if (typeof extendedContract.serializedContract === "string") {
              stateBuffer = Buffer.from(
                extendedContract.serializedContract,
                "base64"
              );
            } else if (
              typeof extendedContract.serializedContract === "object" &&
              extendedContract.serializedContract !== null
            ) {
              const serializedObj = extendedContract.serializedContract as {
                data?: string;
              };
              if (
                serializedObj.data &&
                typeof serializedObj.data === "string"
              ) {
                stateBuffer = Buffer.from(serializedObj.data, "base64");
              } else {
                stateBuffer = Buffer.from(
                  JSON.stringify(extendedContract.serializedContract)
                );
              }
            } else {
              throw new Error("Unexpected serializedContract format");
            }

            console.log(
              `State buffer created, length: ${stateBuffer.length} bytes`
            );

            const state = deserializeState(stateBuffer);
            console.log("Successfully deserialized organization state:", state);
            return state;
          } catch (error) {
            console.error("Error deserializing organization state:", error);

            if (extendedContract.state) {
              return this.createStateFromDirectData(extendedContract.state);
            }
          }
        } else if (extendedContract.state) {
          return this.createStateFromDirectData(extendedContract.state);
        }

        console.log("No usable organization state found, using minimal state");
        return this.createMinimalState();
      })
      .catch((error) => {
        console.error("Error fetching organization state:", error);
        console.log("Using minimal fallback state");
        return this.createMinimalState();
      });
  }

  private createStateFromDirectData(stateData: {
    owner?: string;
    administrators?: string[];
    members?: string[];
    name?: string;
    description?: string;
    profileImage?: string;
    bannerImage?: string;
    website?: string;
    xAccount?: string;
    discordServer?: string;
    ballots?: string[];
    [key: string]: unknown;
  }): OrganizationState {
    console.log(
      "Creating organization state from direct state data:",
      stateData
    );

    try {
      const owner = stateData.owner
        ? BlockchainAddress.fromString(stateData.owner)
        : this.contractAddress;

      const administrators = Array.isArray(stateData.administrators)
        ? stateData.administrators.map((addr: string) =>
            BlockchainAddress.fromString(addr)
          )
        : [];

      const members = Array.isArray(stateData.members)
        ? stateData.members.map((addr: string) =>
            BlockchainAddress.fromString(addr)
          )
        : [];

      const ballots = Array.isArray(stateData.ballots)
        ? stateData.ballots.map((addr: string) =>
            BlockchainAddress.fromString(addr)
          )
        : [];

      const state: OrganizationState = {
        owner,
        administrators,
        members,
        name: stateData.name || "",
        description: stateData.description || "",
        profileImage: stateData.profileImage || "",
        bannerImage: stateData.bannerImage || "",
        website: stateData.website || "",
        xAccount: stateData.xAccount || "",
        discordServer: stateData.discordServer || "",
        ballots,
      };

      console.log("Created organization state from direct API data:", state);
      return state;
    } catch (error) {
      console.error(
        "Error creating organization state from direct data:",
        error
      );
      return this.createMinimalState();
    }
  }

  private createMinimalState(): OrganizationState {
    return {
      owner: this.contractAddress,
      administrators: [],
      members: [],
      name: "",
      description: "",
      profileImage: "",
      bannerImage: "",
      website: "",
      xAccount: "",
      discordServer: "",
      ballots: [],
    };
  }

  // Public API methods
  async getState(): Promise<OrganizationState> {
    return this._getState();
  }

  async getOwner(): Promise<BlockchainAddress> {
    const state = await this._getState();
    return state.owner;
  }

  async getAdministrators(): Promise<BlockchainAddress[]> {
    const state = await this._getState();
    return state.administrators;
  }

  async getMembers(): Promise<BlockchainAddress[]> {
    const state = await this._getState();
    return state.members;
  }

  async getBallots(): Promise<BlockchainAddress[]> {
    const state = await this._getState();
    return state.ballots;
  }

  async getMetadata(): Promise<{
    name: string;
    description: string;
    profileImage: string;
    bannerImage: string;
    website: string;
    xAccount: string;
    discordServer: string;
  }> {
    const state = await this._getState();
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

  async isAdministrator(address: BlockchainAddress): Promise<boolean> {
    const administrators = await this.getAdministrators();
    return administrators.some(
      (admin) => admin.asString() === address.asString()
    );
  }

  async isMember(address: BlockchainAddress): Promise<boolean> {
    const members = await this.getMembers();
    return members.some((member) => member.asString() === address.asString());
  }

  async addAdministrator(address: BlockchainAddress) {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = addAdministrator(address);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      100_000
    );
  }

  async removeAdministrator(address: BlockchainAddress) {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = removeAdministrator(address);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      100_000
    );
  }

  async addMember(address: BlockchainAddress) {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = addMember(address);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      100_000
    );
  }

  async removeMember(address: BlockchainAddress) {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = removeMember(address);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      100_000
    );
  }

  async addMembers(addresses: BlockchainAddress[]) {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = addMembers(addresses);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      200_000
    );
  }

  async removeMembers(addresses: BlockchainAddress[]) {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = removeMembers(addresses);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      200_000
    );
  }

  async addBallot(address: BlockchainAddress) {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = addBallot(address);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      100_000
    );
  }

  async updateMetadata(metadata: {
    name?: string;
    description?: string;
    profileImage?: string;
    bannerImage?: string;
    website?: string;
    xAccount?: string;
    discordServer?: string;
  }) {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = updateMetadata(
      metadata.name,
      metadata.description,
      metadata.profileImage,
      metadata.bannerImage,
      metadata.website,
      metadata.xAccount,
      metadata.discordServer
    );

    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      150_000
    );
  }

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
