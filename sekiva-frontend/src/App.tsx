import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { useState } from "react";
import { connectMpcWallet } from "./shared/MpcWalletSignatureProvider";
import { setAccount, resetAccount } from "./AppState";
import { Button } from "./components/ui/button";

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
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="text-3xl font-bold underline">Vite + React</h1>
      <div className="card">
        <Button onClick={handleConnectWallet}>Connect Wallet</Button>

        {connectionStatus && (
          <p className="connection-status">{connectionStatus}</p>
        )}

        {walletAddress && (
          <p className="wallet-info">Connected to: {walletAddress}</p>
        )}

        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
