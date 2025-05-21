import { useState, useEffect, useCallback } from "react";
import { TESTNET_URL } from "@/partisia-config";

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

const TRANSACTION_TTL = 60_000; // 60 seconds
const DELAY_BETWEEN_RETRIES = 1_000; // 1 second
const MAX_TRIES = TRANSACTION_TTL / DELAY_BETWEEN_RETRIES;

export function useTransactionStatus(
  id: string,
  destinationShard: string,
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
      // Fetch transaction data from shard
      const response = await fetch(
        `${TESTNET_URL}/shards/${destinationShard}/blockchain/transactions/${id}`
      ).then((res) => res.json());

      const executedTransaction = response?.transaction;

      if (!executedTransaction) {
        setStatus((prev) => ({
          ...prev,
          isLoading: true,
          isSuccess: false,
          isError: false,
          isFinalized: false,
        }));
        return;
      }

      let contractAddress = null;
      if (executedTransaction.executionSucceeded) {
        contractAddress = prefix + id.substring(id.length - 40);
      }

      // Check if contract exists
      if (contractAddress) {
        const contractResponse = await fetch(
          `${TESTNET_URL}/shards/${destinationShard}/blockchain/contracts/${contractAddress}`
        ).then((res) => res.json());

        const contractExists = !!contractResponse?.serializedContract;
        if (!contractExists) {
          setStatus((prev) => ({
            ...prev,
            isLoading: true,
            isSuccess: false,
            isError: false,
            isFinalized: false,
            contractAddress,
          }));
          return;
        }
      }

      setStatus({
        isLoading: false,
        isSuccess: executedTransaction.executionSucceeded,
        isError: !executedTransaction.executionSucceeded,
        isFinalized: true,
        error: executedTransaction.executionSucceeded
          ? null
          : new Error("Transaction failed"),
        data: {
          identifier: id,
          executionStatus: {
            success: executedTransaction.executionSucceeded,
            finalized: true,
            events: executedTransaction.events,
          },
        },
        contractAddress,
      });

      // Handle events recursively
      if (executedTransaction.events && executedTransaction.events.length > 0) {
        await Promise.all(
          executedTransaction.events.map(
            async (event: { destinationShard: string; identifier: string }) => {
              const eventResponse = await fetch(
                `${TESTNET_URL}/shards/${event.destinationShard}/blockchain/transactions/${event.identifier}`
              ).then((res) => res.json());
              return eventResponse?.transaction;
            }
          )
        );
      }
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
    }
  }, [id, destinationShard, trait]);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    let tryCount = 0;
    let timeoutId: NodeJS.Timeout;

    const pollStatus = async () => {
      if (tryCount >= MAX_TRIES) {
        setStatus((prev) => ({
          ...prev,
          isLoading: false,
          isError: true,
          error: new Error("Transaction timed out"),
        }));
        return;
      }

      try {
        await fetchStatus();

        if (!isMounted) return;

        if (status.isFinalized || status.isError) {
          return;
        }

        tryCount++;
        timeoutId = setTimeout(pollStatus, DELAY_BETWEEN_RETRIES);
      } catch (error) {
        console.error("[Transaction] Error polling status:", error);
        tryCount++;
        if (isMounted) {
          timeoutId = setTimeout(pollStatus, DELAY_BETWEEN_RETRIES);
        }
      }
    };

    pollStatus();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [id, fetchStatus, status.isFinalized, status.isError]);

  return status;
}
