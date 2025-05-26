import { ReactNode, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { SenderAuthentication } from "@partisiablockchain/blockchain-api-transaction-client";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { getOrganizationState } from "@/client/OrganizationClient";
import { checkPermission } from "@/auth/permissions";
import { ActionType } from "@/auth/useAuth";
import { usePartisiaWallet } from "./usePartisiaWallet";

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    connected,
    address,
    error: connectError,
    isConnecting,
    connect: connectWallet,
    disconnect: disconnectWallet,
    signMessage,
  } = usePartisiaWallet();

  const isConnected = connected && address !== null;

  // Create SenderAuthentication from SDK
  const account: SenderAuthentication | null = isConnected
    ? {
        getAddress: () => address!,
        sign: async (transactionPayload: Buffer) => {
          const res = await signMessage(transactionPayload.toString("hex"));
          return res.signature;
        },
      }
    : null;

  const connect = useCallback(async () => {
    await connectWallet();
  }, [connectWallet]);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
  }, [disconnectWallet]);

  const ensureSigningCapability = useCallback(async (): Promise<boolean> => {
    if (connected) return true;
    try {
      await connect();
      return true;
    } catch {
      return false;
    }
  }, [connected, connect]);

  const isMemberOf = useCallback(
    async (collectiveId: string): Promise<boolean> => {
      if (!isConnected || !address) return false;

      try {
        const state = await getOrganizationState(collectiveId);
        const userAddress = BlockchainAddress.fromString(address);

        return (
          state.owner.asString() === userAddress.asString() ||
          state.administrators.some(
            (admin: BlockchainAddress) =>
              admin.asString() === userAddress.asString()
          ) ||
          state.members.some(
            (member: BlockchainAddress) =>
              member.asString() === userAddress.asString()
          )
        );
      } catch (error) {
        console.error(`Failed to check membership for ${collectiveId}:`, error);
        return false;
      }
    },
    [isConnected, address]
  );

  const canPerformAction = useCallback(
    async (actionType: ActionType, targetId?: string): Promise<boolean> => {
      if (!isConnected || !address || !targetId) return false;

      try {
        const state = await getOrganizationState(targetId);
        const userAddress = BlockchainAddress.fromString(address);
        return checkPermission(actionType, state, userAddress);
      } catch (error) {
        console.error("[Auth] Permission check failed:", error);
        return false;
      }
    },
    [isConnected, address]
  );

  return (
    <AuthContext.Provider
      value={{
        isConnected,
        canSign: connected,
        account,
        walletAddress: address,
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
