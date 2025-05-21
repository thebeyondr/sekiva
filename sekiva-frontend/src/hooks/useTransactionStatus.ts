import { useState, useEffect, useCallback } from "react";
import { TESTNET_URL, SHARD_PRIORITY } from "@/partisia-config";

interface ExecutionStatus {
  success: boolean;
  finalized: boolean;
  transactionCost?: Record<string, unknown>;
  events?: unknown[];
}

interface TransactionData {
  identifier: string;
  executionStatus?: ExecutionStatus;
  content?: string;
  isEvent?: boolean;
  [key: string]: unknown;
}

export interface TransactionStatus {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isFinalized: boolean;
  error: Error | null;
  data: TransactionData | null;
  contractAddress: string | null;
}

const verifyContractExists = async (address: string, shard: string) => {
  try {
    const url = `${TESTNET_URL}/chain/shards/${shard}/contracts/${address}`;
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
};

const fetchTransactionFromShard = async (
  id: string,
  shard: string
): Promise<TransactionData> => {
  const url = `${TESTNET_URL}/chain/shards/${shard}/transactions/${id}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Error fetching transaction from ${shard}: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data as TransactionData;
};

export function useTransactionStatus(
  id: string,
  initialShard: string,
  trait?: "ballot" | "collective" | "other"
) {
  const [status, setStatus] = useState<TransactionStatus>({
    isLoading: true,
    isSuccess: false,
    isError: false,
    isFinalized: false,
    error: null,
    data: null,
    contractAddress: null,
  });

  const fetchStatus = useCallback(async () => {
    if (!id) return;

    let prefix = "02";
    if (trait === "ballot") prefix = "03";
    else if (trait === "collective") prefix = "02";

    try {
      const data = await fetchTransactionFromShard(id, initialShard);

      let contractAddress = null;
      if (data.executionStatus?.success) {
        contractAddress = prefix + id.substring(id.length - 40);
      }

      const isFullySuccessful = Boolean(
        data.executionStatus?.success && data.executionStatus?.finalized
      );

      if (isFullySuccessful && contractAddress) {
        const exists = await verifyContractExists(
          contractAddress,
          initialShard
        );
        if (!exists) {
          setStatus({
            isLoading: true,
            isSuccess: false,
            isError: false,
            isFinalized: false,
            error: null,
            data,
            contractAddress,
          });
          return data;
        }
      }

      setStatus({
        isLoading: false,
        isSuccess: isFullySuccessful,
        isError: data.executionStatus?.success === false,
        isFinalized: data.executionStatus?.finalized || false,
        error: null,
        data,
        contractAddress,
      });

      return data;
    } catch (initialError) {
      let lastError = initialError;
      for (const shard of SHARD_PRIORITY) {
        const shardId = `Shard${shard}`;

        if (shardId === initialShard) continue;

        try {
          const data = await fetchTransactionFromShard(id, shardId);

          let contractAddress = null;
          if (data.executionStatus?.success) {
            contractAddress = prefix + id.substring(id.length - 40);
          }

          const isFullySuccessful = Boolean(
            data.executionStatus?.success && data.executionStatus?.finalized
          );

          if (isFullySuccessful && contractAddress) {
            const exists = await verifyContractExists(contractAddress, shardId);
            if (!exists) {
              setStatus({
                isLoading: true,
                isSuccess: false,
                isError: false,
                isFinalized: false,
                error: null,
                data,
                contractAddress,
              });
              return data;
            }
          }

          setStatus({
            isLoading: false,
            isSuccess: isFullySuccessful,
            isError: data.executionStatus?.success === false,
            isFinalized: data.executionStatus?.finalized || false,
            error: null,
            data,
            contractAddress,
          });

          return data;
        } catch (error) {
          lastError = error;
        }
      }

      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        isError: true,
        error:
          lastError instanceof Error ? lastError : new Error(String(lastError)),
      }));
    }
  }, [id, initialShard, trait]);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    let retryCount = 0;
    let intervalId: ReturnType<typeof setInterval>;

    const calculateInterval = () => {
      return Math.min(1000 + retryCount * 500, 5000);
    };

    const pollStatus = async () => {
      try {
        const data = await fetchStatus();

        if (
          isMounted &&
          data &&
          ((data.executionStatus?.finalized &&
            data.executionStatus?.success &&
            status.contractAddress &&
            (await verifyContractExists(
              status.contractAddress,
              initialShard
            ))) ||
            status.isError)
        ) {
          clearInterval(intervalId);
        } else {
          retryCount++;
          clearInterval(intervalId);
          const newInterval = calculateInterval();
          intervalId = setInterval(pollStatus, newInterval);
        }
      } catch (error) {
        console.error("[Transaction] Error polling transaction status:", error);
        retryCount++;
      }
    };

    pollStatus();
    intervalId = setInterval(pollStatus, 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [id, fetchStatus, status.isError, status.contractAddress, initialShard]);

  return status;
}
