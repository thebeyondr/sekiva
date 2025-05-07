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
    <div className="flex flex-col items-center justify-center h-screen bg-sk-yellow-light">
      <h1 className="text-3xl font-bold">Sekiva</h1>
      <Button onClick={handleConnectWallet}>Connect Wallet</Button>
    </div>
  );
}

export default App;
