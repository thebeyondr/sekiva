import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { ArrowRightIcon, ArrowUpRight } from "lucide-react";
import { Link } from "react-router";

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
  index?: number; // Used for alternating colors in the geometric shapes
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

const BallotCard = ({
  id,
  title,
  description,
  status,
  voteCount,
  timeInfo,
  contractAddress,
  organizationId,
  index = 0,
  options,
  tally,
  winningOption,
  hasVoted,
}: BallotCardProps) => {
  // Determine status styling
  const getStatusStyles = (status: BallotStatus) => {
    switch (status) {
      case "active":
        return "bg-green-200 text-black";
      case "completed":
        return "bg-stone-800 text-white";
      case "pending":
        return "bg-amber-100 text-stone-800";
      default:
        return "bg-stone-200 text-stone-800";
    }
  };

  // Determine shape colors based on index
  const topRightColor =
    index % 3 === 0
      ? "bg-amber-100"
      : index % 3 === 1
        ? "bg-red-100"
        : "bg-sky-100";
  const bottomLeftColor =
    index % 3 === 0
      ? "bg-rose-100"
      : index % 3 === 1
        ? "bg-blue-200"
        : "bg-amber-100";

  // Format the contract address for display
  const addressString =
    typeof contractAddress === "string"
      ? contractAddress
      : contractAddress.asString();

  return (
    <div className="relative bg-black rounded-md shadow-none">
      <Link
        to={`/collectives/${organizationId}/ballots/${id}`}
        className="block"
      >
        <Card className="relative border-[1.5px] border-black rounded-t-md rounded-b-none overflow-hidden group hover:-translate-y-2 hover:translate-x-2 transition-all shadow-none bg-white">
          <div
            className={`absolute -right-3 -top-3 w-12 h-12 ${topRightColor} z-0`}
          ></div>
          <div
            className={`absolute -left-3 -bottom-3 w-10 h-10 ${bottomLeftColor} z-0`}
          ></div>

          <div className="relative z-10">
            <CardHeader className="p-5 pb-0">
              <div className="flex justify-between items-start">
                <CardTitle className="font-bold text-xl tracking-tight">
                  {title}
                </CardTitle>
                <span
                  className={`ml-4 inline-flex items-center px-3 py-1 rounded-none ${getStatusStyles(status)} text-xs font-bold uppercase`}
                >
                  {status}
                </span>
              </div>
              <CardDescription className="text-stone-700 text-sm mt-3 line-clamp-2">
                {description}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-3 shadow-none">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-medium">
                  <div className="flex items-center gap-4">
                    <span className="bg-stone-200 text-stone-800 px-2 py-1">
                      {voteCount} votes
                    </span>
                    <span className="border-l-4 border-black pl-2">
                      {timeInfo}
                    </span>
                    {hasVoted && (
                      <span className="bg-green-100 text-green-800 px-2 py-1">
                        Voted ✓
                      </span>
                    )}
                  </div>
                  <span className="text-black font-bold">
                    <ArrowRightIcon className="w-6 h-6" />
                  </span>
                </div>

                {status === "completed" && tally && (
                  <div className="mt-2 space-y-2">
                    {options.map((option, idx) => {
                      const voteCount =
                        [
                          tally.option0,
                          tally.option1,
                          tally.option2,
                          tally.option3,
                          tally.option4,
                        ][idx] || 0;
                      const totalVotes = Object.values(tally).reduce(
                        (sum, val) => sum + val,
                        0
                      );
                      const percentage =
                        totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                      const isWinning = idx === winningOption;

                      return (
                        <div key={idx} className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{option}</span>
                            <span className="text-stone-600">
                              {voteCount} votes
                            </span>
                          </div>
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                isWinning ? "bg-green-500" : "bg-stone-300"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
      {/* Contract link/footer visually attached to card */}
      <div className="bg-amber-100 rounded-b-lg flex items-center text-xs border-2 border-t-0 border-black">
        <div className="truncate">
          <Link
            to={`https://browser.testnet.partisiablockchain.com/contracts/${addressString}?tab=state`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block align-text-bottom"
          >
            <Button
              variant="link"
              size="sm"
              className="text-black"
              title="See contract"
            >
              <span>
                📜 Contract: {addressString.substring(0, 10)}...
                {addressString.substring(addressString.length - 6)}
              </span>
              <ArrowUpRight className="w-3 h-3 -ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BallotCard;
