import NavBar from "@/components/shared/NavBar";
import bauhausIllustration from "@/assets/bauhaus-illustration.webp";
import { Link } from "react-router";
import { Button } from "./components/ui/button";
import { useEffect, useState } from "react";
import { SekivaFactoryClient } from "./contracts/factory/client";
import { ShardedClient } from "@/client/ShardedClient";
import { SekivaFactoryBasicState } from "./contracts/factory/api";
import { BlockchainAddress } from "@partisiablockchain/abi-client";

interface DebugInfo {
  shardId?: string | null;
  directFetch?: string;
  directFetchError?: string;
  clientInfo?: Record<string, unknown>;
  mainError?: Error | string;
}

function Home() {
  const [factoryState, setFactoryState] =
    useState<SekivaFactoryBasicState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  useEffect(() => {
    const fetchFactoryState = async () => {
      setLoading(true);
      try {
        console.log("Initializing ShardedClient...");
        // Try alternative endpoints
        const baseUrl = "https://node1.testnet.partisiablockchain.com";
        const shards = ["Shard0", "Shard1", "Shard2"];

        // Initialize ShardedClient with base URL and shards
        const shardedClient = new ShardedClient(baseUrl, shards);
        console.log("ShardedClient initialized");

        // Test the connection by trying to access contract by ID
        const contractAddress = "0215e54b707bd575ca32e4ab6be5790735661e0e33";

        // Try accessing via the underlying PbcClient to debug
        console.log("Testing direct contract data fetch...");
        try {
          const shardId = shardedClient.shardForAddress(contractAddress);
          setDebugInfo((prev) => ({ ...prev, shardId }));

          console.log("Shard ID for contract:", shardId);
          const client = shardedClient.getClient(shardId);

          // Try direct fetch
          const contractData = await client.getContractData(
            contractAddress,
            true
          );
          setDebugInfo((prev) => ({
            ...prev,
            directFetch: contractData ? "success" : "null",
            clientInfo: { host: client?.host },
          }));

          console.log("Direct fetch result:", contractData);

          // If direct fetch works but we don't have a proper contract state yet,
          // create a minimal state for display
          if (contractData && !factoryState) {
            // Create a basic state with minimal information
            const basicState: SekivaFactoryBasicState = {
              admin: BlockchainAddress.fromString(contractAddress),
              organizations: [],
              ballots: [],
              userOrgMemberships: new Map(),
              organizationBallots: new Map(),
            };
            setFactoryState(basicState);
          }
        } catch (directErr) {
          console.error("Error in direct fetch:", directErr);
          setDebugInfo((prev) => ({
            ...prev,
            directFetchError:
              directErr instanceof Error
                ? directErr.message
                : String(directErr),
          }));
        }

        // Create factory client
        console.log("Creating factory client...");
        const factoryClient = new SekivaFactoryClient(shardedClient);

        // Get factory state
        console.log("Fetching factory state...");
        const state = await factoryClient.getState();
        console.log("Factory state fetched:", state);
        setFactoryState(state);
      } catch (err) {
        console.error("Error fetching factory state:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setDebugInfo((prev) => ({ ...prev, mainError: errorMessage }));

        // Try a fallback with hardcoded data
        if (!factoryState) {
          console.log("Using fallback data...");
          const fallbackState: SekivaFactoryBasicState = {
            admin: BlockchainAddress.fromString(
              "0215e54b707bd575ca32e4ab6be5790735661e0e33"
            ),
            organizations: [],
            ballots: [],
            userOrgMemberships: new Map(),
            organizationBallots: new Map(),
          };
          setFactoryState(fallbackState);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFactoryState();
  }, []);

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
          <h2 className="text-xl font-semibold">Factory Contract State:</h2>
          {loading && <p>Loading contract state...</p>}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <p className="text-red-500 font-semibold">Error: {error}</p>
              {debugInfo && (
                <div className="mt-4">
                  <h3 className="font-medium">Debug Information:</h3>
                  <pre className="bg-gray-100 p-2 mt-2 text-xs overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
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
                    <li key={index}>{org.asString()}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Ballots ({factoryState.ballots.length}):</strong>
                <ul className="list-disc pl-5">
                  {factoryState.ballots.map((ballot, index) => (
                    <li key={index}>{ballot.asString()}</li>
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
