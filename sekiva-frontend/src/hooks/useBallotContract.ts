import { useAuth } from "@/auth/useAuth";
import { TESTNET_URL, SHARD_PRIORITY } from "@/partisia-config";
import {
  BallotState,
  castVote,
  deserializeState,
  setVoteActive,
  computeTally,
  syncVoters,
  cancelBallot,
} from "@/contracts/BallotGenerated";
import { ShardId } from "@/partisia-config";
import {
  BlockchainTransactionClient,
  SenderAuthentication,
  SentTransaction,
} from "@partisiablockchain/blockchain-api-transaction-client";
import { Client, RealZkClient } from "@partisiablockchain/zk-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BlockchainAddress } from "@partisiablockchain/abi-client";

export type BallotId = string;

export type Ballot = BallotState & {
  lastUpdated: number;
  shardId: ShardId;
};

const fetchBallotFromShard = async (
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

const getBallotState = async (id: BallotId): Promise<Ballot> => {
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

interface BallotClient {
  getState: () => Promise<Ballot>;
  castVote: (choice: number) => Promise<SentTransaction>;
  setBallotActive: () => Promise<SentTransaction>;
  computeTally: () => Promise<SentTransaction>;
  cancelBallot: () => Promise<SentTransaction>;
  syncVoters: (voters: BlockchainAddress[]) => Promise<SentTransaction>;
}

const createBallotClientForAddress = (
  ballotAddress: BallotId,
  account: SenderAuthentication,
  walletAddress: string
): BallotClient => {
  const transactionClient = BlockchainTransactionClient.create(
    TESTNET_URL,
    account
  );
  const zkClient = RealZkClient.create(ballotAddress, new Client(TESTNET_URL));

  return {
    getState: () => getBallotState(ballotAddress),
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
        const err = error as Error;
        throw new Error(
          `Failed to cast vote: ${err?.message || "Unknown error"}`
        );
      }
    },
    setBallotActive: async (): Promise<SentTransaction> => {
      try {
        const rpc = setVoteActive();
        return transactionClient.signAndSend(
          { address: ballotAddress, rpc },
          50_000
        );
      } catch (error: unknown) {
        const err = error as Error;
        throw new Error(
          `Failed to set ballot active: ${err?.message || "Unknown error"}`
        );
      }
    },
    computeTally: async (): Promise<SentTransaction> => {
      try {
        const rpc = computeTally();
        return transactionClient.signAndSend(
          { address: ballotAddress, rpc },
          100_000
        );
      } catch (error: unknown) {
        const err = error as Error;
        throw new Error(
          `Failed to compute tally: ${err?.message || "Unknown error"}`
        );
      }
    },
    cancelBallot: async (): Promise<SentTransaction> => {
      try {
        const rpc = cancelBallot();
        return transactionClient.signAndSend(
          { address: ballotAddress, rpc },
          50_000
        );
      } catch (error: unknown) {
        const err = error as Error;
        throw new Error(
          `Failed to cancel ballot: ${err?.message || "Unknown error"}`
        );
      }
    },
    syncVoters: async (
      voters: BlockchainAddress[]
    ): Promise<SentTransaction> => {
      try {
        const rpc = syncVoters(voters);
        return transactionClient.signAndSend(
          { address: ballotAddress, rpc },
          100_000
        );
      } catch (error: unknown) {
        const err = error as Error;
        throw new Error(
          `Failed to sync voters: ${err?.message || "Unknown error"}`
        );
      }
    },
  };
};

export function useBallotContract() {
  const { account, walletAddress } = useAuth();

  const getBallotClient = (address: BallotId) => {
    if (!account || !walletAddress) {
      console.log("[useBallotContract] Missing dependencies:", {
        hasAccount: !!account,
        hasWalletAddress: !!walletAddress,
        accountAddress: account?.getAddress(),
        walletAddress,
        address,
      });
      throw new Error("Wallet not connected");
    }
    return createBallotClientForAddress(address, account, walletAddress);
  };

  return {
    getState: (ballotAddress: BallotId) => getBallotState(ballotAddress),
    castVote: async (ballotAddress: BallotId, choice: number) => {
      const client = getBallotClient(ballotAddress);
      return client.castVote(choice);
    },
    setBallotActive: async (ballotAddress: BallotId) => {
      const client = getBallotClient(ballotAddress);
      return client.setBallotActive();
    },
    computeTally: async (ballotAddress: BallotId) => {
      const client = getBallotClient(ballotAddress);
      return client.computeTally();
    },
    cancelBallot: async (ballotAddress: BallotId) => {
      const client = getBallotClient(ballotAddress);
      return client.cancelBallot();
    },
    syncVoters: async (
      ballotAddress: BallotId,
      voters: BlockchainAddress[]
    ) => {
      const client = getBallotClient(ballotAddress);
      return client.syncVoters(voters);
    },
  };
}

export function useSetBallotActive() {
  const { account } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ballotAddress: string) => {
      if (!account) throw new Error("Wallet not connected");
      console.log("Setting ballot active with account", account.getAddress());
      try {
        const txnClient = BlockchainTransactionClient.create(
          TESTNET_URL,
          account
        );
        const rpc = setVoteActive();
        const txn: SentTransaction = await txnClient.signAndSend(
          { address: ballotAddress, rpc },
          100_000
        );
        console.log("Ballot set active with txn", txn);
        return txn;
      } catch (err) {
        throw new Error(
          "Error setting ballot active: " +
            (err instanceof Error ? err.message : String(err))
        );
      }
    },
    onSuccess: (_, ballotAddress) => {
      // Invalidate specific ballot
      queryClient.invalidateQueries({ queryKey: ["ballot", ballotAddress] });
    },
  });
}

export function useComputeTally() {
  const { account } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ballotAddress: string) => {
      if (!account) throw new Error("Wallet not connected");
      console.log("Computing tally with account", account.getAddress());
      try {
        const txnClient = BlockchainTransactionClient.create(
          TESTNET_URL,
          account
        );
        const rpc = computeTally();
        const txn: SentTransaction = await txnClient.signAndSend(
          { address: ballotAddress, rpc },
          100_000
        );
        console.log("Tally computation initiated with txn", txn);
        return txn;
      } catch (err) {
        throw new Error(
          "Error computing tally: " +
            (err instanceof Error ? err.message : String(err))
        );
      }
    },
    onSuccess: (_, ballotAddress) => {
      queryClient.invalidateQueries({ queryKey: ["ballot", ballotAddress] });
    },
  });
}

export function useCancelBallot() {
  const { account } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ballotAddress: string) => {
      if (!account) throw new Error("Wallet not connected");
      console.log("Cancelling ballot with account", account.getAddress());
      try {
        const txnClient = BlockchainTransactionClient.create(
          TESTNET_URL,
          account
        );
        const rpc = cancelBallot();
        const txn: SentTransaction = await txnClient.signAndSend(
          { address: ballotAddress, rpc },
          100_000
        );
        console.log("Ballot cancelled with txn", txn);
        return txn;
      } catch (err) {
        throw new Error(
          "Error cancelling ballot: " +
            (err instanceof Error ? err.message : String(err))
        );
      }
    },
    onSuccess: (_, ballotAddress) => {
      queryClient.invalidateQueries({ queryKey: ["ballot", ballotAddress] });
    },
  });
}

export function useSyncVoters() {
  const { account } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ballotAddress,
      voters,
    }: {
      ballotAddress: string;
      voters: BlockchainAddress[];
    }) => {
      if (!account) throw new Error("Wallet not connected");
      console.log("Syncing voters with account", account.getAddress());
      try {
        const txnClient = BlockchainTransactionClient.create(
          TESTNET_URL,
          account
        );
        const rpc = syncVoters(voters);
        const txn: SentTransaction = await txnClient.signAndSend(
          { address: ballotAddress, rpc },
          100_000
        );
        console.log("Voters synced with txn", txn);
        return txn;
      } catch (err) {
        throw new Error(
          "Error syncing voters: " +
            (err instanceof Error ? err.message : String(err))
        );
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ballot", variables.ballotAddress],
      });
    },
  });
}
