import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import BallotCard from "./BallotCard";
import { useBallots } from "@/hooks/useBallots";

interface BallotsTabProps {
  organizationId: string;
  ballots: BlockchainAddress[];
}

const TEST_BALLOT = "03f7810efaeca8260da04f6ca25ab3b88720e2860a";

const BallotsTab = ({ organizationId, ballots }: BallotsTabProps) => {
  // Add test ballot to the list
  const allBallots = [...ballots, BlockchainAddress.fromString(TEST_BALLOT)];
  const { ballots: ballotData, loading, error } = useBallots(allBallots);

  console.log("Ballot data:", ballotData);

  if (loading) {
    return (
      <div className="py-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Ballots</h2>
          <Link to={`/collectives/${organizationId}/ballots/new`}>
            <Button size="sm">create new ballot</Button>
          </Link>
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Ballots</h2>
          <Link to={`/collectives/${organizationId}/ballots/new`}>
            <Button size="sm">create new ballot</Button>
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-red-500">Error loading ballots: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Ballots</h2>
        <Link to={`/collectives/${organizationId}/ballots/new`}>
          <Button size="sm">create new ballot</Button>
        </Link>
      </div>

      <div className="space-y-6">
        {ballotData.length > 0 ? (
          ballotData.map((ballot, index) => (
            <BallotCard
              key={ballot.address.asString()}
              id={ballot.address.asString()}
              title={ballot.state.title}
              description={ballot.state.description}
              status={ballot.status}
              voteCount={ballot.voteCount}
              timeInfo={ballot.timeInfo}
              contractAddress={ballot.address}
              organizationId={organizationId}
              index={index}
              options={ballot.options}
              tally={ballot.tally}
              winningOption={ballot.winningOption}
              hasVoted={ballot.hasVoted}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No ballots yet. Create your first one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BallotsTab;
