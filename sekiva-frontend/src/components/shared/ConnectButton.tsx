import { useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { ClipboardCopy, Check, Wallet, ChevronUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const truncateAddress = (address: string) => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};

const NotificationToast = ({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) => (
  <div
    className={cn(
      "absolute top-full left-1/2 -translate-x-1/2 translate-y-2 p-2 text-sm",
      "bg-white border-2 border-black shadow-[-2px_2px_0px_0px_rgba(0,0,0,1)]",
      type === "error" ? "bg-sk-red-light" : "bg-stone-200"
    )}
  >
    <div className="relative">
      {message}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+10px)] border-8 border-transparent border-b-black" />
    </div>
  </div>
);

const ConnectButton = () => {
  const {
    walletAddress,
    isConnecting,
    isConnected,
    connectError,
    connect,
    disconnect,
  } = useAuth();

  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  };

  const handleConnect = async () => {
    try {
      await connect();
      showNotification("Wallet connected");
    } catch {
      showNotification(connectError?.message || "Connection failed", "error");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      showNotification("Wallet disconnected");
    } catch {
      showNotification("Disconnect failed", "error");
    }
  };

  const copyToClipboard = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    showNotification("Address copied");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <div className="relative inline-block">
        {notification && (
          <NotificationToast
            type={notification.type}
            message={notification.message}
          />
        )}
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className={cn(
            "flex gap-2 items-center bg-black text-white",
            "border-2 border-black rounded-none",
            "shadow-[-2px_2px_0px_0px_rgba(0,0,0,1)]",
            "hover:translate-x-[-2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          )}
        >
          <Wallet size={16} />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      </div>
    );
  }

  if (!walletAddress) return null;

  return (
    <div className="relative inline-block">
      {notification && (
        <NotificationToast
          type={notification.type}
          message={notification.message}
        />
      )}
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "text-sm uppercase px-2 py-1 bg-white",
                      "rounded-none font-medium border-2 border-black",
                      "shadow-[-2px_2px_0px_0px_rgba(0,0,0,1)]",
                      "hover:translate-x-[-2px] hover:translate-y-[2px] hover:shadow-none",
                      "transition-all flex items-center gap-2"
                    )}
                  >
                    <span>{truncateAddress(walletAddress)}</span>
                    {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className={cn(
                    "rounded-none border-2 border-black",
                    "shadow-[-2px_2px_0px_0px_rgba(0,0,0,1)]"
                  )}
                >
                  <DropdownMenuItem
                    onClick={copyToClipboard}
                    className="rounded-none focus:bg-sk-yellow-light"
                  >
                    <ClipboardCopy size={14} className="mr-2" />
                    Copy Address
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent
              className={cn(
                "rounded-none border-2 border-black",
                "shadow-[-2px_2px_0px_0px_rgba(0,0,0,1)]"
              )}
            >
              {walletAddress}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className={cn(
            "font-medium bg-white",
            "border-2 border-black rounded-none",
            "shadow-[-2px_2px_0px_0px_rgba(0,0,0,1)]",
            "hover:translate-x-[-2px] hover:translate-y-[2px] hover:shadow-none"
          )}
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
};

export default ConnectButton;
