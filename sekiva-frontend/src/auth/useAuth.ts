import { useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext";

export type ActionType =
  | "create_ballot"
  | "vote"
  | "create_collective"
  | "manage_members"
  | "manage_admins"
  | "transfer_ownership"
  | "update_metadata"
  | "delete_collective";

/**
 * Main auth hook that provides access to the auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Generic hook for checking permissions and membership status
 */
export function usePermission(actionType: ActionType, targetId?: string) {
  const { canPerformAction, isConnected } = useAuth();
  return useCallback(async () => {
    if (!isConnected || !targetId) return false;
    return canPerformAction(actionType, targetId);
  }, [isConnected, canPerformAction, actionType, targetId]);
}

// Convenience hooks that use usePermission
export const useCanManageCollective = (collectionId?: string) =>
  usePermission("manage_members", collectionId);

export const useCanManageBallots = (collectionId?: string) =>
  usePermission("create_ballot", collectionId);

export const useIsOwner = (collectionId?: string) =>
  usePermission("transfer_ownership", collectionId);

export const useIsMember = (collectionId?: string) => {
  const { isMemberOf, isConnected } = useAuth();
  return useCallback(async () => {
    if (!isConnected || !collectionId) return false;
    return isMemberOf(collectionId);
  }, [isConnected, isMemberOf, collectionId]);
};
