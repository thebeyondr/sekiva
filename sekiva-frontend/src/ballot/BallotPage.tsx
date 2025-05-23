import NavBar from "@/components/shared/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, CheckIcon, TimerIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { getBallotStatus } from "../lib/ballotUtils";
import { useCastVote, useComputeTally } from "@/hooks/useBallotContract";
import { useOrganizationWithBallots } from "@/hooks/useOrganizationContract";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { useAuth } from "@/auth/useAuth";
import BallotCard from "./BallotCard";
import { BallotStatusD } from "@/contracts/BallotGenerated";
import { transformBallotStateToCardProps } from "@/lib/ballotUtils";
import { TransactionDialog } from "@/components/shared/TransactionDialog";

type ErrorWithMessage = { message: string };
function isErrorWithMessage(e: unknown): e is ErrorWithMessage {
  return (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as ErrorWithMessage).message === "string"
  );
}

const BallotPage = () => {
  const { organizationId, ballotId } = useParams();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const {
    mutate: castVote,
    isPending: isVoting,
    requiresWalletConnection: requiresWalletForVoting,
  } = useCastVote();
  const {
    mutate: startTally,
    isPending: isStartingTally,
    requiresWalletConnection: requiresWalletForTally,
  } = useComputeTally();
  const { organization, ballots, loading, error } = useOrganizationWithBallots(
    BlockchainAddress.fromString(organizationId as string)
  );
  const ballot = ballots.find((b) => b.address.asString() === ballotId);
  const { account, canPerformAction } = useAuth();
  const [txDetails, setTxDetails] = useState<{
    id: string;
    destinationShard: string;
    action: "action";
  } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function checkPerms() {
      if (!organizationId || !account) {
        setIsAdmin(false);
        setIsMember(false);
        setChecking(false);
        return;
      }
      setChecking(true);
      try {
        const [admin, member] = await Promise.all([
          canPerformAction("manage_members", organizationId),
          canPerformAction("vote", organizationId),
        ]);
        if (!cancelled) {
          setIsAdmin(admin);
          setIsMember(member);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    checkPerms();
    return () => {
      cancelled = true;
    };
  }, [organizationId, account, canPerformAction]);

  if (!ballotId) return <div>No ballot ID</div>;
  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        Error:{" "}
        {isErrorWithMessage(error as unknown)
          ? (error as ErrorWithMessage).message
          : String(error)}
      </div>
    );
  if (!ballot) return <div>Ballot not found</div>;

  const ballotStatus = getBallotStatus(ballot.state.status);
  const hasVoted = account
    ? ballot.state.alreadyVoted.some(
        (v: BlockchainAddress) => v.asString() === account.getAddress()
      )
    : false;

  const handleStartTally = () => {
    startTally(ballotId || "", {
      onSuccess: (data) => {
        console.log("Start tally success:", data);
        if (data?.identifier && data?.destinationShardId) {
          setTxDetails({
            id: data.identifier,
            destinationShard: data.destinationShardId,
            action: "action",
          });
          console.log("Set tx details for tally:", {
            id: data.identifier,
            destinationShard: data.destinationShardId,
          });
        }
      },
    });
  };

  const handleCastVote = () => {
    console.log("Casting vote with option:", selectedOption);
    castVote(
      {
        ballotAddress: ballotId!,
        choice: selectedOption || 0,
      },
      {
        onSuccess: (data) => {
          console.log("Cast vote success:", data);
          if (data?.identifier && data?.destinationShardId) {
            setTxDetails({
              id: data.identifier,
              destinationShard: data.destinationShardId,
              action: "action",
            });
            console.log("Set tx details for vote:", {
              id: data.identifier,
              destinationShard: data.destinationShardId,
            });
          }
        },
      }
    );
  };

  // Helper function to calculate vote percentage
  const calculateVotePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return (votes / total) * 100;
  };

  // Calculate total votes
  const totalVotes = ballot.state.tally?.total;

  let winningOptions: number[] = [];

  if (ballot.state.status?.discriminant === BallotStatusD.Completed) {
    // Find all winning options by comparing vote counts
    let maxVotes = 0;
    for (let i = 0; i < ballot.state.options.length; i++) {
      const optionVotes =
        (ballot.state.tally?.[
          `option${i}` as keyof typeof ballot.state.tally
        ] as number) || 0;
      if (optionVotes > maxVotes) {
        maxVotes = optionVotes;
        winningOptions = [i];
      } else if (optionVotes === maxVotes && maxVotes > 0) {
        winningOptions.push(i);
      }
    }
  }

  return (
    <div className="min-h-screen bg-sk-yellow-light">
      <NavBar />
      {/* Transaction Dialog */}
      {txDetails && (
        <TransactionDialog
          action={txDetails.action}
          id={txDetails.id}
          trait="other"
          onSuccess={() => setTxDetails(null)}
          onError={() => setTxDetails(null)}
        />
      )}
      <div className="container mx-auto max-w-[1500px]">
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
                  {isErrorWithMessage(error as unknown)
                    ? (error as ErrorWithMessage).message
                    : String(error)}
                </p>
              </div>
            </Card>
          ) : ballot ? (
            <div className="space-y-6">
              <BallotCard
                {...transformBallotStateToCardProps(
                  ballot.state,
                  BlockchainAddress.fromString(ballotId),
                  organizationId || "",
                  hasVoted || false
                )}
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
                      {ballot.state.options.map(
                        (option: string, index: number) => (
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

                            {ballotStatus === "completed" &&
                              ballot.state.tally && (
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
                                          ballot.state.tally[
                                            `option${index}` as keyof typeof ballot.state.tally
                                          ] as number,
                                          totalVotes || 0
                                        )}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="ml-2 text-sm font-medium">
                                    {
                                      ballot.state.tally[
                                        `option${index}` as keyof typeof ballot.state.tally
                                      ]
                                    }{" "}
                                    {ballot.state.tally[
                                      `option${index}` as keyof typeof ballot.state.tally
                                    ] === 1
                                      ? "vote"
                                      : "votes"}
                                  </span>
                                </div>
                              )}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Vote Action */}
                  {!checking &&
                    isMember &&
                    ballotStatus === "active" &&
                    !hasVoted && (
                      <div className="pt-4">
                        {requiresWalletForVoting && (
                          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                            <p className="text-amber-800">
                              Please connect your wallet to cast your vote.
                              You'll need to sign a transaction.
                            </p>
                          </div>
                        )}
                        <Button
                          onClick={handleCastVote}
                          disabled={
                            selectedOption === null ||
                            isVoting ||
                            hasVoted ||
                            requiresWalletForVoting
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

                  {ballotStatus === "tallying" && (
                    <div className="bg-amber-50 p-6 rounded-md">
                      <p className="text-lg">
                        This ballot is currently being tallied. Check back later
                        to see the results.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Admin Actions */}
              {!checking &&
                isAdmin &&
                ballot.state.administrator &&
                ballotStatus !== "completed" && (
                  <Card className="border-2 border-black">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">
                        Admin Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {ballotStatus === "active" && (
                        <>
                          {requiresWalletForTally && (
                            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                              <p className="text-amber-800">
                                Please connect your wallet to start the tally.
                                You'll need to sign a transaction.
                              </p>
                            </div>
                          )}
                          <Button
                            onClick={handleStartTally}
                            variant="outline"
                            className="border-2 border-black hover:bg-gray-50"
                            disabled={isStartingTally || requiresWalletForTally}
                          >
                            <TimerIcon className="w-4 h-4 mr-2" />
                            {isStartingTally
                              ? "Starting tally..."
                              : "Start tally"}
                          </Button>
                        </>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Note: Starting the tally computation will close the
                        voting period.
                      </p>
                    </CardContent>
                  </Card>
                )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Ballot not found</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default BallotPage;
