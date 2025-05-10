import NavBar from "@/components/shared/NavBar";
import bauhausIllustration from "@/assets/bauhaus-illustration.webp";
import { Link } from "react-router";
import { Button } from "./components/ui/button";
import { useEffect, useState } from "react";
import { SekivaFactoryClient } from "./contracts/factory/client";
import { SekivaFactoryBasicState } from "./contracts/factory/api";
import { CLIENT } from "./AppState";
import { LayoutGrid, Plus } from "lucide-react";

function Home() {
  const [factoryState, setFactoryState] =
    useState<SekivaFactoryBasicState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchFactoryState = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create factory client using the global CLIENT instance
      const factoryClient = new SekivaFactoryClient(CLIENT);

      // Get factory state
      const state = await factoryClient.getState();

      setFactoryState(state);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Error fetching factory state:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactoryState();
  }, []);

  const handleRefresh = () => {
    fetchFactoryState();
  };

  return (
    <div className="h-screen bg-sk-yellow-light overflow-auto">
      <div className="container mx-auto max-w-[1500px]">
        <NavBar />
        <section className="flex flex-col xl:flex-row gap-4 py-10">
          <div className="w-full xl:w-[50%] h-full">
            <img
              src={bauhausIllustration}
              alt="Sekiva Illustration"
              className="w-full h-full"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-6 px-4">
            <h1 className="text-3xl sm:text-4xl xl:text-6xl font-bold tracking-tighter max-w-2xl">
              Private on-chain ballots for modern collectives
            </h1>
            <p className="text-lg max-w-xl">
              Build decentralized organizations with secure private voting on{" "}
              <Link
                to="https://partisiablockchain.com"
                target="_blank"
                className="text-blue-600 font-medium hover:underline"
              >
                Partisia Blockchain
              </Link>
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/collectives">
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex items-center gap-2 border-2 border-black"
                >
                  <LayoutGrid className="w-5 h-5" />
                  View Collectives
                </Button>
              </Link>

              <Link to="/collectives/new">
                <Button size="lg" className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Start Collective
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 py-10 px-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Factory Contract State:</h2>
            <div className="flex items-center gap-2">
              {lastRefreshed && (
                <span className="text-xs text-gray-500">
                  Last refreshed: {lastRefreshed.toLocaleTimeString()}
                </span>
              )}
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh Data"}
              </Button>
            </div>
          </div>
          {loading && <p>Loading contract state...</p>}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <p className="text-red-500 font-semibold">Error: {error}</p>
            </div>
          )}
          {factoryState && (
            <div className="bg-white p-4 rounded shadow-sm border border-black">
              <p>
                <strong>Admin:</strong> {factoryState.admin?.asString()}
              </p>
              <div>
                <strong>
                  Organizations ({factoryState.organizations.length}):
                </strong>
                <ul className="list-disc pl-5">
                  {factoryState.organizations.map((org, index) => (
                    <li
                      key={index}
                      className="flex flex-wrap items-center gap-2 mb-2"
                    >
                      <span className="font-mono text-sm truncate">
                        {org.asString()}
                      </span>
                      <div className="flex gap-2 ml-auto">
                        <Link
                          to={`https://browser.testnet.partisiablockchain.com/contracts/${org.asString()}?tab=state`}
                          target="_blank"
                          className="text-blue-600 text-xs px-2 py-1 border border-blue-600 rounded hover:bg-blue-50"
                        >
                          Explorer
                        </Link>
                        <Link
                          to={`/collectives/${org.asString()}`}
                          className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                        >
                          View
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <strong>Ballots ({factoryState.ballots.length}):</strong>
                <ul className="list-disc pl-5">
                  {factoryState.ballots.map((ballot, index) => (
                    <li key={index} className="mb-1">
                      <Link
                        to={`https://browser.testnet.partisiablockchain.com/contracts/${ballot.asString()}?tab=state`}
                        target="_blank"
                        className="font-mono text-sm text-blue-600 hover:underline"
                      >
                        {ballot.asString()}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center">
                <Link to="/collectives" className="inline-block">
                  <Button variant="outline" className="border-2 border-black">
                    Go to Collectives Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;
