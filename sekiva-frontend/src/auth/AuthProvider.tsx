import { useState, useEffect, ReactNode } from "react";
import { connectMpcWallet } from "@/shared/MpcWalletSignatureProvider";
import { AuthContext } from "@/auth/AuthContext";
import { SessionManager } from "./SessionManager";
import { SenderAuthentication } from "@partisiablockchain/blockchain-api-transaction-client";

export function AuthProvider({ children }: { children: ReactNode }) {
  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string | null>(() =>
    SessionManager.getWalletAddress()
  );
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    SessionManager.hasWalletConnection()
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [account, setAccount] = useState<SenderAuthentication | undefined>(
    undefined
  );

  // Effect to keep isConnected in sync with state
  useEffect(() => {
    setIsConnected(account !== undefined);
  }, [account]);

  // Effect to reconnect wallet when the component mounts
  useEffect(() => {
    const checkAndReconnect = async () => {
      if (account) return;

      try {
        const session = SessionManager.getPartiWalletSession();
        if (session?.connection?.account?.address) {
          setWalletAddress(session.connection.account.address);
          setIsAuthenticated(true);
          setIsConnected(true);

          // Restore SenderAuthentication for read-only (no sign)
          const restoredAccount: SenderAuthentication = {
            getAddress: () => session.connection.account.address,
            sign: async () => {
              throw new Error("Wallet not connected for signing");
            },
          };
          setAccount(restoredAccount);
          console.log(
            "Restored session from storage, address:",
            session.connection.account.address
          );
        }
      } catch (error) {
        console.error("Failed to reconnect from stored session:", error);
      }
    };

    if (document.readyState === "complete") {
      checkAndReconnect();
    } else {
      window.addEventListener("load", checkAndReconnect);
      return () => window.removeEventListener("load", checkAndReconnect);
    }
  }, [account]);

  const connect = async () => {
    if (isConnecting) return;

    setAccount(undefined);
    setIsConnecting(true);

    try {
      console.log("Connecting to wallet...");
      const userAccount = await connectMpcWallet();

      if (userAccount) {
        console.log("Wallet connected successfully");
        setAccount(userAccount);
        const address = userAccount.getAddress().trim();
        setWalletAddress(address);
        setIsAuthenticated(true);
        setIsConnected(true);
      }
    } catch (error: unknown) {
      console.error("Wallet connection error:", error);
      disconnect();
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    console.log("Disconnecting wallet");
    setIsDisconnecting(true);

    try {
      setAccount(undefined);
      setWalletAddress(null);
      setIsAuthenticated(false);
      setIsConnected(false);
      SessionManager.clearWalletConnection();
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Debug output in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Auth state updated:", {
        walletAddress,
        isAuthenticated,
        isConnecting,
        isDisconnecting,
        isConnected,
        isDisconnected: !isConnected,
        account: account?.getAddress(),
      });
    }
  }, [
    walletAddress,
    isAuthenticated,
    isConnecting,
    isDisconnecting,
    isConnected,
    account,
  ]);

  return (
    <AuthContext.Provider
      value={{
        walletAddress,
        isConnecting,
        isDisconnecting,
        isConnected,
        isDisconnected: !isConnected,
        isAuthenticated,
        account,
        connect,
        disconnect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
