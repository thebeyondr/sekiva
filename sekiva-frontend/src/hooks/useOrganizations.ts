import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getOrganizationState, OrganizationId } from "@/lib/organization";
import { OrganizationState } from "@/contracts/organization/OrganizationGenerated";

export function useOrganization(address: OrganizationId) {
  const query = useQuery({
    queryKey: ["organization", address],
    queryFn: () => getOrganizationState(address),
    staleTime: 30_000, // Consider data fresh for 30s
    gcTime: 5 * 60_000, // Keep unused data in cache for 5min
    retry: (failureCount, error) => {
      // Retry up to 3 times, but not on 404s
      if (failureCount >= 3) return false;
      if (error instanceof Error && error.message.includes("No contract data"))
        return false;
      return true;
    },
  });

  return {
    state: query.data,
    loading: query.isLoading,
    error: query.error,
    refresh: () => query.refetch(),
  };
}

export function useOrganizations(ids: OrganizationId[]) {
  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["organization", id],
      queryFn: () => getOrganizationState(id),
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    })),
  });

  const states = useMemo(() => {
    const map = new Map<OrganizationId, OrganizationState>();
    queries.forEach((query, index) => {
      if (query.data) {
        map.set(ids[index], query.data);
      }
    });
    return map;
  }, [queries, ids]);

  return {
    states,
    loading: queries.some((q) => q.isLoading),
    error: queries.find((q) => q.error)?.error ?? null,
    refresh: () => Promise.all(queries.map((q) => q.refetch())),
  };
}
