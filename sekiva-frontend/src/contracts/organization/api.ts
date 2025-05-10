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
} from "./generated";

import { BlockchainTransactionClient } from "@partisiablockchain/blockchain-api-transaction-client";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { ShardedClient } from "@/client/ShardedClient";

/**
 * API for interacting with a deployed Organization contract.
 *
 * Uses the TransactionApi to send transactions, and ABI for the contract to
 * serialize and deserialize state and transactions.
 */
export class OrganizationApi {
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

  /**
   * Retrieves and deserializes the organization state
   */
  public getState(): Promise<OrganizationState> {
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

        // Define a type that includes potentially missing properties
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

        // Cast to our extended type
        const extendedContract = contract as unknown as ExtendedContractData;

        // Directly use the generated deserializeState function with the serializedContract
        if (extendedContract.serializedContract) {
          console.log("Contract has serializedContract data");
          try {
            // Handle different serializedContract formats
            let stateBuffer: Buffer;

            if (typeof extendedContract.serializedContract === "string") {
              // If it's a base64 string
              stateBuffer = Buffer.from(
                extendedContract.serializedContract,
                "base64"
              );
            } else if (
              typeof extendedContract.serializedContract === "object" &&
              extendedContract.serializedContract !== null
            ) {
              // If we got serializedContract as an object with data field
              const serializedObj = extendedContract.serializedContract as {
                data?: string;
              };
              if (
                serializedObj.data &&
                typeof serializedObj.data === "string"
              ) {
                stateBuffer = Buffer.from(serializedObj.data, "base64");
              } else {
                // Try to stringify and parse the whole object
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

            // Use the generated deserializeState function
            const state = deserializeState(stateBuffer);
            console.log("Successfully deserialized organization state:", state);
            return state;
          } catch (error) {
            console.error("Error deserializing organization state:", error);

            // If deserialization fails, try the state field directly
            if (extendedContract.state) {
              return this.createStateFromDirectData(extendedContract.state);
            }
          }
        } else if (extendedContract.state) {
          // If we have a direct state field, use it
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

  /**
   * Helper method to create a state object from direct API state data
   */
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
      // Convert string addresses to BlockchainAddress objects
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

      // Create a state object with the data from the API
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

  // Fallback method to get state from the JSON API
  private getStateFromJSONAPI(): Promise<OrganizationState> {
    const contractAddressStr = this.contractAddress.asString();
    const baseUrl = "https://node1.testnet.partisiablockchain.com";
    const url = `${baseUrl}/blockchain/contracts/${contractAddressStr}?requireContractState=true`;

    console.log(`Falling back to JSON API for organization: ${url}`);

    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to fetch JSON state: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((contractData) => {
        if (
          contractData &&
          typeof contractData === "object" &&
          "state" in contractData
        ) {
          try {
            console.log(
              "Contract contains direct state object:",
              contractData.state
            );
            return this.createStateFromDirectData(contractData.state);
          } catch (error) {
            console.error("Error processing JSON state:", error);
          }
        }

        console.log(
          "Could not extract state from JSON API, using minimal state"
        );
        return this.createMinimalState();
      })
      .catch((error) => {
        console.error("Error fetching JSON state:", error);
        return this.createMinimalState();
      });
  }

  private createMinimalState(): OrganizationState {
    // Create a minimal state as fallback
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

  /**
   * Add an administrator to the organization
   */
  readonly addAdministrator = (address: BlockchainAddress) => {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = addAdministrator(address);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      100_000
    );
  };

  /**
   * Remove an administrator from the organization
   */
  readonly removeAdministrator = (address: BlockchainAddress) => {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = removeAdministrator(address);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      100_000
    );
  };

  /**
   * Add a member to the organization
   */
  readonly addMember = (address: BlockchainAddress) => {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = addMember(address);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      100_000
    );
  };

  /**
   * Remove a member from the organization
   */
  readonly removeMember = (address: BlockchainAddress) => {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = removeMember(address);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      100_000
    );
  };

  /**
   * Add a ballot to the organization
   */
  readonly addBallot = (address: BlockchainAddress) => {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = addBallot(address);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      100_000
    );
  };

  /**
   * Add multiple members to the organization in a single transaction
   */
  readonly addMembers = (addresses: BlockchainAddress[]) => {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = addMembers(addresses);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      200_000
    );
  };

  /**
   * Remove multiple members from the organization in a single transaction
   */
  readonly removeMembers = (addresses: BlockchainAddress[]) => {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = removeMembers(addresses);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      200_000
    );
  };

  /**
   * Update organization metadata
   */
  readonly updateMetadata = (
    name?: string,
    description?: string,
    profileImage?: string,
    bannerImage?: string,
    website?: string,
    xAccount?: string,
    discordServer?: string
  ) => {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = updateMetadata(
      name,
      description,
      profileImage,
      bannerImage,
      website,
      xAccount,
      discordServer
    );

    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      150_000
    );
  };
}
