import { useParams } from "react-router";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { useOrganizationWithBallots } from "@/hooks/useOrganizationContract";
import NavBar from "@/components/shared/NavBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BallotsTab from "@/ballot/BallotsTab";
import AboutTab from "./AboutTab";
import MembersTab from "./MembersTab";
import { useState, useMemo } from "react";

const Skeleton = ({ className }: { className: string }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`}></div>
);

const OrganizationDetail = () => {
  const { organizationId } = useParams();
  const [activeTab, setActiveTab] = useState("ballots");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const orgAddress = organizationId
    ? BlockchainAddress.fromString(organizationId)
    : null;

  const { organization, ballots, loading, error } = useOrganizationWithBallots(
    orgAddress!
  );

  const handleRefresh = async () => {
    // await Promise.all([refreshOrg(), refreshBallots()]);
    setLastRefreshed(new Date());
  };

  // Transform ballots into Map for BallotsTab
  const ballotStatesMap = useMemo(() => {
    if (!ballots) return new Map();
    return new Map(
      ballots.map(({ address, state }) => [address.asString(), state])
    );
  }, [ballots]);

  return (
    <div className="min-h-screen bg-sk-yellow-light">
      <div className="container mx-auto max-w-[1500px]">
        <NavBar />

        {/* Cover and Profile Photo Section */}
        {organization && !loading && !error && (
          <div className="relative mb-8 mt-4">
            {/* Cover Photo */}
            <div className="w-full h-48 rounded-lg sm:h-64 md:h-80 overflow-hidden border-2 border-black">
              {organization.bannerImage ? (
                <img
                  src={organization.bannerImage}
                  alt={`${organization.name} banner`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-amber-100 to-sky-100 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute -right-6 -top-6 w-64 h-64 bg-red-100 rotate-12 z-0"></div>
                  <div className="absolute left-1/4 -bottom-4 w-40 h-40 bg-blue-200 z-0"></div>
                  <div className="absolute right-1/3 top-1/4 w-32 h-32 rounded-full bg-rose-100 z-0"></div>
                </div>
              )}
            </div>

            {/* Profile Photo */}
            <div className="absolute -bottom-12 left-8 w-28 h-28 md:w-32 md:h-32 border-2 border-black bg-white rounded-full overflow-hidden shadow-md">
              {organization.profileImage ? (
                <img
                  src={organization.profileImage}
                  alt={`${organization.name} profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-400">
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
        )}

        <section className="container mx-auto max-w-3xl py-4 space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end items-center">
            <div className="flex items-center gap-2">
              {lastRefreshed && (
                <span className="text-xs text-gray-500">
                  Last refreshed: {lastRefreshed.toLocaleTimeString()}
                </span>
              )}
              <Button
                onClick={handleRefresh}
                variant="secondary"
                size="sm"
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh Data"}
              </Button>
            </div>
          </div>

          {/* Loading/Error States */}
          {loading ? (
            <div className="bg-white rounded-lg p-8 border-2 border-black space-y-4">
              <Skeleton className="w-2/3 h-8" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-32" />
              <Skeleton className="w-1/2 h-4" />
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg p-8 border-2 border-black">
              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <p className="text-red-500 font-semibold">
                  Error: {error.message}
                </p>
              </div>
            </div>
          ) : organization ? (
            /* Tabs Section */
            <div className="bg-white rounded-lg border-2 border-black overflow-hidden">
              <Tabs
                defaultValue={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-3 h-14 bg-white border-b border-gray-200 rounded-none p-0">
                  <TabsTrigger
                    value="ballots"
                    className="rounded-none h-full data-[state=active]:border-b-4 data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none data-[state=active]:bg-white text-gray-600 text-lg xl:text-xl font-medium px-6 py-3 text-center hover:bg-gray-50"
                  >
                    Ballots
                  </TabsTrigger>
                  <TabsTrigger
                    value="members"
                    className="rounded-none h-full data-[state=active]:border-b-4 data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none data-[state=active]:bg-white text-gray-600 text-lg xl:text-xl font-medium px-6 py-3 text-center hover:bg-gray-50"
                  >
                    Members
                  </TabsTrigger>
                  <TabsTrigger
                    value="about"
                    className="rounded-none h-full data-[state=active]:border-b-4 data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none data-[state=active]:bg-white text-gray-600 text-lg xl:text-xl font-medium px-6 py-3 text-center hover:bg-gray-50"
                  >
                    About
                  </TabsTrigger>
                </TabsList>
                <div className="p-4">
                  <TabsContent value="ballots" className="m-0">
                    <BallotsTab
                      organizationId={organizationId || ""}
                      ballotStates={ballotStatesMap}
                      loading={loading}
                      error={error || null}
                    />
                  </TabsContent>
                  <TabsContent value="members" className="m-0">
                    <MembersTab
                      members={organization.members}
                      owner={organization.owner}
                      administrators={organization.administrators}
                    />
                  </TabsContent>
                  <TabsContent value="about" className="m-0">
                    <AboutTab
                      organization={organization}
                      contractId={organizationId || ""}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 border-2 border-black">
              <div>No organization data found.</div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default OrganizationDetail;
