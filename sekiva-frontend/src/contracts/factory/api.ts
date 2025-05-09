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
import { safelyGetState, ContractWithState } from "@/client/ContractUtils";

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
    // The format expected by ShardedClient.getContractData is the address string directly
    return this.client
      .getContractData<string>(this.contractAddress.asString(), true)
      .then((contract) => {
        if (contract == null) {
          throw new Error("Could not find data for contract");
        }

        // Log the contract data to inspect structure
        console.log("Contract data keys:", Object.keys(contract));

        // Use the utility function to safely get state with contract as unknown type
        return safelyGetState<SekivaFactoryState>(
          contract as unknown as ContractWithState,
          (buffer) => deserializeState(buffer),
          () => this.createMinimalState()
        );
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
      100_000
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
      100_000
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
