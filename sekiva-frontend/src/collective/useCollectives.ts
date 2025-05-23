import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/auth/useAuth";
import { useFactoryContract } from "@/hooks/useFactoryContract";
import { useOrganizationContract } from "@/hooks/useOrganizationContract";
import { BlockchainAddress } from "@partisiablockchain/abi-client";

export interface CollectiveCardData {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  bannerImage?: string;
  profileImage?: string;
}

export function useCollectives() {
  const [collectives, setCollectives] = useState<CollectiveCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const lastAccountRef = useRef<string | null>(null);

  const { account, isConnected } = useAuth();
  const { getUserMemberships } = useFactoryContract();
  const { getState: getOrganizationState } = useOrganizationContract();

  const loadCollectives = useCallback(async () => {
    const currentAccount = account?.getAddress();

    // Skip if not connected, no account, already loading, or same account
    if (
      !isConnected ||
      !currentAccount ||
      loadingRef.current ||
      currentAccount === lastAccountRef.current
    ) {
      return;
    }

    // Set loading flags
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const orgs = await getUserMemberships(
        currentAccount as unknown as BlockchainAddress
      );

      const orgIds = orgs.map((addr) => addr.asString());
      const orgsData = await Promise.all(
        orgIds.map((orgId) => getOrganizationState(orgId))
      );

      const collectivesData: CollectiveCardData[] = orgsData.map(
        (org, idx) => ({
          id: orgIds[idx],
          name: org.name || "Unnamed Collective",
          description: org.description || "",
          memberCount: org.members.length,
          bannerImage: org.bannerImage,
          profileImage: org.profileImage,
        })
      );

      if (currentAccount === account?.getAddress()) {
        // Only update if account hasn't changed
        setCollectives(collectivesData);
        lastAccountRef.current = currentAccount;
      }
    } catch (err) {
      console.error("Failed to load collectives:", err);
      if (currentAccount === account?.getAddress()) {
        // Only update if account hasn't changed
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      }
    } finally {
      if (currentAccount === account?.getAddress()) {
        // Only update if account hasn't changed
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [account, isConnected, getUserMemberships, getOrganizationState]);

  // Handle connection changes
  useEffect(() => {
    if (!isConnected) {
      // Reset state when disconnected
      setCollectives([]);
      setError(null);
      lastAccountRef.current = null;
      loadingRef.current = false;
      return;
    }

    const currentAccount = account?.getAddress();
    if (
      currentAccount &&
      currentAccount !== lastAccountRef.current &&
      !loadingRef.current
    ) {
      loadCollectives();
    }
  }, [isConnected, account, loadCollectives]);

  return {
    collectives,
    loading,
    error,
    refresh: loadCollectives, // Renamed to be more descriptive
  };
}
