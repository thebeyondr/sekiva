import { BlockchainAddress } from "@partisiablockchain/abi-client";
import {
  BlockchainTransactionClient,
  SentTransaction,
} from "@partisiablockchain/blockchain-api-transaction-client";
import { RealZkClient } from "@partisiablockchain/zk-client";
import {
  BallotState,
  BallotStatusD,
  Tally,
  initialize,
  deserializeState,
  castVote,
  computeTally,
  setVoteActive,
} from "./BallotGenerated";
import { CLIENT } from "@/AppState";

type ContractError = {
  message?: string;
  code?: string;
};

export class BallotApi {
  private readonly transactionClient: BlockchainTransactionClient | undefined;
  private readonly zkClient: RealZkClient;
  private readonly sender: BlockchainAddress;
  private readonly address: BlockchainAddress;

  constructor(
    transactionClient: BlockchainTransactionClient | undefined,
    zkClient: RealZkClient,
    sender: BlockchainAddress,
    address: BlockchainAddress
  ) {
    this.transactionClient = transactionClient;
    this.zkClient = zkClient;
    this.sender = sender;
    this.address = address;
  }

  async getState(): Promise<BallotState> {
    const response = await fetch(
      `https://node1.testnet.partisiablockchain.com/shards/Shard2/blockchain/contracts/${this.address.asString()}`
    ).then((res) => res.json());

    if (!response?.serializedContract?.openState?.openState?.data) {
      throw new Error("No contract data");
    }

    console.log({ ballotContractData: response });

    const stateBuffer = Buffer.from(
      response.serializedContract.openState.openState.data,
      "base64"
    );
    const state = deserializeState(stateBuffer);
    console.log({ ballotState: state });
    return state;
  }

  async initialize(
    options: string[],
    title: string,
    description: string,
    organization: BlockchainAddress
  ): Promise<void> {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    try {
      const rpc = initialize(options, title, description, organization);
      await this.transactionClient.signAndSend(
        { address: this.address.asString(), rpc },
        100_000
      );
    } catch (error: unknown) {
      const err = error as ContractError;
      throw new Error(
        `Failed to initialize ballot: ${err?.message || "Unknown error"}`
      );
    }
  }

  async computeTally(): Promise<void> {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    try {
      const rpc = computeTally();
      await this.transactionClient.signAndSend(
        { address: this.address.asString(), rpc },
        100_000
      );
    } catch (error: unknown) {
      const err = error as ContractError;
      throw new Error(
        `Failed to compute tally: ${err?.message || "Unknown error"}`
      );
    }
  }

  async setVoteActive(): Promise<void> {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    try {
      const rpc = setVoteActive();
      await this.transactionClient.signAndSend(
        { address: this.address.asString(), rpc },
        100_000
      );
    } catch (error: unknown) {
      const err = error as ContractError;
      throw new Error(
        `Failed to set vote active: ${err?.message || "Unknown error"}`
      );
    }
  }

  async castVote(choice: number): Promise<SentTransaction> {
    if (this.transactionClient === undefined) {
      throw new Error("No account logged in");
    }

    try {
      const castVoteSecretInputBuilder = castVote();
      const secretInput = castVoteSecretInputBuilder.secretInput(choice);
      const transaction = await this.zkClient.buildOnChainInputTransaction(
        this.sender.asString(),
        secretInput.secretInput,
        secretInput.publicRpc
      );

      return this.transactionClient.signAndSend(transaction, 100_000);
    } catch (error: unknown) {
      const err = error as ContractError;
      throw new Error(
        `Failed to cast vote: ${err?.message || "Unknown error"}`
      );
    }
  }

  // Helper methods
  isActive(state: BallotState): boolean {
    return state.status?.discriminant === BallotStatusD.Active;
  }

  isCompleted(state: BallotState): boolean {
    return state.status?.discriminant === BallotStatusD.Completed;
  }

  isCancelled(state: BallotState): boolean {
    return state.status?.discriminant === BallotStatusD.Cancelled;
  }

  hasVoted(state: BallotState, voter: BlockchainAddress): boolean {
    // @ts-expect-error - equals method exists on runtime but not in types
    return state.voters.some((v) => v.equals(voter));
  }

  getVoteCount(state: BallotState): number {
    return state.voters.length;
  }

  getTallyResults(state: BallotState): Tally | undefined {
    return state.tally;
  }

  getOptionVotes(state: BallotState, optionIndex: number): number {
    if (!state.tally) return 0;
    switch (optionIndex) {
      case 0:
        return state.tally.option0;
      case 1:
        return state.tally.option1;
      case 2:
        return state.tally.option2;
      case 3:
        return state.tally.option3;
      case 4:
        return state.tally.option4;
      default:
        return 0;
    }
  }

  getWinningOption(state: BallotState): number | undefined {
    if (!state.tally) return undefined;
    const votes = [
      state.tally.option0,
      state.tally.option1,
      state.tally.option2,
      state.tally.option3,
      state.tally.option4,
    ];
    const maxVotes = Math.max(...votes);
    if (maxVotes === 0) return undefined;
    return votes.indexOf(maxVotes);
  }
}
