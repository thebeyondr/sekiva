import {
  deserializeState,
  SekivaFactoryState,
  deployOrganization,
  deployBallot,
  OrganizationInfo,
} from "./SekivaFactoryGenerated";

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
 * Client for interacting with the Sekiva Factory contract.
 * Provides convenience methods for interacting with the factory contract.
 */
export class SekivaFactoryClient {
  private readonly transactionClient: BlockchainTransactionClient | undefined;
  private readonly client: ShardedClient;
  private readonly contractAddress: BlockchainAddress;

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
    this.transactionClient = transactionClient;
    this.client = shardedClient;
    this.contractAddress = BlockchainAddress.fromString(
      "022c2353d9d52f50713581b9d5979997a84fdbf38d"
    );
  }

  private _getState(): Promise<SekivaFactoryState> {
    const contractAddressStr = this.contractAddress.asString();

    console.log(`Fetching contract data for address: ${contractAddressStr}`);

    return this.client
      .getContractData(contractAddressStr, true)
      .then((contract) => {
        if (contract == null) {
          throw new Error("Could not find data for contract");
        }

        console.log("Contract data retrieved:", contract);

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
            console.log("Successfully deserialized state:", state);

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

            if (extendedContract.state) {
              return this.createStateFromDirectData(extendedContract.state);
            }
          }
        } else if (extendedContract.state) {
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
      const organizations = Array.isArray(stateData.organizations)
        ? stateData.organizations.map((addr: string) =>
            BlockchainAddress.fromString(addr)
          )
        : [];

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

      if (stateData.organizationBallots) {
        try {
          console.log(
            "Processing organizationBallots from state data:",
            stateData.organizationBallots
          );
          Object.entries(stateData.organizationBallots).forEach(
            ([key, value]) => {
              console.log("Processing org ballot entry:", { key, value });
              try {
                const address = BlockchainAddress.fromString(key);
                const ballots = Array.isArray(value)
                  ? value.map((addr: string) => {
                      console.log("Converting ballot address:", addr);
                      return BlockchainAddress.fromString(addr);
                    })
                  : [];
                console.log(
                  "Setting organization ballots for",
                  address.asString(),
                  ":",
                  ballots.map((b) => b.asString())
                );
                state.organizationBallots.set(address, ballots);
              } catch (err) {
                console.error("Error processing organization ballot entry:", {
                  key,
                  value,
                  error: err,
                });
              }
            }
          );
        } catch (mapErr) {
          console.error("Error processing organizationBallots map:", mapErr);
        }
      } else {
        console.log("No organizationBallots in state data");
      }

      console.log("Created state from direct API data:", state);
      return state;
    } catch (error) {
      console.error("Error creating state from direct data:", error);
      return this.createMinimalState();
    }
  }

  private createMinimalState(): SekivaFactoryState {
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

  // Public API methods
  async getState(): Promise<SekivaFactoryBasicState> {
    return this._getState();
  }

  async getOrganizations(): Promise<BlockchainAddress[]> {
    const state = await this._getState();
    return state.organizations;
  }

  async getBallots(): Promise<BlockchainAddress[]> {
    const state = await this._getState();
    return state.ballots;
  }

  async getUserMemberships(
    address: BlockchainAddress
  ): Promise<BlockchainAddress[]> {
    const state = await this._getState();
    return state.userOrgMemberships.get(address) || [];
  }

  async getOrganizationBallots(
    orgAddress: BlockchainAddress
  ): Promise<BlockchainAddress[]> {
    const state = await this._getState();
    console.log(
      "Factory state organizationBallots map:",
      Array.from(state.organizationBallots.entries()).map(([k, v]) => ({
        key: k.asString(),
        value: v.map((addr) => addr.asString()),
      }))
    );
    console.log("Looking for organization:", orgAddress.asString());

    for (const [key, value] of state.organizationBallots.entries()) {
      console.log("Checking key:", key.asString());
      if (key.asString() === orgAddress.asString()) {
        console.log(
          "Found matching organization, ballots:",
          value.map((addr) => addr.asString())
        );
        return value;
      }
    }
    console.log("No ballots found for organization");
    return [];
  }

  async deployOrganization(orgInfo: OrganizationInfo) {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = deployOrganization(orgInfo);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      1_000_000
    );
  }

  async deployBallot(
    options: string[],
    title: string,
    description: string,
    organization: BlockchainAddress
  ) {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    const rpc = deployBallot(options, title, description, organization);
    return this.transactionClient.signAndSend(
      { address: this.contractAddress.asString(), rpc },
      2_000_000
    );
  }

  static withAccount(
    shardedClient: ShardedClient,
    transactionClient: BlockchainTransactionClient
  ): SekivaFactoryClient {
    return new SekivaFactoryClient(shardedClient, transactionClient);
  }
}
