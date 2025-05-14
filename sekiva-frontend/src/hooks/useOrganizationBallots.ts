import { useFactoryContract } from "./useFactoryContract";
import { useBallotContract } from "./useBallotContract";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Ballot } from "./useBallotContract";

export function useOrganizationBallots(orgAddress: BlockchainAddress) {
  const { getOrganizationBallots } = useFactoryContract();
  const { getState: getBallotState } = useBallotContract();

  const ballotsQuery = useQuery({
    queryKey: ["organizationBallots", orgAddress.asString()],
    queryFn: () => getOrganizationBallots(orgAddress),
    staleTime: 30_000, // Consider data fresh for 30s
    gcTime: 5 * 60_000, // Keep unused data in cache for 5min
  });

  const ballotStatesQueries = useQueries({
    queries: (ballotsQuery.data || []).map((ballotAddress) => ({
      queryKey: ["ballot", ballotAddress.asString()],
      queryFn: () => getBallotState(ballotAddress.asString()),
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      enabled: !!ballotsQuery.data,
    })),
  });

  const ballots = ballotStatesQueries
    .map((query, index) => {
      if (!query.data || !ballotsQuery.data) return null;
      return {
        address: ballotsQuery.data[index],
        state: query.data,
      };
    })
    .filter(
      (ballot): ballot is { address: BlockchainAddress; state: Ballot } =>
        ballot !== null
    );

  return {
    ballots,
    loading:
      ballotsQuery.isLoading || ballotStatesQueries.some((q) => q.isLoading),
    error:
      (ballotsQuery.error || ballotStatesQueries.find((q) => q.error)?.error) ??
      null,
    refresh: () => {
      ballotsQuery.refetch();
      return Promise.all(ballotStatesQueries.map((q) => q.refetch()));
    },
  };
}
