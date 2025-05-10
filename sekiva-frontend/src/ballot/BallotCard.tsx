import { Link } from "react-router";
import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react";
import { BlockchainAddress } from "@partisiablockchain/abi-client";

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
}: BallotCardProps) => {
  // Determine status styling
  const getStatusStyles = (status: BallotStatus) => {
    switch (status) {
      case "active":
        return "bg-green-200 text-black";
      case "completed":
        return "bg-gray-800 text-white";
      case "pending":
        return "bg-amber-100 text-gray-800";
      default:
        return "bg-gray-200 text-gray-800";
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
    <Link to={`/collectives/${organizationId}/ballots/${id}`} className="block">
      <div className="relative bg-white border-2 border-black rounded-lg p-5 hover:translate-x-2 transition-all overflow-hidden group">
        {/* Geometric accent shapes in corners only */}
        <div
          className={`absolute -right-3 -top-3 w-12 h-12 ${topRightColor} z-0`}
        ></div>
        <div
          className={`absolute -left-3 -bottom-3 w-10 h-10 ${bottomLeftColor} z-0`}
        ></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-xl tracking-tight">{title}</h4>
            <span
              className={`ml-4 inline-flex items-center px-3 py-1 rounded-none ${getStatusStyles(status)} text-xs font-bold uppercase`}
            >
              {status}
            </span>
          </div>
          <p className="text-gray-700 text-sm mt-3 line-clamp-2">
            {description}
          </p>
          <div className="flex justify-between items-center mt-4 text-sm font-medium">
            <div className="flex items-center gap-4">
              <span className="bg-gray-200 text-gray-800 px-2 py-1">
                {voteCount} votes
              </span>
              <span className="border-l-4 border-black pl-2">{timeInfo}</span>
            </div>
            <span className="text-black font-bold">
              <ArrowRightIcon className="w-6 h-6" />
            </span>
          </div>

          {/* Small contract address info at bottom */}
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500 truncate">
            Contract: {addressString.substring(0, 10)}...
            {addressString.substring(addressString.length - 6)}
            <a
              href={`https://browser.testnet.partisiablockchain.com/contracts/${addressString}?tab=state`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 inline-block align-text-bottom"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BallotCard;
