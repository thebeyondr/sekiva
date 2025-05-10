import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import BallotCard, { BallotStatus } from "./BallotCard";

interface BallotsTabProps {
  collectiveId: string;
  ballots: BlockchainAddress[];
}

const BallotsTab = ({ collectiveId, ballots }: BallotsTabProps) => {
  // These are sample ballots - in the real app, you would fetch actual ballot data
  const sampleBallots = [
    {
      id: "sample-1",
      title: "Community Treasury Allocation",
      description:
        "How should we allocate the community treasury for Q3 2023? Please vote for your preferred option.",
      status: "active" as BallotStatus,
      voteCount: 24,
      timeInfo: "3 days left",
      contractAddress: "0215e54b707bd575ca32e4ab6be5790735661e0e33",
    },
    {
      id: "sample-2",
      title: "New Governance Structure",
      description:
        "Vote on the proposed changes to our governance structure that will take effect in the next quarter.",
      status: "completed" as BallotStatus,
      voteCount: 42,
      timeInfo: "Ended",
      contractAddress: "0215e54b707bd575ca32e4ab6be5790735661e0e34",
    },
    {
      id: "sample-3",
      title: "New Member Application",
      description:
        "Vote on the application of BlockchainDev123 to join our organization as a full member with voting rights.",
      status: "pending" as BallotStatus,
      voteCount: 7,
      timeInfo: "Starts soon",
      contractAddress: "0215e54b707bd575ca32e4ab6be5790735661e0e35",
    },
  ];

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Ballots</h2>
        <Link to={`/collectives/${collectiveId}/ballots/new`}>
          <Button size="sm">create new ballot</Button>
        </Link>
      </div>

      {/* Display sample ballots */}
      <div className="space-y-6">
        {sampleBallots.map((ballot, index) => (
          <BallotCard
            key={ballot.id}
            {...ballot}
            collectiveId={collectiveId}
            index={index}
          />
        ))}

        {/* Display real ballots if available */}
        {ballots.length > 0 && (
          <>
            <div className="my-6 border-t border-gray-200"></div>
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              ACTUAL BALLOT CONTRACTS
            </h3>

            {ballots.map((ballot, index) => (
              <BallotCard
                key={ballot.asString()}
                id={ballot.asString()}
                title={`Ballot ${index + 1}`}
                description="This is a ballot from the blockchain. More details will be available when ballot details are fetched."
                status="active"
                voteCount={0}
                timeInfo="Unknown"
                contractAddress={ballot}
                collectiveId={collectiveId}
                index={index + sampleBallots.length}
              />
            ))}
          </>
        )}

        {ballots.length === 0 && sampleBallots.length === 0 && (
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
