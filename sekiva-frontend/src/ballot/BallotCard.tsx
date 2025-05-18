import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRightIcon, ArrowUpRight, CheckCheck } from "lucide-react";
import { Link } from "react-router";
import { BallotCardProps } from "../lib/ballotUtils";

interface BallotCardComponentProps
  extends Omit<BallotCardProps, "options" | "winningOption"> {
  variant?: "default" | "static";
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
  tally,
  hasVoted,
  variant = "default",
}: BallotCardComponentProps) => {
  // Determine status styling
  const getStatusStyles = (status: BallotCardProps["status"]) => {
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

  const cardContent = (
    <>
      <div
        className={`absolute -right-3 -top-3 w-12 h-12 ${topRightColor} z-0`}
      ></div>
      <div
        className={`absolute -left-3 -bottom-3 w-10 h-10 ${bottomLeftColor} z-0`}
      ></div>

      <div className="relative z-10">
        <CardHeader className="p-5 pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="font-bold text-2xl tracking-tight max-w-[80%] text-ellipsis overflow-hidden">
              {title}
            </CardTitle>
            <span
              className={`ml-4 inline-flex items-center px-3 py-1 rounded-none ${getStatusStyles(
                status
              )} text-xs font-bold uppercase`}
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
                <div className="bg-gray-100 px-3 py-1.5 text-sm w-fit">
                  <span className="font-medium">
                    {status === "completed" && tally?.total
                      ? `${tally.total} ${tally.total === 1 ? "vote" : "votes"} total`
                      : `${voteCount} ${voteCount === 1 ? "vote" : "votes"}${
                          status === "active" ? " so far" : ""
                        }`}
                  </span>
                </div>
                <span className="border-l-4 border-black pl-2">{timeInfo}</span>
                {hasVoted && (
                  <div className="bg-green-100 text-green-800 px-2 py-1 flex items-center gap-2">
                    <CheckCheck className="w-4 h-4" /> you voted
                  </div>
                )}
              </div>
              {variant === "default" && (
                <span className="text-black font-bold">
                  <ArrowRightIcon className="w-6 h-6" />
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </>
  );

  // Render different components based on the variant
  if (variant === "static") {
    return (
      <div className="relative bg-black rounded-md shadow-none">
        <Card className="relative border-2 border-black rounded-t-md rounded-b-none overflow-hidden bg-white">
          {cardContent}
        </Card>
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
  }

  // Default variant with hover effects and link
  return (
    <div className="relative bg-black rounded-md shadow-none">
      <Link
        to={`/collectives/${organizationId}/ballots/${id}`}
        className="block"
      >
        <Card className="relative border-[1.5px] border-black rounded-t-md rounded-b-none overflow-hidden group hover:-translate-y-2 hover:translate-x-2 transition-all shadow-none bg-white">
          {cardContent}
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
