import { useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { ClipboardCopy, Check, Wallet } from "lucide-react";

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

  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Simple notification helper
  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleConnect = async () => {
    try {
      await connect();
      showNotification("Successfully connected to your wallet");
    } catch (error) {
      showNotification(
        error instanceof Error
          ? error.message
          : "Could not connect to your wallet",
        "error"
      );
    }
  };

  const handleDisconnect = () => {
    disconnect();
    showNotification("You have been signed out");
  };

  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      showNotification("Wallet address copied to clipboard");

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
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
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex gap-2 items-center"
    >
      <Wallet size={16} />
      {label}
    </Button>
  );

  const LoggedIn = (
    <div className="flex items-center gap-1">
      <p className="text-sm hidden md:block">Logged in as</p>
      <div className="relative flex items-center">
        <p
          title={walletAddress ?? ""}
          className="text-sm uppercase px-1 bg-stone-50 rounded-sm font-medium border-[1.5px] border-stone-700 cursor-pointer flex items-center gap-1"
          onClick={copyToClipboard}
        >
          {walletAddress ? truncateAddress(walletAddress) : ""}
          <button
            className="ml-1 opacity-70 hover:opacity-100"
            onClick={copyToClipboard}
          >
            {copied ? <Check size={12} /> : <ClipboardCopy size={12} />}
          </button>
        </p>
      </div>
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

  return (
    <>
      {notification && notification.show && (
        <div
          className={`fixed top-4 right-4 p-2 rounded shadow-md text-sm max-w-xs z-50 ${
            notification.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {notification.message}
        </div>
      )}
      {isAuthenticated ? LoggedIn : NotLoggedIn}
    </>
  );
};

export default ConnectButton;
