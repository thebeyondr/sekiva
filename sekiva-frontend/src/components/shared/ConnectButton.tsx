import { resetAccount, setAccount } from "@/AppState";
import { connectMpcWallet } from "@/shared/MpcWalletSignatureProvider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleUser, LogOut } from "lucide-react";
const truncateAddress = (address: string) => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};

const ConnectButton = () => {
  // const [connectionStatus, setConnectionStatus] = useState<string>("");
  // const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [label, setLabel] = useState<string>("sign in");

  const handleConnectWallet = async () => {
    resetAccount();
    setLabel("connecting...");

    try {
      const userAccount = await connectMpcWallet();
      setAccount(userAccount);
      // setWalletAddress(userAccount.getAddress());
      setLabel(truncateAddress(userAccount.getAddress().trim()));
    } catch (error: unknown) {
      console.error("Wallet connection error:", error);
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An error occurred trying to connect wallet");
      }
    }
  };

  const NotLoggedIn = <Button onClick={handleConnectWallet}>{label}</Button>;
  const LoggedIn = (
    <div className="flex items-center gap-1">
      <p className="text-sm">Logged in as</p>
      <span className="text-sm uppercase px-2 bg-amber-200 rounded-sm font-medium border border-stone-500">
        {truncateAddress(label)}
      </span>
      <p className="text-sm">|</p>
      <Button variant="link" size="icon" className="pl-2 font-bold">
        logout
      </Button>
    </div>
  );

  return <>{label === "sign in" ? NotLoggedIn : LoggedIn}</>;
};

export default ConnectButton;
