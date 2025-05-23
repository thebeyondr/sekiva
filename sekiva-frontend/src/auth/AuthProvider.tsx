import { useState, useEffect, useCallback, ReactNode } from "react";
import { connectMpcWallet } from "@/shared/MpcWalletSignatureProvider";
import { AuthContext } from "@/auth/AuthContext";
import { SessionManager } from "./SessionManager";
import { SenderAuthentication } from "@partisiablockchain/blockchain-api-transaction-client";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { getOrganizationState } from "@/hooks/useOrganizationContract";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<SenderAuthentication | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<Error | null>(null);
  const [canSign, setCanSign] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);

  const isConnected = account !== null && walletAddress !== null;

  // Effect for SDK initialization
  useEffect(() => {
    let isMounted = true;

    const initializeSdk = async () => {
      try {
        // Wait for crypto polyfills and any other SDK prerequisites
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (isMounted) {
          setSdkInitialized(true);
        }
      } catch (error) {
        console.error("Failed to initialize SDK:", error);
      }
    };

    initializeSdk();
    return () => {
      isMounted = false;
    };
  }, []);

  // Effect for session restoration - only runs after SDK is initialized
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      if (!sdkInitialized || account || isConnecting) return;

      try {
        const session = SessionManager.getPartiWalletSession();
        if (!session?.connection?.account?.address) return;

        const address = session.connection.account.address.trim();
        console.log("Attempting to restore session for address:", address);

        // First, try to restore full wallet connection via SDK
        try {
          const userAccount = await connectMpcWallet();
          if (userAccount && userAccount.getAddress() === address) {
            if (isMounted) {
              setAccount(userAccount);
              setWalletAddress(address);
              setCanSign(true);
              console.log("Full wallet connection restored:", address);
            }
            return;
          }
        } catch (sdkError) {
          console.log(
            "SDK reconnection failed, falling back to read-only mode:",
            sdkError
          );
        }

        // Fallback: Create a read-only SenderAuthentication
        if (isMounted) {
          const restoredAccount: SenderAuthentication = {
            getAddress: () => address,
            sign: async () => {
              throw new Error(
                "Please reconnect your wallet to sign transactions"
              );
            },
          };

          setAccount(restoredAccount);
          setWalletAddress(address);
          setCanSign(false);
          console.log(
            "Session restored in read-only mode for address:",
            address
          );
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        if (isMounted) {
          setConnectError(
            error instanceof Error ? error : new Error(String(error))
          );
          // Clear invalid session
          SessionManager.clearWalletConnection();
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [sdkInitialized, account, isConnecting]);

  // Disconnect method
  const disconnect = useCallback(async () => {
    try {
      setAccount(null);
      setWalletAddress(null);
      setCanSign(false);
      setConnectError(null);
      SessionManager.clearWalletConnection();
      console.log("Wallet disconnected");
    } catch (error) {
      console.error("Disconnect error:", error);
      throw error;
    }
  }, []);

  // Connect method - always establishes a full signing connection
  const connect = useCallback(async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    setConnectError(null);

    try {
      // If we have a read-only connection, clear it first
      if (isConnected && !canSign) {
        await disconnect();
      }

      console.log("Connecting to wallet...");
      const userAccount = await connectMpcWallet();

      if (userAccount) {
        const address = userAccount.getAddress().trim();
        setAccount(userAccount);
        setWalletAddress(address);
        setCanSign(true);
        setConnectError(null);
        console.log("Wallet connected successfully:", address);
      }
    } catch (error: unknown) {
      console.error("Wallet connection error:", error);
      // Clear any partial state on error
      setAccount(null);
      setWalletAddress(null);
      setCanSign(false);
      setConnectError(
        error instanceof Error ? error : new Error(String(error))
      );
      SessionManager.clearWalletConnection();
      throw error; // Re-throw to let callers handle the error
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, canSign, disconnect]);

  // Method to ensure we have signing capability
  const ensureSigningCapability = useCallback(async (): Promise<boolean> => {
    if (canSign) return true;

    try {
      await connect();
      return true;
    } catch (error) {
      console.error("Failed to establish signing capability:", error);
      return false;
    }
  }, [canSign, connect]);

  // Permission checking methods
  const isMemberOf = useCallback(
    async (collectiveId: string): Promise<boolean> => {
      if (!isConnected || !account || !walletAddress) return false;

      try {
        const state = await getOrganizationState(collectiveId);
        const userAddress = BlockchainAddress.fromString(walletAddress);

        return (
          state.owner.asString() === userAddress.asString() ||
          state.administrators.some(
            (admin) => admin.asString() === userAddress.asString()
          ) ||
          state.members.some(
            (member) => member.asString() === userAddress.asString()
          )
        );
      } catch (error) {
        console.error(
          `Failed to check membership for collection ${collectiveId}:`,
          error
        );
        return false;
      }
    },
    [isConnected, account, walletAddress]
  );

  const canPerformAction = useCallback(
    async (actionType: string, targetId?: string): Promise<boolean> => {
      if (!isConnected || !account || !walletAddress || !targetId) {
        return false;
      }

      try {
        const state = await getOrganizationState(targetId);
        const userAddress = BlockchainAddress.fromString(walletAddress);

        const isOwner = state.owner.asString() === userAddress.asString();
        const isAdmin = state.administrators.some(
          (admin) => admin.asString() === userAddress.asString()
        );
        const isMember = state.members.some(
          (member) => member.asString() === userAddress.asString()
        );

        let result = false;
        switch (actionType) {
          case "create_ballot":
            result = isOwner || isAdmin;
            break;
          case "vote":
            result = isOwner || isAdmin || isMember;
            break;
          case "create_collective":
            result = true;
            break;
          case "manage_members":
            result = isOwner || isAdmin;
            break;
          case "manage_admins":
            result = isOwner;
            break;
          case "transfer_ownership":
            result = isOwner;
            break;
          case "update_metadata":
            result = isOwner || isAdmin;
            break;
          case "delete_collective":
            result = isOwner;
            break;
          default:
            result = false;
        }

        return result;
      } catch (error) {
        console.error("[Auth] Permission check failed:", error);
        return false;
      }
    },
    [isConnected, account, walletAddress]
  );

  return (
    <AuthContext.Provider
      value={{
        isConnected,
        canSign,
        account,
        walletAddress,
        isConnecting,
        connectError,
        connect,
        disconnect,
        ensureSigningCapability,
        isMemberOf,
        canPerformAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
