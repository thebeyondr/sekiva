import { useAuth } from "@/auth/useAuth";
import { TESTNET_URL, SHARD_PRIORITY, ShardId } from "@/partisia-config";
import {
  BallotState,
  deserializeState,
  castVote,
  computeTally,
  cancelBallot,
  syncVoters,
} from "@/contracts/BallotGenerated";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import {
  BlockchainTransactionClient,
  SentTransaction,
} from "@partisiablockchain/blockchain-api-transaction-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export type Ballot = BallotState & {
  lastUpdated: number;
  shardId: ShardId;
};

const fetchBallotFromShard = async (
  id: string,
  shard: ShardId
): Promise<Ballot> => {
  const response = await fetch(
    `${TESTNET_URL}/shards/${shard}/blockchain/contracts/${id}`
  ).then((res) => res.json());

  if (!response?.serializedContract?.openState?.openState?.data) {
    throw new Error(`No contract data from ${shard}`);
  }

  const stateBuffer = Buffer.from(
    response.serializedContract.openState.openState.data,
    "base64"
  );
  const state = deserializeState(stateBuffer);
  return { ...state, lastUpdated: Date.now(), shardId: shard };
};

export const getBallotState = async (id: string): Promise<Ballot> => {
  let lastError: Error | null = null;

  for (const shard of SHARD_PRIORITY) {
    try {
      const ballot = await fetchBallotFromShard(id, shard);
      return ballot;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (shard === SHARD_PRIORITY[SHARD_PRIORITY.length - 1]) {
        throw lastError;
      }
      continue;
    }
  }
  throw lastError;
};

export function useBallotContract() {
  const { account, walletAddress } = useAuth();

  const getState = async (id: string): Promise<Ballot> => {
    return getBallotState(id);
  };

  const castVoteFn = async (
    ballotAddress: string,
    choice: number
  ): Promise<SentTransaction> => {
    if (!account) throw new Error("Wallet not connected");
    const txClient = BlockchainTransactionClient.create(TESTNET_URL, account);
    const rpc = castVote();
    const secretInput = rpc.secretInput(choice);
    return txClient.signAndSend(
      { address: ballotAddress, rpc: secretInput.publicRpc },
      100_000
    );
  };

  const computeTallyFn = async (
    ballotAddress: string
  ): Promise<SentTransaction> => {
    if (!account) throw new Error("Wallet not connected");
    const txClient = BlockchainTransactionClient.create(TESTNET_URL, account);
    const rpc = computeTally();
    return txClient.signAndSend({ address: ballotAddress, rpc }, 100_000);
  };

  const cancelBallotFn = async (
    ballotAddress: string
  ): Promise<SentTransaction> => {
    if (!account) throw new Error("Wallet not connected");
    const txClient = BlockchainTransactionClient.create(TESTNET_URL, account);
    const rpc = cancelBallot();
    return txClient.signAndSend({ address: ballotAddress, rpc }, 100_000);
  };

  const syncVotersFn = async (
    ballotAddress: string,
    voters: BlockchainAddress[]
  ): Promise<SentTransaction> => {
    if (!account) throw new Error("Wallet not connected");
    const txClient = BlockchainTransactionClient.create(TESTNET_URL, account);
    const rpc = syncVoters(voters);
    return txClient.signAndSend({ address: ballotAddress, rpc }, 100_000);
  };

  return useMemo(
    () => ({
      getState,
      castVote: castVoteFn,
      computeTally: computeTallyFn,
      cancelBallot: cancelBallotFn,
      syncVoters: syncVotersFn,
    }),
    [account, walletAddress]
  );
}

// React Query mutation hooks that use the base hook
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
      const txn = await ballotContract.castVote(ballotAddress, choice);
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
      const txn = await ballotContract.computeTally(ballotAddress);
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
      const txn = await ballotContract.cancelBallot(ballotAddress);
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
      const txn = await ballotContract.syncVoters(ballotAddress, voters);
      return txn;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ballot", variables.ballotAddress],
      });
    },
  });
}
