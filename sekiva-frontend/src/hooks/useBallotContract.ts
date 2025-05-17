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

// Create a transaction client for the given account
const createTxClient = (account: SenderAuthentication) =>
  BlockchainTransactionClient.create(TESTNET_URL, account);

// Create a ZK client for the ballot contract
const createZkClient = (ballotAddress: string) =>
  RealZkClient.create(ballotAddress, new Client(TESTNET_URL));

// Core hook for ballot contract operations
export function useBallotContract() {
  const { account, walletAddress } = useAuth();

  const checkWalletConnected = (ballotAddress: string) => {
    if (!account || !walletAddress) {
      console.log("[useBallotContract] Missing dependencies:", {
        hasAccount: !!account,
        hasWalletAddress: !!walletAddress,
        accountAddress: account?.getAddress(),
        walletAddress,
        ballotAddress,
      });
      throw new Error("Wallet not connected");
    }
    return { account, walletAddress };
  };

  return {
    // Get ballot state from the blockchain
    getState: (ballotAddress: BallotId) => getBallotState(ballotAddress),

    // Cast a vote in a ballot
    castVote: async (ballotAddress: BallotId, choice: number) => {
      try {
        const { account, walletAddress } = checkWalletConnected(ballotAddress);
        const txClient = createTxClient(account);
        const zkClient = createZkClient(ballotAddress);

        const castVoteSecretInputBuilder = castVote();
        const secretInput = castVoteSecretInputBuilder.secretInput(choice);
        const transaction = await zkClient.buildOnChainInputTransaction(
          walletAddress,
          secretInput.secretInput,
          secretInput.publicRpc
        );
        return txClient.signAndSend(transaction, 100_000);
      } catch (error) {
        const err = error as Error;
        throw new Error(
          `Failed to cast vote: ${err?.message || "Unknown error"}`
        );
      }
    },

    // Set a ballot to active state
    setBallotActive: async (ballotAddress: BallotId) => {
      try {
        const { account } = checkWalletConnected(ballotAddress);
        const txClient = createTxClient(account);
        const rpc = setVoteActive();
        return txClient.signAndSend({ address: ballotAddress, rpc }, 50_000);
      } catch (error) {
        const err = error as Error;
        throw new Error(
          `Failed to set ballot active: ${err?.message || "Unknown error"}`
        );
      }
    },

    // Compute tally for a ballot
    computeTally: async (ballotAddress: BallotId) => {
      try {
        const { account } = checkWalletConnected(ballotAddress);
        const txClient = createTxClient(account);
        const rpc = computeTally();
        return txClient.signAndSend({ address: ballotAddress, rpc }, 100_000);
      } catch (error) {
        const err = error as Error;
        throw new Error(
          `Failed to compute tally: ${err?.message || "Unknown error"}`
        );
      }
    },

    // Cancel a ballot
    cancelBallot: async (ballotAddress: BallotId) => {
      try {
        const { account } = checkWalletConnected(ballotAddress);
        const txClient = createTxClient(account);
        const rpc = cancelBallot();
        return txClient.signAndSend({ address: ballotAddress, rpc }, 50_000);
      } catch (error) {
        const err = error as Error;
        throw new Error(
          `Failed to cancel ballot: ${err?.message || "Unknown error"}`
        );
      }
    },

    // Sync voters for a ballot
    syncVoters: async (
      ballotAddress: BallotId,
      voters: BlockchainAddress[]
    ) => {
      try {
        const { account } = checkWalletConnected(ballotAddress);
        const txClient = createTxClient(account);
        const rpc = syncVoters(voters);
        return txClient.signAndSend({ address: ballotAddress, rpc }, 100_000);
      } catch (error) {
        const err = error as Error;
        throw new Error(
          `Failed to sync voters: ${err?.message || "Unknown error"}`
        );
      }
    },
  };
}

// React Query mutation hooks that use the base hook
export function useSetBallotActive() {
  const ballotContract = useBallotContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ballotAddress: string) => {
      console.log("Setting ballot active");
      const txn = await ballotContract.setBallotActive(ballotAddress);
      console.log("Ballot set active with txn", txn);
      return txn;
    },
    onSuccess: (_, ballotAddress) => {
      queryClient.invalidateQueries({ queryKey: ["ballot", ballotAddress] });
    },
  });
}

export function useCastVote() {
  const ballotContract = useBallotContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ballotAddress,
      choice,
    }: {
      ballotAddress: string;
      choice: number;
    }) => {
      console.log("Casting vote");
      const txn = await ballotContract.castVote(ballotAddress, choice);
      console.log("Vote cast with txn", txn);
      return txn;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ballot", variables.ballotAddress],
      });
    },
  });
}

export function useComputeTally() {
  const ballotContract = useBallotContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ballotAddress: string) => {
      console.log("Computing tally");
      const txn = await ballotContract.computeTally(ballotAddress);
      console.log("Tally computation initiated with txn", txn);
      return txn;
    },
    onSuccess: (_, ballotAddress) => {
      queryClient.invalidateQueries({ queryKey: ["ballot", ballotAddress] });
    },
  });
}

export function useCancelBallot() {
  const ballotContract = useBallotContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ballotAddress: string) => {
      console.log("Cancelling ballot");
      const txn = await ballotContract.cancelBallot(ballotAddress);
      console.log("Ballot cancelled with txn", txn);
      return txn;
    },
    onSuccess: (_, ballotAddress) => {
      queryClient.invalidateQueries({ queryKey: ["ballot", ballotAddress] });
    },
  });
}

export function useSyncVoters() {
  const ballotContract = useBallotContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ballotAddress,
      voters,
    }: {
      ballotAddress: string;
      voters: BlockchainAddress[];
    }) => {
      console.log("Syncing voters");
      const txn = await ballotContract.syncVoters(ballotAddress, voters);
      console.log("Voters synced with txn", txn);
      return txn;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ballot", variables.ballotAddress],
      });
    },
  });
}
