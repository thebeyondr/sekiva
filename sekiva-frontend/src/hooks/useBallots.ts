import { getAccount, TESTNET_URL } from "@/AppState";
import { BallotApi } from "@/contracts/ballot/ballotApi";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { BlockchainTransactionClient } from "@partisiablockchain/blockchain-api-transaction-client";
import { Client, RealZkClient } from "@partisiablockchain/zk-client";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/useAuth";

export interface BallotData {
  address: BlockchainAddress;
  state: Awaited<ReturnType<BallotApi["getState"]>>;
  voteCount: number;
  timeInfo: string;
  status: "active" | "completed" | "pending";
  options: string[];
  tally?: {
    option0: number;
    option1: number;
    option2: number;
    option3: number;
    option4: number;
  };
  winningOption?: number;
  hasVoted: boolean;
}

export function useBallots(ballotAddresses: BlockchainAddress[]) {
  const [ballots, setBallots] = useState<BallotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isConnected } = useAuth();
  const account = getAccount();
  const transactionClient = account
    ? BlockchainTransactionClient.create(TESTNET_URL, account)
    : undefined;

  useEffect(() => {
    const fetchBallots = async () => {
      if (!isConnected || !account) {
        console.log("Not connected or no account found, returning early", {
          isConnected,
          hasAccount: !!account,
        });
        return;
      }

      console.log(
        "Starting fetchBallots with addresses:",
        ballotAddresses.map((a) => a.asString())
      );
      setLoading(true);
      setError(null);

      try {
        const ballotPromises = ballotAddresses.map(async (address) => {
          console.log("Creating ballot API for address:", address.asString());
          const zkClient = RealZkClient.create(
            address.asString(),
            new Client(TESTNET_URL)
          );
          const ballotApi = new BallotApi(
            transactionClient,
            zkClient,
            BlockchainAddress.fromString(account.getAddress()),
            address
          );
          console.log("Fetching state for ballot:", address.asString());
          const state = await ballotApi.getState();
          console.log("Got state for ballot:", address.asString(), state);

          // Determine status
          let status: BallotData["status"] = "pending";
          if (ballotApi.isActive(state)) status = "active";
          if (ballotApi.isCompleted(state)) status = "completed";

          // Calculate time info
          const now = Date.now();
          const startTime = state.startTime.toNumber();
          const endTime = state.endTime.toNumber();
          let timeInfo = "";

          if (status === "pending") {
            const daysUntilStart = Math.ceil(
              (startTime - now) / (1000 * 60 * 60 * 24)
            );
            timeInfo =
              daysUntilStart > 0
                ? `Starts in ${daysUntilStart} days`
                : "Starts soon";
          } else if (status === "active") {
            const daysLeft = Math.ceil((endTime - now) / (1000 * 60 * 60 * 24));
            timeInfo = daysLeft > 0 ? `${daysLeft} days left` : "Ending soon";
          } else {
            timeInfo = "Ended";
          }

          return {
            address,
            state,
            voteCount: ballotApi.getVoteCount(state),
            timeInfo,
            status,
            options: state.options,
            tally: ballotApi.getTallyResults(state),
            winningOption: ballotApi.getWinningOption(state),
            hasVoted: ballotApi.hasVoted(
              state,
              BlockchainAddress.fromString(account.getAddress())
            ),
          };
        });

        const ballotData = await Promise.all(ballotPromises);
        setBallots(ballotData);
      } catch (err) {
        console.error("Error fetching ballots:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    if (ballotAddresses.length > 0) {
      fetchBallots();
    } else {
      setBallots([]);
      setLoading(false);
    }
  }, [ballotAddresses, isConnected, account]);

  return { ballots, loading, error };
}
