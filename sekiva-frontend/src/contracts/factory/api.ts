import {
  deserializeState,
  SekivaFactoryState,
  deployOrganization,
  deployBallot,
  OrganizationInfo,
} from "./generated";

import { BlockchainTransactionClient } from "@partisiablockchain/blockchain-api-transaction-client";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { ShardedClient } from "@/client/ShardedClient";

export interface SekivaFactoryBasicState {
  admin: BlockchainAddress;
  organizations: BlockchainAddress[];
  ballots: BlockchainAddress[];
  userOrgMemberships: Map<BlockchainAddress, BlockchainAddress[]>;
  organizationBallots: Map<BlockchainAddress, BlockchainAddress[]>;
}

/**
 * API for the Sekiva Factory contract.
 *
 * The implementation uses the TransactionApi to send transactions, and ABI for the contract to be
 * able to build the RPC for transactions.
 */
export class SekivaFactoryApi {
  private readonly transactionClient: BlockchainTransactionClient | undefined;
  private readonly client: ShardedClient;
  private readonly contractAddress: BlockchainAddress;

  constructor(
    shardedClient: ShardedClient,
    transactionClient: BlockchainTransactionClient | undefined
    // contractAddress: BlockchainAddress
  ) {
    this.transactionClient = transactionClient;
    this.client = shardedClient;
    this.contractAddress = BlockchainAddress.fromString(
      "0215e54b707bd575ca32e4ab6be5790735661e0e33"
    );
  }

  private getState(): Promise<SekivaFactoryState> {
    const contractAddressStr = this.contractAddress.asString();

    console.log(`Fetching contract data for address: ${contractAddressStr}`);

    // Use the correct endpoint pattern
    return this.client
      .getContractData(contractAddressStr, true)
      .then((contract) => {
        if (contract == null) {
          throw new Error("Could not find data for contract");
        }

        console.log("Contract data retrieved:", contract);

        // Define a type that includes potentially missing properties
        interface ExtendedContractData {
          serializedContract?: unknown;
          state?: {
            admin?: string;
            organizations?: string[];
            ballots?: string[];
            userOrgMemberships?: Record<string, string[]>;
            organizationBallots?: Record<string, string[]>;
            [key: string]: unknown;
          };
          [key: string]: unknown;
        }

        // Cast to our extended type - first cast to unknown to avoid TypeScript errors
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
              // If we got serializedContract as an object with data field (often happens in browser environments)
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

            // Use the generated deserializeState function directly
            const state = deserializeState(stateBuffer);
            console.log("Successfully deserialized state:", state);

            // Log organizations for debugging
            if (state.organizations && state.organizations.length > 0) {
              console.log(`Found ${state.organizations.length} organizations:`);
              state.organizations.forEach((org, i) => {
                console.log(`  ${i}: ${org.asString()}`);
              });
            } else {
              console.log("No organizations found in state");
            }

            return state;
          } catch (error) {
            console.error("Error deserializing contract state:", error);

            // If deserialization fails, try the state field directly
            if (extendedContract.state) {
              return this.createStateFromDirectData(extendedContract.state);
            }
          }
        } else if (extendedContract.state) {
          // If we have a direct state field, use it
          return this.createStateFromDirectData(extendedContract.state);
        }

        console.log("No usable contract state found, using minimal state");
        return this.createMinimalState();
      })
      .catch((error) => {
        console.error("Error fetching contract state:", error);
        console.log("Using minimal fallback state");
        return this.createMinimalState();
      });
  }

  /**
   * Helper method to create a state object from direct API state data
   */
  private createStateFromDirectData(stateData: {
    admin?: string;
    organizations?: string[];
    ballots?: string[];
    userOrgMemberships?: Record<string, string[]>;
    organizationBallots?: Record<string, string[]>;
    [key: string]: unknown;
  }): SekivaFactoryState {
    console.log("Creating state from direct state data:", stateData);

    try {
      // Convert string addresses to BlockchainAddress objects
      const organizations = Array.isArray(stateData.organizations)
        ? stateData.organizations.map((addr: string) =>
            BlockchainAddress.fromString(addr)
          )
        : [];

      // Create a state object with the data from the API
      const state: SekivaFactoryState = {
        admin: stateData.admin
          ? BlockchainAddress.fromString(stateData.admin)
          : this.contractAddress,
        organizations: organizations || [],
        ballots: Array.isArray(stateData.ballots)
          ? stateData.ballots.map((addr: string) =>
              BlockchainAddress.fromString(addr)
            )
          : [],
        userOrgMemberships: new Map(),
        organizationBallots: new Map(),
        ballotContractZkwa: Buffer.from([]),
        ballotContractAbi: Buffer.from([]),
        organizationContractWasm: Buffer.from([]),
        organizationContractAbi: Buffer.from([]),
      };

      // Try to convert maps if they exist
      if (stateData.userOrgMemberships) {
        try {
          Object.entries(stateData.userOrgMemberships).forEach(
            ([key, value]) => {
              const address = BlockchainAddress.fromString(key);
              const orgs = Array.isArray(value)
                ? value.map((addr: string) =>
                    BlockchainAddress.fromString(addr)
                  )
                : [];
              state.userOrgMemberships.set(address, orgs);
            }
          );
        } catch (mapErr) {
          console.error("Error processing userOrgMemberships map:", mapErr);
        }
      }

      // Same for organization ballots
      if (stateData.organizationBallots) {
        try {
          Object.entries(stateData.organizationBallots).forEach(
            ([key, value]) => {
              const address = BlockchainAddress.fromString(key);
              const ballots = Array.isArray(value)
                ? value.map((addr: string) =>
                    BlockchainAddress.fromString(addr)
                  )
                : [];
              state.organizationBallots.set(address, ballots);
            }
          );
        } catch (mapErr) {
          console.error("Error processing organizationBallots map:", mapErr);
        }
      }

      console.log("Created state from direct API data:", state);
      return state;
    } catch (error) {
      console.error("Error creating state from direct data:", error);
      return this.createMinimalState();
    }
  }

  // Fallback method to get state from the JSON API
  private getStateFromJSONAPI(): Promise<SekivaFactoryState> {
    const contractAddressStr = this.contractAddress.asString();
    const baseUrl = "https://node1.testnet.partisiablockchain.com";
    const url = `${baseUrl}/blockchain/contracts/${contractAddressStr}?requireContractState=true`;

    console.log(`Falling back to JSON API: ${url}`);

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

            const state = contractData.state;
            if (
              "organizations" in state &&
              Array.isArray(state.organizations)
            ) {
              console.log(
                "Found organizations array in JSON state:",
                state.organizations
              );

              // Convert string addresses to BlockchainAddress objects
              const organizations = state.organizations.map((addr: string) =>
                BlockchainAddress.fromString(addr)
              );

              // Create a state object with the data from the API
              const factoryState: SekivaFactoryState = {
                admin: BlockchainAddress.fromString(
                  state.admin || this.contractAddress.asString()
                ),
                organizations: organizations || [],
                ballots: (state.ballots || []).map((addr: string) =>
                  BlockchainAddress.fromString(addr)
                ),
                userOrgMemberships: new Map(),
                organizationBallots: new Map(),
                ballotContractZkwa: Buffer.from([]),
                ballotContractAbi: Buffer.from([]),
                organizationContractWasm: Buffer.from([]),
                organizationContractAbi: Buffer.from([]),
              };

              // Try to convert maps if they exist
              if ("userOrgMemberships" in state && state.userOrgMemberships) {
                try {
                  Object.entries(state.userOrgMemberships).forEach(
                    ([key, value]) => {
                      const address = BlockchainAddress.fromString(key);
                      const orgs = Array.isArray(value)
                        ? value.map((addr: string) =>
                            BlockchainAddress.fromString(addr)
                          )
                        : [];
                      factoryState.userOrgMemberships.set(address, orgs);
                    }
                  );
                } catch (mapErr) {
                  console.error(
                    "Error processing userOrgMemberships map:",
                    mapErr
                  );
                }
              }

              // Same for organization ballots
              if ("organizationBallots" in state && state.organizationBallots) {
                try {
                  Object.entries(state.organizationBallots).forEach(
                    ([key, value]) => {
                      const address = BlockchainAddress.fromString(key);
                      const ballots = Array.isArray(value)
                        ? value.map((addr: string) =>
                            BlockchainAddress.fromString(addr)
                          )
                        : [];
                      factoryState.organizationBallots.set(address, ballots);
                    }
                  );
                } catch (mapErr) {
                  console.error(
                    "Error processing organizationBallots map:",
                    mapErr
                  );
                }
              }

              console.log("Created state from JSON API data:", factoryState);
              return factoryState;
            }
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

  private createMinimalState(): SekivaFactoryState {
    // Create a minimal state as fallback
    return {
      admin: this.contractAddress,
      organizations: [],
      ballots: [],
      userOrgMemberships: new Map(),
      organizationBallots: new Map(),
      ballotContractZkwa: Buffer.from([]),
      ballotContractAbi: Buffer.from([]),
      organizationContractWasm: Buffer.from([]),
      organizationContractAbi: Buffer.from([]),
    };
  }

  /**
   * Determines the basic state of the contract.
   */
  public basicState(): Promise<SekivaFactoryBasicState> {
    return this.getState();
  }

  /**
   * Build and send deployOrganization transaction.
   */
  readonly deployOrganization = (orgInfo: OrganizationInfo) => {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    // First build the RPC buffer that is the payload of the transaction.
    const rpc = deployOrganization(orgInfo);
    // Then send the payload via the transaction API.
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      1_000_000
    );
  };

  /**
   * Build and send deployBallot transaction.
   */
  readonly deployBallot = (
    options: string[],
    title: string,
    description: string,
    organization: BlockchainAddress
  ) => {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    // First build the RPC buffer that is the payload of the transaction.
    const rpc = deployBallot(options, title, description, organization);
    // Then send the payload via the transaction API.
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      1_000_000
    );
  };

  // /**
  //  * Build and send initialize transaction.
  //  */
  //   readonly initializeContract = (
  //     ballotContractZkwa: Buffer,
  //     ballotContractAbi: Buffer,
  //     organizationContractWasm: Buffer,
  //     organizationContractAbi: Buffer
  //   ) => {
  //     if (this.transactionClient === undefined) {
  //       throw new Error("No account logged in");
  //     }

  //     // First build the RPC buffer that is the payload of the transaction.
  //     const rpc = initialize(
  //       ballotContractZkwa,
  //       ballotContractAbi,
  //       organizationContractWasm,
  //       organizationContractAbi
  //     );
  //     // Then send the payload via the transaction API.
  //     return this.transactionClient.signAndSend(
  //       { address: this.contractAddress.asString(), rpc },
  //       100_000
  //     );
  //   };
}
