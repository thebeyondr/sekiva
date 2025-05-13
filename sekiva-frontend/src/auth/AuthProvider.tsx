import { useState, useEffect, ReactNode } from "react";
import { connectMpcWallet } from "@/shared/MpcWalletSignatureProvider";
import {
  resetAccount,
  setAccount,
  isConnected as isConnectedFn,
} from "@/AppState";
import { AuthContext } from "@/auth/AuthContext";
import { SessionManager } from "./SessionManager";
import { SenderAuthentication } from "@partisiablockchain/blockchain-api-transaction-client";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    // Initialize from Partisia wallet session if available
    return SessionManager.getWalletAddress();
  });
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Initialize authentication state based on wallet connection
    return SessionManager.hasWalletConnection();
  });
  const [isConnected, setIsConnected] = useState<boolean>(() =>
    isConnectedFn()
  );

  // Effect to keep isConnected in sync with state
  useEffect(() => {
    setIsConnected(isConnectedFn());
  }, [walletAddress, isAuthenticated, isConnecting, isDisconnecting]);

  // Effect to reconnect wallet when the component mounts
  useEffect(() => {
    const checkAndReconnect = async () => {
      // Skip if already connected
      if (isConnectedFn()) return;

      try {
        // First check if we have partiWalletConnection in sessionStorage
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

    // Only try to reconnect after the page is fully loaded
    if (document.readyState === "complete") {
      checkAndReconnect();
    } else {
      window.addEventListener("load", checkAndReconnect);
      return () => window.removeEventListener("load", checkAndReconnect);
    }
  }, []);

  const connect = async () => {
    if (isConnecting) return;

    resetAccount();
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
      // Clear the state
      resetAccount();
      setWalletAddress(null);
      setIsAuthenticated(false);
      setIsConnected(false);

      // The Partisia SDK does not have an explicit disconnect method
      // It only requires clearing the session from storage
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
        walletSession: SessionManager.getPartiWalletSession(),
      });
    }
  }, [
    walletAddress,
    isAuthenticated,
    isConnecting,
    isDisconnecting,
    isConnected,
  ]);

  return (
    <AuthContext.Provider
      value={{
        walletAddress,
        isConnecting,
        isDisconnecting,
        isConnected,
        isDisconnected: !isConnected,
        connect,
        disconnect,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
