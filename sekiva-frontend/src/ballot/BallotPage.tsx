import NavBar from "@/components/shared/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeftIcon,
  CheckIcon,
  Loader2,
  PlusIcon,
  TimerIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { getBallotStatus, getTimeInfo } from "../lib/ballotUtils";
import {
  useBallotContract,
  useCastVote,
  useComputeTally,
  useSetBallotActive,
} from "@/hooks/useBallotContract";
import { useQuery } from "@tanstack/react-query";
import { useOrganizationWithBallots } from "@/hooks/useOrganizationContract";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { useAuth } from "@/auth/useAuth";
import BallotCard from "./BallotCard";
import { BallotStatusD } from "@/contracts/BallotGenerated";

const BallotPage = () => {
  const { organizationId, ballotId } = useParams();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { getState } = useBallotContract();
  const { mutate: setBallotActive, isPending: isSettingActive } =
    useSetBallotActive();
  const { mutate: castVote, isPending: isVoting } = useCastVote();
  const { mutate: startTally, isPending: isStartingTally } = useComputeTally();
  const { organization } = useOrganizationWithBallots(
    BlockchainAddress.fromString(organizationId as string)
  );
  const { account } = useAuth();

  const {
    data: ballot,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["ballot", ballotId],
    queryFn: () => getState(ballotId || ""),
    enabled: !!ballotId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  if (!ballotId) return <div>No ballot ID</div>;

  const hasVoted = account
    ? ballot?.alreadyVoted.some(
        (v: BlockchainAddress) => v.asString() === account.getAddress()
      )
    : false;

  const handleStartTally = () => {
    startTally(ballotId || "");
  };

  if (!ballot) return null;

  const ballotStatus = getBallotStatus(ballot.status);

  // Helper function to calculate vote percentage
  const calculateVotePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return (votes / total) * 100;
  };

  // Calculate total votes
  const totalVotes = ballot.tally?.total;

  let winningOptions: number[] = [];

  if (ballot.status?.discriminant === BallotStatusD.Completed) {
    // Find all winning options by comparing vote counts
    let maxVotes = 0;
    for (let i = 0; i < ballot.options.length; i++) {
      const optionVotes =
        (ballot.tally?.[`option${i}` as keyof typeof ballot.tally] as number) ||
        0;
      if (optionVotes > maxVotes) {
        maxVotes = optionVotes;
        winningOptions = [i];
      } else if (optionVotes === maxVotes && maxVotes > 0) {
        winningOptions.push(i);
      }
    }
  }

  console.log("Winning options:", winningOptions);

  return (
    <div className="min-h-screen bg-sk-yellow-light">
      <div className="container mx-auto max-w-[1500px]">
        <NavBar />

        <section className="container mx-auto max-w-4xl py-6">
          <section className="mb-4 flex items-center">
            <Link
              to={`/collectives/${organizationId}`}
              title={`Back to ${organization?.name}`}
            >
              <Button variant={"link"} className="text-left">
                <ArrowLeftIcon className="w-4 h-4" />
                <p className="max-w-44 text-ellipsis overflow-hidden font-bold">
                  {organization?.name}
                </p>
              </Button>
            </Link>
          </section>

          {loading ? (
            <Card className="border-2 border-black p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ) : error ? (
            <Card className="border-2 border-black p-8">
              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <p className="text-red-500 font-semibold">
                  Error:{" "}
                  {error instanceof Error ? error.message : String(error)}
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <BallotCard
                id={ballotId}
                title={ballot.title}
                description={ballot.description}
                status={ballotStatus}
                voteCount={ballot.alreadyVoted.length}
                timeInfo={getTimeInfo(ballot.startTime, ballot.endTime)}
                contractAddress={ballotId}
                organizationId={organizationId || ""}
                tally={ballot.tally}
                hasVoted={!!hasVoted}
                variant="static"
              />

              <Card className="border-2 border-black overflow-hidden p-0">
                <CardContent className="p-6 space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      {ballotStatus === "completed"
                        ? "Tally Results"
                        : "Ballot Options"}
                    </h2>
                    <div className="space-y-3">
                      {ballot.options.map((option: string, index: number) => (
                        <div
                          key={index}
                          className={`p-4 border-2 rounded-md ${
                            ballotStatus === "active"
                              ? "cursor-pointer transition-all"
                              : ""
                          } ${
                            selectedOption === index &&
                            ballotStatus === "active"
                              ? "border-black bg-blue-50"
                              : "border-gray-200"
                          }`}
                          onClick={() =>
                            ballotStatus === "active" &&
                            !hasVoted &&
                            setSelectedOption(index)
                          }
                        >
                          <div className="flex items-center">
                            {ballotStatus === "active" && !hasVoted && (
                              <div
                                className={`w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center ${
                                  selectedOption === index
                                    ? "border-black"
                                    : "border-gray-400"
                                }`}
                              >
                                {selectedOption === index && (
                                  <div className="w-3 h-3 bg-black rounded-full"></div>
                                )}
                              </div>
                            )}
                            <p>{option}</p>
                          </div>

                          {ballotStatus === "completed" && ballot.tally && (
                            <div className="mt-2 flex items-center">
                              <div className="h-2 bg-gray-200 flex-grow rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    winningOptions.includes(index)
                                      ? "bg-green-500"
                                      : "bg-black"
                                  }`}
                                  style={{
                                    width: `${calculateVotePercentage(
                                      ballot.tally[
                                        `option${index}` as keyof typeof ballot.tally
                                      ] as number,
                                      totalVotes || 0
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm font-medium">
                                {
                                  ballot.tally[
                                    `option${index}` as keyof typeof ballot.tally
                                  ]
                                }{" "}
                                {ballot.tally[
                                  `option${index}` as keyof typeof ballot.tally
                                ] === 1
                                  ? "vote"
                                  : "votes"}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vote Action */}
                  {ballotStatus === "active" && !hasVoted && (
                    <div className="pt-4">
                      <Button
                        onClick={() =>
                          castVote({
                            ballotAddress: ballotId,
                            choice: selectedOption || 0,
                          })
                        }
                        disabled={
                          selectedOption === null ||
                          isVoting ||
                          hasVoted ||
                          !account
                        }
                        className="w-full sm:w-auto"
                      >
                        <CheckIcon className="w-4 h-4 mr-2" />
                        {isVoting ? "Casting vote..." : "Cast Vote"}
                      </Button>
                    </div>
                  )}

                  {hasVoted && ballotStatus === "active" && (
                    <div className="bg-green-50 p-6 rounded-md border border-green-200">
                      <p className="text-green-700 font-medium">
                        You have already cast your vote for this ballot.
                      </p>
                    </div>
                  )}

                  {ballotStatus === "pending" && (
                    <div className="bg-amber-50 p-6 rounded-md">
                      <p className="text-lg">
                        This ballot is not yet active. Check back later to cast
                        your vote.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Admin Actions */}
              {ballot.administrator && ballotStatus !== "completed" && (
                <Card className="border-2 border-black">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      Admin Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {ballotStatus === "active" && (
                      <Button
                        onClick={handleStartTally}
                        variant="outline"
                        className="border-2 border-black hover:bg-gray-50"
                        disabled={isStartingTally}
                      >
                        <TimerIcon className="w-4 h-4 mr-2" />
                        {isStartingTally ? "Starting tally..." : "Start tally"}
                      </Button>
                    )}
                    {ballotStatus === "pending" && (
                      <Button
                        variant="outline"
                        className="border-2 border-black hover:bg-gray-50"
                        onClick={() => setBallotActive(ballotId)}
                        disabled={isSettingActive}
                      >
                        {!isSettingActive && (
                          <>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Activate Ballot
                          </>
                        )}
                        {isSettingActive && (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Activating...
                          </>
                        )}
                      </Button>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Note: Starting the tally computation will close the voting
                      period.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default BallotPage;
