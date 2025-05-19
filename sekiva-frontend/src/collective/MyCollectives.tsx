import { useAuth } from "@/auth/useAuth";
import NavBar from "@/components/shared/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusIcon, WalletIcon } from "lucide-react";
import { Link } from "react-router";
import CollectiveCard from "./CollectiveCard";
import { useCollectives } from "./useCollectives";

// Sample organization data for display purposes
export interface CollectiveCardData {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  bannerImage?: string;
  profileImage?: string;
}

const CreateNewCard = () => (
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
);

const WalletPrompt = () => (
  <div className="bg-white rounded-lg border-2 border-black p-8 text-center">
    <h2 className="text-2xl font-bold mb-4">Connect your wallet</h2>
    <p className="mb-6 max-w-md mx-auto">
      Use the button with the wallet icon in the nav bar to view your
      collectives.
    </p>
    <div className="flex justify-center">
      <div className="bg-amber-100 p-4 border-2 border-black rounded-full">
        <WalletIcon className="w-10 h-10" />
      </div>
    </div>
    <p className="mt-4 text-sm text-gray-600">
      Don't have a wallet? Install the{" "}
      <a
        href="https://chromewebstore.google.com/detail/parti-wallet/gjkdbeaiifkpoencioahhcilildpjhgh"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        Parti Wallet extension 🎉
      </a>{" "}
      for Chrome or Brave browsers.
    </p>
  </div>
);

const LoadingGrid = () => (
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
);

const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="bg-white rounded-lg border-2 border-black p-8">
    <div className="bg-red-50 border border-red-200 p-4 rounded">
      <p className="text-red-500 font-semibold">
        Error loading collectives: {error}
      </p>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="bg-white rounded-lg border-2 border-black p-8 text-center">
    <h2 className="text-2xl font-bold mb-4">No Collectives Found</h2>
    <p className="mb-6">
      You don't have any collectives yet. Get started by creating your first
      one!
    </p>
    <Link to="/collectives/new">
      <Button>Create New Collective</Button>
    </Link>
  </div>
);

const CollectivesGrid = ({
  collectives,
}: {
  collectives: CollectiveCardData[];
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {collectives.map((collective) => (
      <CollectiveCard key={collective.id} collective={collective} />
    ))}
    <CreateNewCard />
  </div>
);

const MyCollectives = () => {
  const { isConnected } = useAuth();
  const { collectives, loading, error, refresh } = useCollectives();

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
              <div className="flex gap-2">
                <Button onClick={refresh} variant="outline" disabled={loading}>
                  Refresh
                </Button>
                <Link to="/collectives/new">
                  <Button className="flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" />
                    New
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {!isConnected ? (
            <WalletPrompt />
          ) : loading ? (
            <LoadingGrid />
          ) : error ? (
            <ErrorDisplay error={error} />
          ) : collectives.length > 0 ? (
            <CollectivesGrid collectives={collectives} />
          ) : (
            <EmptyState />
          )}
        </section>
      </div>
    </div>
  );
};

export default MyCollectives;
