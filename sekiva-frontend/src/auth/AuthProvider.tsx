import { useState, useEffect, useCallback, ReactNode } from "react";
import { connectMpcWallet } from "@/shared/MpcWalletSignatureProvider";
import { AuthContext } from "@/auth/AuthContext";
import { SessionManager } from "./SessionManager";
import { SenderAuthentication } from "@partisiablockchain/blockchain-api-transaction-client";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { CLIENT } from "@/partisia-config";
import { deserializeState as deserializeOrgState } from "@/contracts/OrganizationGenerated";

interface ContractData {
  serializedContract: {
    state: {
      data: string;
    };
  };
}

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

        const address = session.connection.account.address;

        // Create read-only account for restored session
        const restoredAccount: SenderAuthentication = {
          getAddress: () => address,
          sign: async () => {
            throw new Error("Wallet not connected for signing");
          },
        };

        if (isMounted) {
          setWalletAddress(address);
          setAccount(restoredAccount);
          setConnectError(null);
        }
        console.log("Restored session from storage, address:", address);
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
        // Get organization state directly
        const contract = (await CLIENT.getContractData(
          collectiveId,
          true
        )) as ContractData;
        if (!contract?.serializedContract?.state?.data) return false;

        const stateBuffer = Buffer.from(
          contract.serializedContract.state.data,
          "base64"
        );
        const state = deserializeOrgState(stateBuffer);

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
      if (!isConnected || !account || !walletAddress || !targetId) return false;

      try {
        // Get organization state directly
        const contract = (await CLIENT.getContractData(
          targetId,
          true
        )) as ContractData;
        if (!contract?.serializedContract?.state?.data) return false;

        const stateBuffer = Buffer.from(
          contract.serializedContract.state.data,
          "base64"
        );
        const state = deserializeOrgState(stateBuffer);

        const userAddress = BlockchainAddress.fromString(walletAddress);
        const isOwner = state.owner.asString() === userAddress.asString();
        const isAdmin = state.administrators.some(
          (admin) => admin.asString() === userAddress.asString()
        );
        const isMember = state.members.some(
          (member) => member.asString() === userAddress.asString()
        );

        switch (actionType) {
          case "create_ballot":
            // Owners and administrators can create ballots
            return isOwner || isAdmin;

          case "vote":
            // Owners, administrators and members can vote
            return isOwner || isAdmin || isMember;

          case "create_collective":
            // Anyone connected can create a collective
            return true;

          case "manage_members":
            // Owners and administrators can manage members
            return isOwner || isAdmin;

          case "manage_admins":
            // Only owners can manage administrators
            return isOwner;

          case "transfer_ownership":
            // Only the owner can transfer ownership
            return isOwner;

          case "update_metadata":
            // Owners and administrators can update organization metadata
            return isOwner || isAdmin;

          case "delete_collective":
            // Only the owner can delete the collective
            return isOwner;

          default:
            return false;
        }
      } catch (error) {
        console.error(`Permission check failed for ${actionType}:`, error);
        return false;
      }
    },
    [isConnected, account, walletAddress]
  );

  // Debug output in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Auth state:", {
        walletAddress,
        isConnected,
        isConnecting,
        connectError,
        account: account?.getAddress(),
      });
    }
  }, [walletAddress, isConnected, isConnecting, connectError, account]);

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
