import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import BallotCard from "../ballot/BallotCard";
import { transformBallotStateToCardProps } from "../lib/ballotUtils";
import { BallotState } from "@/contracts/BallotGenerated";
import { useAuth } from "@/auth/useAuth";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BallotsTabProps {
  organizationId: string;
  ballotStates: Map<string, BallotState>;
  hasThreeOrMoreMembers: boolean;
  loading: boolean;
  error: string | null;
}

// const TEST_BALLOT = "03f7810efaeca8260da04f6ca25ab3b88720e2860a";

const BallotListHeader = ({
  organizationId,
  hasThreeOrMoreMembers,
}: {
  organizationId: string;
  hasThreeOrMoreMembers: boolean;
}) => (
  <div className="flex justify-end mb-5">
    <Link
      to={
        hasThreeOrMoreMembers
          ? `/collectives/${organizationId}/ballots/new`
          : `/collectives/${organizationId}`
      }
      className={cn(
        "text-white",
        !hasThreeOrMoreMembers && "text-gray-500 cursor-not-allowed"
      )}
    >
      <Button size="sm" disabled={!hasThreeOrMoreMembers}>
        <PlusIcon className="w-4 h-4" />
        Create
      </Button>
    </Link>
  </div>
);

const BallotListSkeleton = () => (
  <div className="py-4">
    <BallotListHeader organizationId="" hasThreeOrMoreMembers={false} />
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-32 bg-gray-100 rounded-lg"></div>
        </div>
      ))}
    </div>
  </div>
);

const EmptyBallotState = ({
  hasThreeOrMoreMembers,
}: {
  hasThreeOrMoreMembers: boolean;
}) => (
  <div
    className={cn(
      "text-center py-3	 bg-gray-50 rounded-lg",
      !hasThreeOrMoreMembers && "bg-amber-50 border border-amber-200"
    )}
  >
    <p
      className={cn(
        "text-gray-500",
        !hasThreeOrMoreMembers && "text-amber-600"
      )}
    >
      {hasThreeOrMoreMembers
        ? "No ballots yet. Create your first one!"
        : "🧑‍🤝‍🧑 You need at least 3 members to create a truly private ballot. Add more in Members tab."}
    </p>
  </div>
);

const BallotsTab = ({
  organizationId,
  ballotStates,
  loading,
  error,
  hasThreeOrMoreMembers,
}: BallotsTabProps) => {
  const { account } = useAuth();

  if (loading) {
    return <BallotListSkeleton />;
  }

  if (error) {
    return (
      <div className="py-4">
        <BallotListHeader
          organizationId={organizationId}
          hasThreeOrMoreMembers={hasThreeOrMoreMembers}
        />
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-red-500">Error loading ballots: {error}</p>
        </div>
      </div>
    );
  }

  const ballotEntries = Array.from(ballotStates.entries());

  return (
    <div className="py-4">
      <BallotListHeader
        organizationId={organizationId}
        hasThreeOrMoreMembers={hasThreeOrMoreMembers}
      />
      <div className="space-y-6">
        {ballotEntries.length > 0 ? (
          ballotEntries
            .sort((a, b) => {
              const aStartTime = Number(a[1].startTime);
              const bStartTime = Number(b[1].startTime);
              return bStartTime - aStartTime; // Most recent first
            })
            .map(([address, ballot], index) => {
              const hasVoted = account
                ? ballot.alreadyVoted.some(
                    (v: BlockchainAddress) =>
                      v.asString() === account.getAddress()
                  )
                : false;

              const props = transformBallotStateToCardProps(
                ballot,
                BlockchainAddress.fromString(address),
                organizationId,
                hasVoted,
                index
              );
              return <BallotCard key={props.id} {...props} />;
            })
        ) : (
          <EmptyBallotState hasThreeOrMoreMembers={hasThreeOrMoreMembers} />
        )}
      </div>
    </div>
  );
};

export default BallotsTab;
