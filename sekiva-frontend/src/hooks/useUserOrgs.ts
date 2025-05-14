import { createFactoryClient } from "@/lib/factory";
import { TESTNET_URL } from "@/partisia-config";
import { BlockchainTransactionClient } from "@partisiablockchain/blockchain-api-transaction-client";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/auth/useAuth";
import { useEffect, useState } from "react";

export function useUserOrgs(userAddress: BlockchainAddress) {
  const { isConnected, account } = useAuth();
  const [factoryClient, setFactoryClient] = useState<
    ReturnType<typeof createFactoryClient> | undefined
  >(undefined);

  useEffect(() => {
    if (!isConnected || !account) return;
    const transactionClient = BlockchainTransactionClient.create(
      TESTNET_URL,
      account
    );
    setFactoryClient(createFactoryClient(transactionClient));
  }, [isConnected, account]);

  const query = useQuery({
    queryKey: ["userOrg", userAddress],
    queryFn: async () => {
      if (!factoryClient) throw new Error("Not connected");
      return await factoryClient.getUserMemberships(userAddress);
    },
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

// export function useUserOrg(userAddress: BlockchainAddress, orgAddress: BlockchainAddress) {
//   const { isConnected, account } = useAuth();
//   const [factoryClient, setFactoryClient] = useState<
//     ReturnType<typeof createFactoryClient> | undefined
//   >(undefined);
//   const query = useQuery({
//     queryKey: ["userOrg", id],
//     queryFn: async () => {
//       if (!factoryClient) throw new Error("Not connected");
//       return await factoryClient.getUserMemberships(userAddress);
//     },
//   });

//   useEffect(() => {
//     if (!isConnected || !account) return;
//     const transactionClient = BlockchainTransactionClient.create(
//       TESTNET_URL,
//       account
//     );
//     setFactoryClient(createFactoryClient(transactionClient));
//   }, [isConnected, account]);

//   const states = useMemo(() => {
//     const map = new Map<string, OrganizationState>();

//     return map;
//   }, [factoryClient, id]);

//   return {
//     states,
//     loading: query.isLoading,
//     error: query.error,
//     refresh: () => query.refetch(),
//   };
// }
