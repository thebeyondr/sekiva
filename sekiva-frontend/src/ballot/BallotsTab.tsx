import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import BallotCard from "./BallotCard";
import { transformBallotStateToCardProps } from "../lib/ballotUtils";
import { getAccount } from "@/AppState";
import { BallotState } from "@/contracts/ballot/BallotGenerated";

interface BallotsTabProps {
  organizationId: string;
  ballotStates: Map<string, BallotState>;
  loading: boolean;
  error: string | null;
}

// const TEST_BALLOT = "03f7810efaeca8260da04f6ca25ab3b88720e2860a";

const BallotListHeader = ({ organizationId }: { organizationId: string }) => (
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-xl font-semibold">Ballots</h2>
    <Link to={`/collectives/${organizationId}/ballots/new`}>
      <Button size="sm">create new ballot</Button>
    </Link>
  </div>
);

const BallotListSkeleton = () => (
  <div className="py-4">
    <BallotListHeader organizationId="" />
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-32 bg-gray-100 rounded-lg"></div>
        </div>
      ))}
    </div>
  </div>
);

const EmptyBallotState = () => (
  <div className="text-center py-12 bg-gray-50 rounded-lg">
    <p className="text-gray-500">No ballots yet. Create your first one!</p>
  </div>
);

const BallotsTab = ({
  organizationId,
  ballotStates,
  loading,
  error,
}: BallotsTabProps) => {
  const account = getAccount();

  if (loading) {
    return <BallotListSkeleton />;
  }

  if (error) {
    return (
      <div className="py-4">
        <BallotListHeader organizationId={organizationId} />
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-red-500">Error loading ballots: {error}</p>
        </div>
      </div>
    );
  }

  const ballotEntries = Array.from(ballotStates.entries());

  return (
    <div className="py-4">
      <BallotListHeader organizationId={organizationId} />
      <div className="space-y-6">
        {ballotEntries.length > 0 ? (
          ballotEntries.map(([address, ballot], index) => {
            const hasVoted = account
              ? ballot.voters.some((v) => v.asString() === account.getAddress())
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
          <EmptyBallotState />
        )}
      </div>
    </div>
  );
};

export default BallotsTab;
