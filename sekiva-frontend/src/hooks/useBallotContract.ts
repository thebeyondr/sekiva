import { useAuth } from "@/auth/useAuth";
import { TESTNET_URL, SHARD_PRIORITY, ShardId } from "@/partisia-config";
import {
  BallotState,
  deserializeState,
  computeTally,
  cancelBallot,
  syncVoters,
} from "@/contracts/BallotGenerated";
import {
  BlockchainAddress,
  AbiBitOutput,
} from "@partisiablockchain/abi-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTransaction } from "./useTransaction";

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
  const { account } = useAuth();
  const { sendTransaction } = useTransaction();
  const queryClient = useQueryClient();

  const castVoteMutation = useMutation({
    mutationFn: async ({
      ballotAddress,
      choice,
    }: {
      ballotAddress: string;
      choice: number;
    }) => {
      if (!account) throw new Error("Wallet not connected");

      const secretInputData = AbiBitOutput.serialize((_out) => {
        _out.writeI8(choice);
      });

      return sendTransaction({
        type: "secret",
        address: ballotAddress,
        secretInput: secretInputData,
        publicRpc: Buffer.from("60", "hex"),
        gasCost: 100_000,
      });
    },
    onSuccess: (_, { ballotAddress }) => {
      queryClient.invalidateQueries({ queryKey: ["ballot", ballotAddress] });
    },
  });

  const computeTallyMutation = useMutation({
    mutationFn: async (ballotAddress: string) => {
      if (!account) throw new Error("Wallet not connected");
      const rpc = computeTally();
      return sendTransaction({
        type: "regular",
        address: ballotAddress,
        rpc,
        gasCost: 100_000,
      });
    },
    onSuccess: (_, ballotAddress) => {
      queryClient.invalidateQueries({ queryKey: ["ballot", ballotAddress] });
    },
  });

  const cancelBallotMutation = useMutation({
    mutationFn: async (ballotAddress: string) => {
      if (!account) throw new Error("Wallet not connected");
      const rpc = cancelBallot();
      return sendTransaction({
        type: "regular",
        address: ballotAddress,
        rpc,
        gasCost: 100_000,
      });
    },
    onSuccess: (_, ballotAddress) => {
      queryClient.invalidateQueries({ queryKey: ["ballot", ballotAddress] });
    },
  });

  const syncVotersMutation = useMutation({
    mutationFn: async ({
      ballotAddress,
      voters,
    }: {
      ballotAddress: string;
      voters: BlockchainAddress[];
    }) => {
      if (!account) throw new Error("Wallet not connected");
      const rpc = syncVoters(voters);
      return sendTransaction({
        type: "regular",
        address: ballotAddress,
        rpc,
        gasCost: 100_000,
      });
    },
    onSuccess: (_, { ballotAddress }) => {
      queryClient.invalidateQueries({ queryKey: ["ballot", ballotAddress] });
    },
  });

  return useMemo(
    () => ({
      getState: getBallotState,
      castVote: (ballotAddress: string, choice: number) =>
        castVoteMutation.mutateAsync({ ballotAddress, choice }),
      computeTally: (ballotAddress: string) =>
        computeTallyMutation.mutateAsync(ballotAddress),
      cancelBallot: (ballotAddress: string) =>
        cancelBallotMutation.mutateAsync(ballotAddress),
      syncVoters: (ballotAddress: string, voters: BlockchainAddress[]) =>
        syncVotersMutation.mutateAsync({ ballotAddress, voters }),
    }),
    [
      castVoteMutation,
      computeTallyMutation,
      cancelBallotMutation,
      syncVotersMutation,
    ]
  );
}

// React Query mutation hooks that use the base hook
export function useCastVote() {
  const ballotContract = useBallotContract();
  const queryClient = useQueryClient();
  const { requiresWalletConnection } = useTransaction();

  const mutation = useMutation({
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

  return {
    ...mutation,
    requiresWalletConnection,
  };
}

export function useComputeTally() {
  const ballotContract = useBallotContract();
  const queryClient = useQueryClient();
  const { requiresWalletConnection } = useTransaction();

  const mutation = useMutation({
    mutationFn: async (ballotAddress: string) => {
      const txn = await ballotContract.computeTally(ballotAddress);
      return txn;
    },
    onSuccess: (_, ballotAddress) => {
      queryClient.invalidateQueries({ queryKey: ["ballot", ballotAddress] });
    },
  });

  return {
    ...mutation,
    requiresWalletConnection,
  };
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
