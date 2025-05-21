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

  const isConnected = account !== null && walletAddress !== null;

  // Effect for session restoration - only runs on mount
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      // Don't restore if we already have an account or are connecting
      if (account || isConnecting) return;

      try {
        const session = SessionManager.getPartiWalletSession();
        if (!session?.connection?.account?.address) return;

        // Don't create read-only accounts, force user to reconnect
        SessionManager.clearWalletConnection();
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
  }, []); // Empty deps array - only run on mount

  // Connect method
  const connect = useCallback(async () => {
    if (isConnecting || account) return;

    setIsConnecting(true);
    setConnectError(null);

    try {
      console.log("Connecting to wallet...");
      const userAccount = await connectMpcWallet();

      if (userAccount) {
        const address = userAccount.getAddress().trim();
        setAccount(userAccount);
        setWalletAddress(address);
        setConnectError(null);
        console.log("Wallet connected successfully:", address);
      }
    } catch (error: unknown) {
      console.error("Wallet connection error:", error);
      // Clear any partial state on error
      setAccount(null);
      setWalletAddress(null);
      setConnectError(
        error instanceof Error ? error : new Error(String(error))
      );
      SessionManager.clearWalletConnection();
      throw error; // Re-throw to let callers handle the error
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, account]);

  // Disconnect method
  const disconnect = useCallback(async () => {
    try {
      setAccount(null);
      setWalletAddress(null);
      setConnectError(null);
      SessionManager.clearWalletConnection();
      console.log("Wallet disconnected");
    } catch (error) {
      console.error("Disconnect error:", error);
      throw error;
    }
  }, []);

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
        account,
        walletAddress,
        isConnecting,
        connectError,
        connect,
        disconnect,
        isMemberOf,
        canPerformAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
