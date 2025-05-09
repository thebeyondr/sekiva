import NavBar from "@/components/shared/NavBar";
import bauhausIllustration from "@/assets/bauhaus-illustration.webp";
import { Link } from "react-router";
import { Button } from "./components/ui/button";
import { useEffect, useState } from "react";
import { SekivaFactoryClient } from "./contracts/factory/client";
import { SekivaFactoryBasicState } from "./contracts/factory/api";
import { CLIENT } from "./AppState";

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
          <div className="w-[30%] xl:w-[50%] h-full">
            <img
              src={bauhausIllustration}
              alt="Sekiva Illustration"
              className="w-full h-full"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center max-w-[85%] space-y-2">
            <h1 className="text-3xl xl:text-6xl text-center tracking-tighter ">
              Private on-chain ballots for modern collectives
            </h1>
            <p className="text-center text-sm xl:text-base">
              powered by{" "}
              <Link to="https://partisiablockchain.com" target="_blank">
                <Button
                  variant="link"
                  className="p-0 text-blue-600 text-lg tracking-tight font-medium"
                >
                  Partisia Blockchain
                </Button>
              </Link>
            </p>
            <Link to="/collectives/new" className="w-fit mx-auto">
              <Button className="w-fit mx-auto text-lg">
                start collective
              </Button>
            </Link>
          </div>
        </section>
        <section className="flex flex-col gap-4 py-10">
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
            <div className="bg-white p-4 rounded shadow-sm">
              <p>
                <strong>Admin:</strong> {factoryState.admin?.asString()}
              </p>
              <div>
                <strong>
                  Organizations ({factoryState.organizations.length}):
                </strong>
                <ul className="list-disc pl-5">
                  {factoryState.organizations.map((org, index) => (
                    <li key={index}>
                      <Link
                        to={`https://browser.testnet.partisiablockchain.com/contracts/${org.asString()}?tab=state`}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        {org.asString()}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Ballots ({factoryState.ballots.length}):</strong>
                <ul className="list-disc pl-5">
                  {factoryState.ballots.map((ballot, index) => (
                    <li key={index}>
                      <Link
                        to={`https://browser.testnet.partisiablockchain.com/contracts/${ballot.asString()}?tab=state`}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        {ballot.asString()}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;
