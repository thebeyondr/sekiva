import {
  BallotState,
  castVote,
  deserializeState,
  setVoteActive,
} from "@/contracts/BallotGenerated";
import { ContractError } from "@/types/contract";
import {
  BlockchainTransactionClient,
  SentTransaction,
} from "@partisiablockchain/blockchain-api-transaction-client";
import { RealZkClient } from "@partisiablockchain/zk-client";
import { SHARD_PRIORITY, ShardId, TESTNET_URL } from "@/partisia-config";

export type BallotId = string;

export type Ballot = BallotState & {
  lastUpdated: number;
  shardId: ShardId;
};

export const fetchBallotFromShard = async (
  id: BallotId,
  shard: ShardId
): Promise<Ballot> => {
  console.log(`[Ballot] Trying shard ${shard} for ballot ${id}`);
  const response = await fetch(
    `${TESTNET_URL}/shards/Shard${shard}/blockchain/contracts/${id}`
  ).then((res) => res.json());

  if (!response?.serializedContract?.openState?.openState?.data) {
    console.log(`[Ballot] No data from shard ${shard}:`, response);
    throw new Error(`No contract data from shard ${shard}`);
  }

  console.log(`[Ballot] Success from shard ${shard}`);
  const stateBuffer = Buffer.from(
    response.serializedContract.openState.openState.data,
    "base64"
  );
  const state = deserializeState(stateBuffer);
  return { ...state, lastUpdated: Date.now(), shardId: shard };
};

export const getBallotState = async (id: BallotId): Promise<Ballot> => {
  let lastError: Error | null = null;

  for (const shard of SHARD_PRIORITY) {
    try {
      const ballot = await fetchBallotFromShard(id, shard);
      console.log(`[Ballot] Using data from shard ${shard} for ballot ${id}`);
      return ballot;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.log(`[Ballot] Failed shard ${shard}:`, err);
      if (shard === SHARD_PRIORITY[SHARD_PRIORITY.length - 1]) throw lastError;
    }
  }
  throw lastError;
};

export interface BallotClient {
  getState: () => Promise<Ballot>;
  castVote: (choice: number) => Promise<SentTransaction>;
  setBallotActive: () => Promise<SentTransaction>;
}

export const createBallotClient = (
  contractAddress: BallotId,
  transactionClient: BlockchainTransactionClient,
  zkClient: RealZkClient,
  walletAddress: string
): BallotClient => ({
  getState: () => getBallotState(contractAddress),
  castVote: async (choice: number): Promise<SentTransaction> => {
    try {
      const castVoteSecretInputBuilder = castVote();
      const secretInput = castVoteSecretInputBuilder.secretInput(choice);
      const transaction = await zkClient.buildOnChainInputTransaction(
        walletAddress,
        secretInput.secretInput,
        secretInput.publicRpc
      );
      return transactionClient.signAndSend(transaction, 100_000);
    } catch (error: unknown) {
      const err = error as ContractError;
      throw new Error(
        `Failed to cast vote: ${err?.message || "Unknown error"}`
      );
    }
  },
  setBallotActive: async () => {
    if (!transactionClient) {
      throw new Error("No transaction client");
    }
    try {
      const rpc = setVoteActive();
      return transactionClient.signAndSend(
        { address: contractAddress, rpc },
        50_000
      );
    } catch (error: unknown) {
      const err = error as ContractError;
      throw new Error(
        `Failed to set ballot active: ${err?.message || "Unknown error"}`
      );
    }
  },
});
