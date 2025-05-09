import { useState, useEffect, ReactNode } from "react";
import { connectMpcWallet } from "@/shared/MpcWalletSignatureProvider";
import { resetAccount, setAccount, isConnected } from "@/AppState";
import { AuthContext } from "@/auth/AuthContext";
import { SessionManager, PartisiaWalletSession } from "./SessionManager";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    // Initialize from session instead of just localStorage
    const session = SessionManager.getSession();
    return session?.connection?.account?.address || null;
  });
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Initialize authentication state based on session
    return SessionManager.getSession() !== null;
  });

  // Effect to reconnect wallet when the component mounts
  useEffect(() => {
    const checkAndReconnect = async () => {
      // Skip if already connected
      if (isConnected()) return;

      // First check if Partisia browser has a connection
      const partiSession = SessionManager.checkForPartiWalletConnection();
      if (partiSession?.connection?.account?.address) {
        try {
          await reconnectFromSession(partiSession);
          return;
        } catch (error) {
          console.error(
            "Failed to reconnect from Parti browser session:",
            error
          );
        }
      }

      // Fall back to our own session storage
      const savedSession = SessionManager.getSession();
      if (savedSession?.connection?.account?.address) {
        try {
          await reconnectFromSession(savedSession);
        } catch (error) {
          console.error("Final reconnection attempt failed:", error);
          // Clear invalid session
          SessionManager.clearSession();
          disconnect();
        }
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

  const reconnectFromSession = async (session: PartisiaWalletSession) => {
    if (isConnecting) return false; // Prevent multiple reconnect attempts

    setIsConnecting(true);
    try {
      console.log("Reconnecting wallet...");
      const userAccount = await connectMpcWallet(session);

      if (userAccount) {
        console.log("Wallet reconnected successfully");
        setAccount(userAccount);

        // Verify the address from the account matches session
        const address = userAccount.getAddress().trim();

        if (address === session.connection.account.address) {
          setWalletAddress(address);
          setIsAuthenticated(true);

          // Update session with fresh timestamp
          SessionManager.saveSession({
            ...session,
            lastConnected: Date.now(),
          });

          return true;
        } else {
          console.error("Address mismatch during reconnection");
          throw new Error("Address mismatch during reconnection");
        }
      }
    } catch (error) {
      console.error("Failed to reconnect wallet:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }

    return false;
  };

  const connect = async () => {
    if (isConnecting) return; // Prevent multiple connect attempts

    resetAccount();
    setIsConnecting(true);

    try {
      // Check for existing Partisia browser connection
      const partiSession = SessionManager.checkForPartiWalletConnection();

      console.log("Connecting to wallet...");
      const userAccount = await connectMpcWallet(partiSession || undefined);

      if (userAccount) {
        console.log("Wallet connected successfully");
        setAccount(userAccount);

        const address = userAccount.getAddress().trim();
        setWalletAddress(address);
        setIsAuthenticated(true);

        // Create and save session data
        const sessionData: PartisiaWalletSession = {
          walletType: partiSession?.walletType || "parti",
          connection: partiSession?.connection || {
            account: {
              address,
              pub: "", // We'd need to get this from the wallet
              shard_id: 1, // Default shard
            },
          },
          lastConnected: Date.now(),
        };

        // Save to storage
        SessionManager.saveSession(sessionData);
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
    resetAccount();
    setWalletAddress(null);
    setIsAuthenticated(false);

    // Clear session data
    SessionManager.clearSession();

    setIsDisconnecting(false);
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
        session: SessionManager.getSession(),
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
