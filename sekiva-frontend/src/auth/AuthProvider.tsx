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
  const [account, setAccount] = useState<SenderAuthentication | undefined>(
    () => {
      // Initialize account from session if available
      const session = SessionManager.getPartiWalletSession();
      if (session?.connection?.account?.address) {
        return {
          getAddress: () => session.connection.account.address,
          sign: async () => {
            throw new Error("Wallet not connected for signing");
          },
        };
      }
      return undefined;
    }
  );

  // Remove isConnected state since it's derived from account
  const isConnected = account !== undefined;

  // Single effect for session restoration
  useEffect(() => {
    const restoreSession = async () => {
      // Don't restore if we already have an account or are connecting
      if (account || isConnecting) return;

      try {
        const session = SessionManager.getPartiWalletSession();
        if (!session?.connection?.account?.address) return;

        const address = session.connection.account.address;
        setWalletAddress(address);
        setIsAuthenticated(true);

        // Restore read-only account
        const restoredAccount: SenderAuthentication = {
          getAddress: () => address,
          sign: async () => {
            throw new Error("Wallet not connected for signing");
          },
        };
        setAccount(restoredAccount);
        console.log("Restored session from storage, address:", address);
      } catch (error) {
        console.error("Failed to restore session:", error);
        // Clear invalid session
        SessionManager.clearWalletConnection();
      }
    };

    // Only try to restore on initial mount
    restoreSession();
  }, []); // Empty deps array - only run on mount

  const connect = async () => {
    if (isConnecting || account) return; // Don't connect if already connected

    setIsConnecting(true);
    try {
      console.log("Connecting to wallet...");
      const userAccount = await connectMpcWallet();

      if (userAccount) {
        const address = userAccount.getAddress().trim();
        setAccount(userAccount);
        setWalletAddress(address);
        setIsAuthenticated(true);
        console.log("Wallet connected successfully:", address);
      }
    } catch (error: unknown) {
      console.error("Wallet connection error:", error);
      // Clear any partial state on error
      setAccount(undefined);
      setWalletAddress(null);
      setIsAuthenticated(false);
      SessionManager.clearWalletConnection();
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (isDisconnecting) return;

    setIsDisconnecting(true);
    try {
      setAccount(undefined);
      setWalletAddress(null);
      setIsAuthenticated(false);
      SessionManager.clearWalletConnection();
      console.log("Wallet disconnected");
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Debug output in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Auth state:", {
        walletAddress,
        isAuthenticated,
        isConnecting,
        isDisconnecting,
        isConnected,
        account: account?.getAddress(),
      });
    }
  }, [walletAddress, isAuthenticated, isConnecting, isDisconnecting, account]);

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
