import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const truncateAddress = (address: string) => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};

const ConnectButton = () => {
  const { walletAddress, isLoading, connect, disconnect, isAuthenticated } =
    useAuth();

  // Debug logging
  useEffect(() => {
    console.log("ConnectButton render state:", {
      isAuthenticated,
      walletAddress,
      isLoading,
    });
  }, [isAuthenticated, walletAddress, isLoading]);

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const label = isLoading
    ? "connecting..."
    : walletAddress
      ? truncateAddress(walletAddress)
      : "sign in";

  const NotLoggedIn = (
    <Button onClick={handleConnect} disabled={isLoading}>
      {label}
    </Button>
  );
  const LoggedIn = (
    <div className="flex items-center gap-1">
      <p className="text-sm">Logged in as</p>
      <p
        title={walletAddress ?? ""}
        className="text-sm uppercase px-1 bg-amber-200 rounded-sm font-medium border border-stone-500"
      >
        {walletAddress ? truncateAddress(walletAddress) : ""}
      </p>
      <p className="text-sm">|</p>
      <Button
        variant="link"
        size="icon"
        className="pl-2 font-bold"
        onClick={handleDisconnect}
      >
        logout
      </Button>
    </div>
  );

  return <>{isAuthenticated ? LoggedIn : NotLoggedIn}</>;
};

export default ConnectButton;
