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
 * Hook for checking if user can perform a specific action
 */
export function useCanPerform(actionType: ActionType, targetId?: string) {
  const { canPerformAction, isConnected } = useAuth();

  return useCallback(async () => {
    if (!isConnected || !targetId) return false;
    return canPerformAction(actionType, targetId);
  }, [isConnected, canPerformAction, actionType, targetId]);
}

/**
 * Hook for checking if user is a member of a collective
 */
export function useIsMember(collectionId?: string) {
  const { isMemberOf, isConnected } = useAuth();

  return useCallback(async () => {
    if (!isConnected || !collectionId) return false;
    return isMemberOf(collectionId);
  }, [isConnected, isMemberOf, collectionId]);
}

/**
 * Hook for checking if user can manage a collective (is owner or admin)
 */
export function useCanManageCollective(collectionId?: string) {
  const { canPerformAction, isConnected } = useAuth();

  return useCallback(async () => {
    if (!isConnected || !collectionId) return false;
    return canPerformAction("manage_members", collectionId);
  }, [isConnected, canPerformAction, collectionId]);
}

/**
 * Hook for checking if user can manage ballots in a collective
 */
export function useCanManageBallots(collectionId?: string) {
  const { canPerformAction, isConnected } = useAuth();

  return useCallback(async () => {
    if (!isConnected || !collectionId) return false;
    return canPerformAction("create_ballot", collectionId);
  }, [isConnected, canPerformAction, collectionId]);
}

/**
 * Hook for checking if user is the owner of a collective
 */
export function useIsOwner(collectionId?: string) {
  const { canPerformAction, isConnected } = useAuth();

  return useCallback(async () => {
    if (!isConnected || !collectionId) return false;
    return canPerformAction("transfer_ownership", collectionId);
  }, [isConnected, canPerformAction, collectionId]);
}
