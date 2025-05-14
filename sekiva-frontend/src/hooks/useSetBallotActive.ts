import { TESTNET_URL } from "@/AppState";
import { useAuth } from "@/auth/useAuth";
import { BallotId, createBallotClient } from "@/lib/ballot";
import { BlockchainTransactionClient } from "@partisiablockchain/blockchain-api-transaction-client";
import { Client, RealZkClient } from "@partisiablockchain/zk-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useSetBallotActive(ballotAddress: BallotId) {
  const queryClient = useQueryClient();
  const { isConnected, account } = useAuth();
  const [ballotClient, setBallotClient] = useState<
    ReturnType<typeof createBallotClient> | undefined
  >(undefined);

  useEffect(() => {
    if (!account || !isConnected) {
      setBallotClient(undefined);
      return;
    }
    const zkClient = RealZkClient.create(
      ballotAddress,
      new Client(TESTNET_URL)
    );
    const transactionClient = BlockchainTransactionClient.create(
      TESTNET_URL,
      account
    );
    setBallotClient(
      createBallotClient(
        ballotAddress,
        transactionClient,
        zkClient,
        account.getAddress()
      )
    );
  }, [account, ballotAddress, isConnected]);

  return useMutation({
    mutationFn: async () => {
      if (!ballotClient) throw new Error("Not connected");
      return ballotClient.setBallotActive();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ballot", ballotAddress] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}
