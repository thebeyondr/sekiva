import { useState, useEffect, ReactNode } from "react";
import { connectMpcWallet } from "@/shared/MpcWalletSignatureProvider";
import { resetAccount, setAccount, isConnected } from "@/AppState";
import { AuthContext } from "@/auth/AuthContext";
import { SessionManager } from "./SessionManager";

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

  // Effect to reconnect wallet when the component mounts
  useEffect(() => {
    const checkAndReconnect = async () => {
      // Skip if already connected
      if (isConnected()) return;

      try {
        // First check if we have partiWalletConnection in sessionStorage
        const session = SessionManager.getPartiWalletSession();
        if (session?.connection?.account?.address) {
          // If we have a session, we can use it to set up the wallet state
          // without prompting the user again for connection
          setWalletAddress(session.connection.account.address);
          setIsAuthenticated(true);
          console.log(
            "Restored session from storage, address:",
            session.connection.account.address
          );

          // No need to prompt the user again for connection
          // Just set up our local state based on the session
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
        isConnected: isConnected(),
        isDisconnected: !isConnected(),
        walletSession: SessionManager.getPartiWalletSession(),
      });
    }
  }, [walletAddress, isAuthenticated, isConnecting, isDisconnecting]);

  return (
    <AuthContext.Provider
      value={{
        walletAddress,
        isConnecting,
        isDisconnecting,
        isConnected: isConnected(),
        isDisconnected: !isConnected(),
        connect,
        disconnect,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
