import { useState } from "react";
import { connectMpcWallet } from "./shared/MpcWalletSignatureProvider";
import { setAccount, resetAccount } from "./AppState";
import { Button } from "./components/ui/button";
import { Link } from "react-router";
import NavBar from "./components/shared/NavBar";

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("");

  const handleConnectWallet = async () => {
    resetAccount();
    setConnectionStatus("Connecting...");

    try {
      const userAccount = await connectMpcWallet();
      setAccount(userAccount);
      setWalletAddress(userAccount.getAddress());
      setConnectionStatus(`Connected: ${userAccount.getAddress()}`);
    } catch (error: unknown) {
      console.error("Wallet connection error:", error);
      if (error instanceof Error) {
        setConnectionStatus(error.message);
      } else {
        setConnectionStatus("An error occurred trying to connect wallet");
      }
    }
  };

  return (
    <div className="h-screen bg-sk-yellow-light">
      <div className="container mx-auto max-w-[70vw]">
        <NavBar />
        <section>
          <h1 className="text-3xl font-bold">Sekiva</h1>
          <Button onClick={handleConnectWallet}>Connect Wallet</Button>
          <p>{walletAddress}</p>
          <p>{connectionStatus}</p>

          <Link to="/organizations">My Organizations</Link>
          <Link to="/organizations/new">New Organization</Link>
          <Link to="/organizations/1">Organization 1</Link>
        </section>
      </div>
    </div>
  );
}

export default App;
