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

const fetchTransactionFromShard = async (
  id: string,
  shard: string
): Promise<TransactionData> => {
  console.log(`[Transaction] Checking shard ${shard} for transaction ${id}`);
  const url = `${TESTNET_URL}/chain/shards/${shard}/transactions/${id}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Error fetching transaction from ${shard}: ${response.statusText}`
    );
  }

  const data = await response.json();
  console.log(`[Transaction] Found transaction in shard ${shard}:`, data);
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

    // Determine contract address prefix
    let prefix = "02";
    if (trait === "ballot") prefix = "03";
    else if (trait === "collective") prefix = "02";
    // fallback to 02 for other

    // Try the initial shard first
    try {
      const data = await fetchTransactionFromShard(id, initialShard);

      // Calculate contract address if this is a deployment
      let contractAddress = null;
      if (data.executionStatus?.success) {
        // Extract last 40 chars of transaction ID and prepend prefix
        contractAddress = prefix + id.substring(id.length - 40);
      }

      setStatus({
        isLoading: false,
        isSuccess:
          (data.executionStatus?.success && data.executionStatus?.finalized) ||
          false,
        isError: data.executionStatus?.success === false,
        isFinalized: data.executionStatus?.finalized || false,
        error: null,
        data,
        contractAddress,
      });

      return data;
    } catch (initialError) {
      console.log(
        `[Transaction] Initial shard ${initialShard} failed:`,
        initialError
      );

      // If the initial shard fails, try each shard in the priority list
      let lastError = initialError;
      for (const shard of SHARD_PRIORITY) {
        const shardId = `Shard${shard}`;

        // Skip if this is the same as the initial shard we already tried
        if (shardId === initialShard) continue;

        try {
          const data = await fetchTransactionFromShard(id, shardId);

          // Calculate contract address if this is a deployment
          let contractAddress = null;
          if (data.executionStatus?.success) {
            // Extract last 40 chars of transaction ID and prepend prefix
            contractAddress = prefix + id.substring(id.length - 40);
          }

          setStatus({
            isLoading: false,
            isSuccess:
              (data.executionStatus?.success &&
                data.executionStatus?.finalized) ||
              false,
            isError: data.executionStatus?.success === false,
            isFinalized: data.executionStatus?.finalized || false,
            error: null,
            data,
            contractAddress,
          });

          return data;
        } catch (error) {
          console.log(`[Transaction] Shard ${shardId} failed:`, error);
          lastError = error;
        }
      }

      // If we've tried all shards and none worked, update status with error
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        isError: true,
        error:
          lastError instanceof Error ? lastError : new Error(String(lastError)),
      }));
    }
  }, [id, initialShard, trait]);

  // Poll for transaction status with increasing frequency
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    let retryCount = 0;
    let intervalId: ReturnType<typeof setInterval>;

    const calculateInterval = () => {
      // Start with 1 second and increase up to 5 seconds based on retry count
      return Math.min(1000 + retryCount * 500, 5000);
    };

    const pollStatus = async () => {
      try {
        const data = await fetchStatus();

        // If transaction is finalized or has an error, stop polling
        if (
          isMounted &&
          data &&
          (data.executionStatus?.finalized ||
            data.executionStatus?.success ||
            status.isError)
        ) {
          console.log(
            `[Transaction] Polling stopped - transaction successful, finalized or error`,
            data
          );
          clearInterval(intervalId);
        } else {
          retryCount++;

          // Adjust polling interval based on retry count
          clearInterval(intervalId);
          const newInterval = calculateInterval();
          console.log(
            `[Transaction] Adjusting poll interval to ${newInterval}ms after ${retryCount} tries`
          );
          intervalId = setInterval(pollStatus, newInterval);
        }
      } catch (error) {
        console.error("[Transaction] Error polling transaction status:", error);
        retryCount++;
        // Don't stop polling on network errors, but do adjust the interval
      }
    };

    // Initial fetch
    pollStatus();

    // Set up initial polling (will be adjusted based on retry count)
    intervalId = setInterval(pollStatus, 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [id, fetchStatus, status.isError]);

  return status;
}
