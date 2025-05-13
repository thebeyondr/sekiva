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
import { ArrowLeftIcon, CheckIcon, PlusIcon, TimerIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

// Sample ballot types and data
export type BallotStatus = "active" | "completed" | "pending";

interface BallotOption {
  id: string;
  text: string;
  voteCount?: number;
}

interface BallotDetails {
  id: string;
  title: string;
  description: string;
  status: BallotStatus;
  createdAt: string;
  endDate: string;
  options: BallotOption[];
  voteCount: number;
  organizationId: string;
  isAdmin: boolean; // In real app, would be determined from contract
}

const BallotPage = () => {
  const { organizationId, ballotId } = useParams();
  const [ballot, setBallot] = useState<BallotDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
  };

  useEffect(() => {
    // Simulate loading ballot data
    setLoading(true);
    setError(null);

    try {
      setTimeout(() => {
        // Mock data - in a real app this would come from the blockchain
        const mockBallot: BallotDetails = {
          id: ballotId || "unknown",
          title: "Community Fund Allocation Q4",
          description:
            "This ballot will determine how we allocate our community treasury for the next quarter. Please review the proposals carefully and cast your vote based on which initiative you believe will provide the most value to our organization.",
          status: "active",
          createdAt: "2023-11-10",
          endDate: "2023-12-10",
          voteCount: 24,
          organizationId: organizationId || "",
          options: [
            { id: "option-1", text: "Developer Grants (40% allocation)" },
            { id: "option-2", text: "Community Events (30% allocation)" },
            { id: "option-3", text: "Marketing Initiatives (20% allocation)" },
            { id: "option-4", text: "Reserve Fund (10% allocation)" },
          ],
          isAdmin: true, // For demo purposes
        };
        setBallot(mockBallot);
        setLoading(false);
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      handleError(errorMessage);
    }
  }, [ballotId, organizationId]);

  // Color variants for the geometric accents
  const getStatusColor = (status: BallotStatus) => {
    switch (status) {
      case "active":
        return "bg-green-200";
      case "completed":
        return "bg-gray-200";
      case "pending":
        return "bg-amber-100";
      default:
        return "bg-blue-100";
    }
  };

  const handleVote = () => {
    if (!selectedOption) return;
    // In a real app, this would call the contract to register the vote
    alert(`Vote cast for option: ${selectedOption}`);
  };

  const handleStartTally = () => {
    // In a real app, this would call the contract to start the tally computation
    alert("Starting tally computation...");
  };

  return (
    <div className="min-h-screen bg-sk-yellow-light">
      <div className="container mx-auto max-w-[1500px]">
        <NavBar />

        <section className="container mx-auto max-w-4xl py-6">
          {/* Back Button */}
          <Link
            to={`/collectives/${organizationId}`}
            className="flex items-center gap-2 mb-8 hover:underline"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to organization</span>
          </Link>

          {loading ? (
            // Loading state
            <Card className="border-2 border-black p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ) : error ? (
            // Error state
            <Card className="border-2 border-black p-8">
              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <p className="text-red-500 font-semibold">Error: {error}</p>
              </div>
            </Card>
          ) : ballot ? (
            // Ballot content
            <div className="space-y-6">
              {/* Ballot Header Card */}
              <Card className="relative border-2 border-black overflow-hidden">
                {/* Geometric accent shapes */}
                <div
                  className={`absolute -right-6 -top-6 w-24 h-24 ${getStatusColor(
                    ballot.status
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
                        ballot.status === "active"
                          ? "bg-green-200"
                          : ballot.status === "completed"
                            ? "bg-gray-800 text-white"
                            : "bg-amber-100"
                      }`}
                    >
                      {ballot.status}
                    </span>
                  </div>
                  <CardDescription className="text-gray-700 max-w-3xl mt-2">
                    {ballot.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center bg-gray-100 px-3 py-1.5">
                      <span className="font-medium">Created:</span>
                      <span className="ml-2">{ballot.createdAt}</span>
                    </div>
                    <div className="flex items-center bg-gray-100 px-3 py-1.5">
                      <span className="font-medium">Ends:</span>
                      <span className="ml-2">{ballot.endDate}</span>
                    </div>
                    <div className="flex items-center bg-gray-100 px-3 py-1.5">
                      <span className="font-medium">Votes:</span>
                      <span className="ml-2">{ballot.voteCount}</span>
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
                        {ballot.options.map((option) => (
                          <div
                            key={option.id}
                            className="p-4 border border-gray-200 rounded-md"
                          >
                            <p>{option.text}</p>
                            {ballot.status === "completed" && (
                              <div className="mt-2 flex items-center">
                                <div className="h-2 bg-gray-200 flex-grow rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500"
                                    style={{
                                      width: `${
                                        ((option.voteCount || 0) /
                                          ballot.voteCount) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm font-medium">
                                  {option.voteCount || 0} votes
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
                          {ballot.id}
                        </p>
                        <div className="mt-3 flex gap-3">
                          <a
                            href={`https://browser.testnet.partisiablockchain.com/contracts/${ballot.id}?tab=state`}
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
                      {ballot.status === "active" ? (
                        <div className="space-y-6">
                          <h2 className="text-xl font-semibold">
                            Cast Your Vote
                          </h2>
                          <div className="space-y-3">
                            {ballot.options.map((option) => (
                              <div
                                key={option.id}
                                className={`p-4 border-2 rounded-md cursor-pointer transition-all ${
                                  selectedOption === option.id
                                    ? "border-black bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => setSelectedOption(option.id)}
                              >
                                <div className="flex items-center">
                                  <div
                                    className={`w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center ${
                                      selectedOption === option.id
                                        ? "border-black"
                                        : "border-gray-400"
                                    }`}
                                  >
                                    {selectedOption === option.id && (
                                      <div className="w-3 h-3 bg-black rounded-full"></div>
                                    )}
                                  </div>
                                  <p>{option.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="pt-4">
                            <Button
                              onClick={handleVote}
                              disabled={!selectedOption}
                              className="w-full sm:w-auto"
                            >
                              <CheckIcon className="w-4 h-4 mr-2" />
                              Submit Vote
                            </Button>
                          </div>
                        </div>
                      ) : ballot.status === "completed" ? (
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
              {ballot.isAdmin && (
                <Card className="border-2 border-black">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      Admin Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {ballot.status === "active" && (
                      <Button
                        onClick={handleStartTally}
                        variant="outline"
                        className="border-2 border-black hover:bg-gray-50"
                      >
                        <TimerIcon className="w-4 h-4 mr-2" />
                        Start Tally Computation
                      </Button>
                    )}
                    {ballot.status === "pending" && (
                      <Button
                        variant="outline"
                        className="border-2 border-black hover:bg-gray-50"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Activate Ballot
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
          ) : (
            <Card className="border-2 border-black p-8">
              <p>No ballot found with the provided ID.</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
};

export default BallotPage;
