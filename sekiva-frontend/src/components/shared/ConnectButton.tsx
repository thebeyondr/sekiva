import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";

const truncateAddress = (address: string) => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};

const ConnectButton = () => {
  const {
    walletAddress,
    isConnecting,
    isDisconnecting,
    isConnected,
    isDisconnected,
    connect,
    disconnect,
    isAuthenticated,
  } = useAuth();

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const label = isConnecting
    ? "connecting..."
    : isDisconnecting
      ? "disconnecting..."
      : isConnected
        ? truncateAddress(walletAddress ?? "")
        : isDisconnected
          ? "sign in"
          : "loading...";

  const NotLoggedIn = (
    <Button onClick={handleConnect} disabled={isConnecting}>
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
        disabled={isDisconnecting}
      >
        logout
      </Button>
    </div>
  );

  return <>{isAuthenticated ? LoggedIn : NotLoggedIn}</>;
};

export default ConnectButton;
