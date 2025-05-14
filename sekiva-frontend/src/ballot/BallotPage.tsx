import NavBar from "@/components/shared/NavBar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeftIcon,
  CheckIcon,
  Loader2,
  PlusIcon,
  TimerIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { getBallotStatus } from "../lib/ballotUtils";
import { useBallotContract } from "@/hooks/useBallotContract";
import { BallotStatusD } from "@/contracts/ballot/BallotGenerated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const BallotPage = () => {
  const { organizationId, ballotId } = useParams();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const queryClient = useQueryClient();

  const { getState, castVote, setBallotActive } = useBallotContract();

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

  const { mutate: handleVote, isPending: isVoting } = useMutation({
    mutationFn: (choice: number) => castVote(ballotId || "", choice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ballot", ballotId] });
    },
  });

  const { mutate: handleSetActive, isPending: isSettingActive } = useMutation({
    mutationFn: () => setBallotActive(ballotId || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ballot", ballotId] });
    },
  });

  const handleStartTally = () => {
    // TODO: Implement tally computation
    alert("Starting tally computation...");
  };

  // Color variants for the geometric accents
  const getStatusColor = (status: BallotStatusD) => {
    switch (status) {
      case BallotStatusD.Active:
        return "bg-green-200";
      case BallotStatusD.Completed:
        return "bg-gray-200";
      case BallotStatusD.Tallying:
        return "bg-amber-100";
      default:
        return "bg-blue-100";
    }
  };

  if (!ballot) return null;

  const ballotStatus = getBallotStatus(ballot.status);

  // Helper function to calculate vote percentage
  const calculateVotePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return (votes / total) * 100;
  };

  // Calculate total votes
  const totalVotes = ballot.tally
    ? Object.values(ballot.tally).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="min-h-screen bg-sk-yellow-light">
      <div className="container mx-auto max-w-[1500px]">
        <NavBar />

        <section className="container mx-auto max-w-4xl py-6">
          <Link
            to={`/collectives/${organizationId}`}
            className="flex items-center gap-2 mb-8 hover:underline justify-self-start"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to organization</span>
          </Link>

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
              {/* Ballot Header Card */}
              <Card className="relative border-2 border-black overflow-hidden">
                <div
                  className={`absolute -right-6 -top-6 w-24 h-24 ${getStatusColor(
                    ballot.status?.discriminant || BallotStatusD.Tallying
                  )} rotate-12 z-0`}
                ></div>
                <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-blue-200 z-0"></div>

                <CardHeader className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">
                      {ballot.title}
                    </CardTitle>
                    <span
                      className={`inline-flex items-center px-4 py-1.5 uppercase text-sm font-semibold ${
                        ballotStatus === "active"
                          ? "bg-green-200"
                          : ballotStatus === "completed"
                            ? "bg-gray-800 text-white"
                            : "bg-amber-100"
                      }`}
                    >
                      {ballotStatus}
                    </span>
                  </div>
                  <CardDescription className="text-gray-700 max-w-3xl mt-2">
                    {ballot.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center bg-gray-100 px-3 py-1.5">
                      <span className="font-medium">Votes:</span>
                      <span className="ml-2">{ballot.voters.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs Section */}
              <Card className="border-2 border-black overflow-hidden p-0">
                <Tabs
                  defaultValue={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="w-full grid grid-cols-2 h-14 bg-white border-b border-gray-200 rounded-none p-0">
                    <TabsTrigger
                      value="details"
                      className="rounded-none h-full data-[state=active]:border-b-4 data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none data-[state=active]:bg-white text-gray-600 text-lg xl:text-xl font-medium px-6 py-3 text-center hover:bg-gray-50"
                    >
                      Ballot Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="vote"
                      className="rounded-none h-full data-[state=active]:border-b-4 data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none data-[state=active]:bg-white text-gray-600 text-lg xl:text-xl font-medium px-6 py-3 text-center hover:bg-gray-50"
                    >
                      Vote
                    </TabsTrigger>
                  </TabsList>

                  <CardContent className="p-6">
                    <TabsContent value="details" className="m-0 space-y-4">
                      <h2 className="text-xl font-semibold">Ballot Options</h2>
                      <div className="space-y-3">
                        {ballot.options.map((option: string, index: number) => (
                          <div
                            key={index}
                            className="p-4 border border-gray-200 rounded-md"
                          >
                            <p>{option}</p>
                            {ballotStatus === "completed" && ballot.tally && (
                              <div className="mt-2 flex items-center">
                                <div className="h-2 bg-gray-200 flex-grow rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500"
                                    style={{
                                      width: `${calculateVotePercentage(
                                        ballot.tally[
                                          `option${index}` as keyof typeof ballot.tally
                                        ] as number,
                                        totalVotes
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
                                  votes
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Contract Information */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold mb-3">
                          Contract Information
                        </h3>
                        <p className="text-sm font-mono bg-gray-100 p-3 rounded">
                          {ballotId}
                        </p>
                        <div className="mt-3 flex gap-3">
                          <a
                            href={`https://browser.testnet.partisiablockchain.com/contracts/${ballotId}?tab=state`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:underline"
                          >
                            View on Explorer
                          </a>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="vote" className="m-0">
                      {ballotStatus === "active" ? (
                        <div className="space-y-6">
                          <h2 className="text-xl font-semibold">
                            Cast Your Vote
                          </h2>
                          <div className="space-y-3">
                            {ballot.options.map(
                              (option: string, index: number) => (
                                <div
                                  key={index}
                                  className={`p-4 border-2 rounded-md cursor-pointer transition-all ${
                                    selectedOption === index
                                      ? "border-black bg-blue-50"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                  onClick={() => setSelectedOption(index)}
                                >
                                  <div className="flex items-center">
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
                                    <p>{option}</p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                          <div className="pt-4">
                            <Button
                              onClick={() => handleVote(selectedOption || 0)}
                              disabled={selectedOption === null || isVoting}
                              className="w-full sm:w-auto"
                            >
                              <CheckIcon className="w-4 h-4 mr-2" />
                              {isVoting ? "Submitting..." : "Submit Vote"}
                            </Button>
                          </div>
                        </div>
                      ) : ballotStatus === "completed" ? (
                        <div className="bg-gray-50 p-6 rounded-md text-center">
                          <p className="text-lg">
                            This ballot has concluded. View the results in the
                            Details tab.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-amber-50 p-6 rounded-md text-center">
                          <p className="text-lg">
                            This ballot is not yet active. Check back later to
                            cast your vote.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>

              {/* Admin Actions */}
              {ballot.administrator && (
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
                      >
                        <TimerIcon className="w-4 h-4 mr-2" />
                        Start Tally Computation
                      </Button>
                    )}
                    {ballotStatus === "pending" && (
                      <Button
                        variant="outline"
                        className="border-2 border-black hover:bg-gray-50"
                        onClick={() => handleSetActive()}
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
