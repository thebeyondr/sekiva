import { useParams } from "react-router";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { useOrganizationWithBallots } from "@/hooks/useOrganizationContract";
import NavBar from "@/components/shared/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BallotsTab from "@/collective/BallotsTab";
import AboutTab from "./AboutTab";
import MembersTab from "./MembersTab";
import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Skeleton = ({ className }: { className: string }) => (
  <div className={`bg-stone-200 animate-pulse rounded ${className}`}></div>
);

const OrganizationDetail = () => {
  const { organizationId } = useParams();
  const [activeTab, setActiveTab] = useState("ballots");

  const orgAddress = organizationId
    ? BlockchainAddress.fromString(organizationId)
    : null;

  const { organization, ballots, loading, error } = useOrganizationWithBallots(
    orgAddress!
  );

  // Transform ballots into Map for BallotsTab
  const ballotStatesMap = useMemo(() => {
    if (!ballots) return new Map();
    return new Map(
      ballots.map(({ address, state }) => [address.asString(), state])
    );
  }, [ballots]);

  return (
    <div className="min-h-screen bg-sk-yellow-light">
      <NavBar />

      <div className="container mx-auto max-w-[1500px]">
        {/* Back Navigation */}
        <section className="py-4 px-6">
          <Link to="/collectives" title="Back to Collectives">
            <Button variant="link" className="text-left">
              <ArrowLeft className="w-4 h-4" />
              <p className="font-bold">All Collectives</p>
            </Button>
          </Link>
        </section>
      </div>

      {loading ? (
        <>
          {/* Skeleton Banner - Full Width */}
          <div className="relative mb-16">
            <div className="w-full h-48 sm:h-64 md:h-80 border-y-2 border-black">
              <div className="w-full h-full bg-stone-200 animate-pulse" />
            </div>

            {/* Profile Photo and Title Container */}
            <div className="container mx-auto max-w-[1500px]">
              <div className="absolute -bottom-12 left-8 w-28 h-28 md:w-32 md:h-32 border-2 border-black bg-white rounded-full overflow-hidden shadow-md">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="absolute bottom-4 left-44 md:left-48 bg-white px-4 py-2 border-2 border-black shadow-sm">
                <Skeleton className="w-48 h-8" />
              </div>
            </div>
          </div>

          {/* Contained Section for Tabs */}
          <div className="container mx-auto max-w-3xl px-6">
            <div className="bg-white rounded-lg border-2 border-black overflow-hidden">
              <div className="w-full grid grid-cols-3 h-14 bg-white border-b border-stone-200 rounded-none p-0">
                <div className="cursor-pointer rounded-none h-full border-b-4 border-black text-black bg-white text-lg xl:text-xl font-medium px-6 py-3 text-center">
                  <Skeleton className="w-20 h-6 mx-auto" />
                </div>
                <div className="cursor-pointer rounded-none h-full text-stone-600 text-lg xl:text-xl font-medium px-6 py-3 text-center">
                  <Skeleton className="w-20 h-6 mx-auto" />
                </div>
                <div className="cursor-pointer rounded-none h-full text-stone-600 text-lg xl:text-xl font-medium px-6 py-3 text-center">
                  <Skeleton className="w-20 h-6 mx-auto" />
                </div>
              </div>
              <div className="p-6">
                {/* Create Button */}
                <div className="flex justify-end mb-6">
                  <div className="w-24 h-9 bg-stone-200 rounded-md animate-pulse" />
                </div>
                {/* Ballot Cards */}
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="border-2 border-black rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <Skeleton className="w-32 h-7" />
                        <Skeleton className="w-20 h-6" />
                      </div>
                      <Skeleton className="w-full h-4 mb-4" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-24 h-4" />
                          <Skeleton className="w-24 h-4" />
                        </div>
                        <Skeleton className="w-6 h-6" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : error ? (
        <div className="container mx-auto max-w-3xl px-6">
          <div className="bg-white rounded-lg p-8 border-2 border-black">
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <p className="text-red-500 font-semibold">
                {error?.message || "An error occurred"}
              </p>
            </div>
          </div>
        </div>
      ) : organization ? (
        <>
          {/* Cover and Profile Photo Section - Full Width */}
          <div className="relative mb-16">
            {/* Cover Photo */}
            <div className="w-full h-48 sm:h-64 md:h-80 border-y-2 border-black">
              {organization.bannerImage ? (
                <img
                  src={organization.bannerImage}
                  alt={`${organization.name} banner`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-amber-100 to-sky-100 flex items-center justify-center relative">
                  <div className="absolute -right-6 -top-6 w-64 h-64 bg-red-100 rotate-12 z-0"></div>
                  <div className="absolute left-1/4 -bottom-4 w-40 h-40 bg-blue-200 z-0"></div>
                  <div className="absolute right-1/3 top-1/4 w-32 h-32 rounded-full bg-rose-100 z-0"></div>
                </div>
              )}
            </div>

            {/* Profile Photo and Title Container */}
            <div className="container mx-auto max-w-[1500px]">
              <div className="absolute -bottom-12 left-8 w-28 h-28 md:w-32 md:h-32 border-2 border-black bg-white rounded-full overflow-hidden shadow-md">
                {organization.profileImage ? (
                  <img
                    src={organization.profileImage}
                    alt={`${organization.name} profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                    <span className="text-4xl font-bold text-stone-400">
                      {organization.name?.charAt(0).toUpperCase() || "O"}
                    </span>
                  </div>
                )}
              </div>

              {/* Organization Name Overlay */}
              <div className="absolute bottom-4 left-44 md:left-48 bg-white px-4 py-2 border-2 border-black shadow-sm">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  {organization.name}
                </h1>
              </div>
            </div>
          </div>

          {/* Contained Section for Tabs */}
          <div className="container mx-auto max-w-3xl px-6">
            <div className="bg-white rounded-lg border-2 border-black overflow-hidden">
              <Tabs
                defaultValue={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-3 h-14 bg-white border-b border-stone-200 rounded-none p-0">
                  <TabsTrigger
                    value="ballots"
                    className="cursor-pointer rounded-none h-full data-[state=active]:border-b-4 data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none data-[state=active]:bg-white text-stone-600 text-lg xl:text-xl font-medium px-6 py-3 text-center hover:bg-stone-100"
                  >
                    Ballots
                  </TabsTrigger>
                  <TabsTrigger
                    value="members"
                    className="cursor-pointer rounded-none h-full data-[state=active]:border-b-4 data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none data-[state=active]:bg-white text-stone-600 text-lg xl:text-xl font-medium px-6 py-3 text-center hover:bg-stone-100"
                  >
                    Members
                  </TabsTrigger>
                  <TabsTrigger
                    value="about"
                    className="cursor-pointer rounded-none h-full data-[state=active]:border-b-4 data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none data-[state=active]:bg-white text-stone-600 text-lg xl:text-xl font-medium px-6 py-3 text-center hover:bg-stone-100"
                  >
                    About
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="ballots" className="p-3">
                  <BallotsTab
                    organizationId={organizationId || ""}
                    ballotStates={ballotStatesMap}
                    loading={loading}
                    error={error || null}
                  />
                </TabsContent>
                <TabsContent value="members" className="p-3">
                  <MembersTab
                    members={organization.members}
                    owner={organization.owner}
                    administrators={organization.administrators}
                    organizationId={organizationId || ""}
                  />
                </TabsContent>
                <TabsContent value="about" className="p-3">
                  <AboutTab
                    organization={organization}
                    contractId={organizationId || ""}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </>
      ) : (
        <div className="container mx-auto max-w-3xl px-6">
          <div className="bg-white rounded-lg p-8 border-2 border-black">
            <div>No organization data found.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDetail;
