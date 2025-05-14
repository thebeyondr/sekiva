import { TESTNET_URL } from "@/AppState";
import { useAuth } from "@/auth/useAuth";
import { OrganizationInfo } from "@/contracts/factory/SekivaFactoryGenerated";
import { createFactoryClient } from "@/lib/factory";
import { BlockchainTransactionClient } from "@partisiablockchain/blockchain-api-transaction-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { setPublicTransactionClient } from "@/partisia-config";

export function useFactoryCreateOrg() {
  const queryClient = useQueryClient();
  const { isConnected, account, connect, transactionClient } = useAuth();

  const deployOrg = async (orgInfo: OrganizationInfo) => {
    if (!isConnected || !account) throw new Error("Wallet not connected");
    const transactionClient = setPublicTransactionClient(
      account as unknown as string
    );
    return await FactoryClient.deployOrganization(orgInfo, transactionClient);
  };

  return useMutation({
    mutationFn: deployOrg,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["factory"] });
      return data;
    },
    onError: (error) => {
      console.error(error);
    },
  });
}
