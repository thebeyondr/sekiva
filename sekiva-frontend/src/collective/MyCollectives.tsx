import { useAuth } from "@/auth/useAuth";
import NavBar from "@/components/shared/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFactoryContract } from "@/hooks/useFactoryContract";
import { useOrganizationContract } from "@/hooks/useOrganizationContract";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import CollectiveCard from "./CollectiveCard";

// Sample organization data for display purposes
export interface CollectiveCardData {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  bannerImage?: string;
  profileImage?: string;
}

const MyCollectives = () => {
  const { isConnected } = useAuth();
  const [collectives, setCollectives] = useState<CollectiveCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { account, connect } = useAuth();
  const { getUserMemberships } = useFactoryContract();
  const { getState: getOrganizationState } = useOrganizationContract();

  useEffect(() => {
    if (!account) connect();
    if (!account) return;
    getUserMemberships(account.getAddress() as unknown as BlockchainAddress)
      .then(async (orgs) => {
        console.log({ orgs });
        const orgIds = orgs.map((addr) => addr.asString());
        const orgsData = await Promise.all(
          orgIds.map(async (orgId) => {
            return await getOrganizationState(
              BlockchainAddress.fromString(orgId)
            );
          })
        );
        // Map orgsData to CollectiveCardData
        const collectivesData: CollectiveCardData[] = orgsData.map(
          (org, idx) => ({
            id: orgIds[idx],
            name: org.name || "Unnamed Collective",
            description: org.description || "",
            memberCount: org.members.length + 1, // +1 for the owner
            bannerImage: org.bannerImage,
            profileImage: org.profileImage,
          })
        );
        setCollectives(collectivesData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [isConnected]);

  // Helper function to generate sample data
  // const logoLinks = [
  //   "https://i.pinimg.com/736x/70/3a/90/703a90787dc3c4082339f683a3ad888b.jpg",
  //   "https://i.pinimg.com/736x/90/0c/7b/900c7b79813d50e36bd7bcbc1c0d9857.jpg",
  //   "https://i.pinimg.com/736x/29/db/ce/29dbceff6b775745ad39eeec91388652.jpg",
  // ];
  // const bannerLinks = [
  //   "https://i.pinimg.com/736x/01/55/b6/0155b60548f26a55a75a785cbe004522.jpg",
  //   "https://i.pinimg.com/736x/af/7a/72/af7a724cbf960da1b16b142b19df0aac.jpg",
  //   "https://i.pinimg.com/736x/f7/e1/10/f7e110f07b93fa34b7eb4e52627376c9.jpg",
  // ];
  // const generateCollectivesData = (
  //   addresses: BlockchainAddress[]
  // ): CollectiveCardData[] => {
  //   const names = [
  //     "DAO Explorers",
  //     "Blockchain Builders",
  //     "Web3 Innovators",
  //     "Crypto Collective",
  //     "DeFi Alliance",
  //     "NFT Creators Guild",
  //     "Token Engineers",
  //   ];

  //   const descriptions = [
  //     "A community of explorers pushing the boundaries of decentralized organizations.",
  //     "Building the future of blockchain technology one block at a time.",
  //     "Innovating at the intersection of web technologies and decentralized systems.",
  //     "A collective dedicated to advancing cryptocurrency adoption and education.",
  //     "Alliance of DeFi experts working to create more accessible financial tools.",
  //     "Guild of artists and developers creating innovative NFT experiences.",
  //     "Engineering the token economy of tomorrow through collaborative research.",
  //   ];

  //   // Generate sample data for each address
  //   return addresses.map((address, index) => {
  //     const randomNameIndex = index % names.length;
  //     const randomDescIndex = index % descriptions.length;
  //     const memberCount = Math.floor(Math.random() * 50) + 5; // Random between 5-55
  //     return {
  //       id: address.asString(),
  //       name: names[randomNameIndex],
  //       description: descriptions[randomDescIndex],
  //       memberCount,
  //       bannerImage: bannerLinks[index % bannerLinks.length],
  //       profileImage: logoLinks[index % logoLinks.length],
  //     };
  //   });
  // };

  // Add some mock collectives if factory state has none
  // useEffect(() => {
  //   if (factoryState && factoryState.organizations.length === 0) {
  //     // If no organizations exist, create some sample ones
  //     const mockAddresses = Array.from({ length: 5 }, (_, i) =>
  //       BlockchainAddress.fromString(
  //         `021${i}e54b707bd575ca32e4ab6be5790735661e0e3${i}`
  //       )
  //     );
  //     const sampleData = generateCollectivesData(mockAddresses);
  //     setCollectives(sampleData);
  //   }
  // }, [factoryState]);

  return (
    <div className="min-h-screen bg-sk-yellow-light">
      <div className="container mx-auto max-w-[1500px]">
        <NavBar />

        <section className="container mx-auto py-10 px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              My Collectives
            </h1>
            {isConnected && (
              <Link to="/collectives/new">
                <Button className="flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  New Collective
                </Button>
              </Link>
            )}
          </div>

          {!isConnected ? (
            <div className="bg-white rounded-lg border-2 border-black p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="mb-6 max-w-md mx-auto">
                To view and manage your collectives, please connect your wallet
                using the button in the navigation bar.
              </p>
              <div className="flex justify-center">
                <div className="animate-bounce bg-amber-100 p-4 border-2 border-black rounded-full">
                  <svg
                    className="w-6 h-6 transform rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card
                  key={i}
                  className="border-2 border-black rounded-lg overflow-hidden"
                >
                  <div className="animate-pulse">
                    <div className="h-40 bg-gray-200" />
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg border-2 border-black p-8">
              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <p className="text-red-500 font-semibold">
                  Error loading collectives: {error}
                </p>
              </div>
            </div>
          ) : collectives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collectives.map((collective, idx) => (
                <CollectiveCard
                  key={collective.id || idx}
                  collective={collective}
                />
              ))}

              {/* "Create New" card */}
              <Link to="/collectives/new">
                <Card className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-black transition-all cursor-pointer h-full bg-white/50 flex flex-col justify-center items-center py-10">
                  <div className="rounded-full bg-gray-100 p-4 mb-4">
                    <PlusIcon className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">
                    Create New Collective
                  </h3>
                </Card>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg border-2 border-black p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No Collectives Found</h2>
              <p className="mb-6">
                You don't have any collectives yet. Get started by creating your
                first one!
              </p>
              <Link to="/collectives/new">
                <Button>Create New Collective</Button>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyCollectives;
