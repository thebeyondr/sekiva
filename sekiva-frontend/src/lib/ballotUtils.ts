import { BlockchainAddress } from "@partisiablockchain/abi-client";
import {
  BallotState,
  BallotStatusD,
  Tally,
} from "@/contracts/ballot/BallotGenerated";
import { BN } from "bn.js";
import { formatDistanceToNow } from "date-fns";

export type BallotStatus = "active" | "completed" | "pending";

export interface BallotCardProps {
  id: string;
  title: string;
  description: string;
  status: BallotStatus;
  voteCount: number;
  timeInfo: string;
  contractAddress: BlockchainAddress | string;
  organizationId: string;
  index?: number;
  options: string[];
  tally?: Tally;
  winningOption?: number;
  hasVoted: boolean;
}

export const getBallotStatus = (
  status: BallotState["status"]
): BallotStatus => {
  if (!status) return "pending";
  switch (status.discriminant) {
    case BallotStatusD.Active:
      return "active";
    case BallotStatusD.Completed:
      return "completed";
    default:
      return "pending";
  }
};

export const getTimeInfo = (
  startTime: InstanceType<typeof BN>,
  endTime: InstanceType<typeof BN>
): string => {
  if (startTime.isZero() && endTime.isZero()) {
    return "Not started";
  }
  const now = new Date();
  const start = new Date(Number(startTime));
  const end = new Date(Number(endTime));

  if (now < start) {
    return `Starts ${formatDistanceToNow(start)}`;
  } else if (now > end) {
    return `Ended ${formatDistanceToNow(end)}`;
  } else {
    return `Ends ${formatDistanceToNow(end)}`;
  }
};

export const getWinningOption = (tally?: Tally): number | undefined => {
  if (!tally) return undefined;
  const votes = [
    tally.option0,
    tally.option1,
    tally.option2,
    tally.option3,
    tally.option4,
  ];
  const maxVotes = Math.max(...votes);
  return votes.indexOf(maxVotes);
};

export const transformBallotStateToCardProps = (
  state: BallotState,
  contractAddress: BlockchainAddress,
  organizationId: string,
  hasVoted: boolean,
  index?: number
): BallotCardProps => ({
  id: contractAddress.asString(),
  title: state.title,
  description: state.description,
  status: getBallotStatus(state.status),
  voteCount: state.voters.length,
  timeInfo: getTimeInfo(state.startTime, state.endTime),
  contractAddress,
  organizationId,
  index,
  options: state.options,
  tally: state.tally,
  winningOption: getWinningOption(state.tally),
  hasVoted,
});
