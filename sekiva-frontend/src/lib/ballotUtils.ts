import { BallotState, BallotStatusD, Tally } from "@/contracts/BallotGenerated";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { BN } from "bn.js";
import { formatDistanceStrict, formatDistanceToNow } from "date-fns";

export type BallotStatus = "active" | "completed" | "tallying";

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
  if (!status) return "active";
  switch (status.discriminant) {
    case BallotStatusD.Completed:
      return "completed";
    case BallotStatusD.Tallying:
      return "tallying";
    default:
      return "active";
  }
};

export const getTimeInfo = (
  startTime: InstanceType<typeof BN>,
  endTime: InstanceType<typeof BN>
): string => {
  if (startTime.isZero() && endTime.isZero()) {
    return "no time info";
  }

  const now = new Date();
  const start = new Date(Number(startTime));
  const end = new Date(Number(endTime));

  if (now < start) {
    return `Starts in ${formatDistanceStrict(now, start)}`;
  } else if (now > end) {
    return `Ended ${formatDistanceToNow(end)} ago`;
  } else {
    return `Ends in ${formatDistanceStrict(now, end)}`;
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
  voteCount: state.alreadyVoted.length,
  timeInfo: getTimeInfo(state.startTime, state.endTime),
  contractAddress,
  organizationId,
  index,
  options: state.options,
  tally: state.tally,
  winningOption: getWinningOption(state.tally),
  hasVoted,
});
