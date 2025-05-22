import { useState, useCallback } from "react";
import { TESTNET_URL } from "@/partisia-config";
import {
  BlockchainTransactionClient,
  SentTransaction,
} from "@partisiablockchain/blockchain-api-transaction-client";
import { Client, RealZkClient } from "@partisiablockchain/zk-client";
import { CompactBitArray } from "@secata-public/bitmanipulation-ts";
import { useAuth } from "@/auth/useAuth";

export interface TransactionPointer {
  identifier: string;
  destinationShardId: string;
}

export interface TransactionResult {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  transactionPointer: TransactionPointer | null;
}

export interface SecretInputTransaction {
  type: "secret";
  address: string;
  secretInput: CompactBitArray;
  publicRpc: Buffer;
  gasCost?: number;
}

export interface RegularTransaction {
  type: "regular";
  address: string;
  rpc: Buffer;
  gasCost?: number;
}

export type Transaction = SecretInputTransaction | RegularTransaction;

export function useTransaction() {
  const { account } = useAuth();
  const [result, setResult] = useState<TransactionResult>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    transactionPointer: null,
  });

  const sendTransaction = useCallback(
    async (tx: Transaction) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      setResult((prev) => ({ ...prev, isLoading: true }));

      try {
        const txClient = BlockchainTransactionClient.create(
          TESTNET_URL,
          account
        );
        let txn: SentTransaction;

        if (tx.type === "secret") {
          // Handle secret input transaction (ZK)
          const zkClient = RealZkClient.create(
            tx.address,
            new Client(TESTNET_URL)
          );
          const transaction = await zkClient.buildOnChainInputTransaction(
            account.getAddress(),
            tx.secretInput,
            tx.publicRpc
          );
          txn = await txClient.signAndSend(transaction, tx.gasCost || 100_000);
        } else {
          // Handle regular transaction
          txn = await txClient.signAndSend(
            { address: tx.address, rpc: tx.rpc },
            tx.gasCost || 100_000
          );
        }

        console.log("Transaction sent:", txn);

        // Wait for spawned events
        await txClient.waitForSpawnedEvents(txn);

        if (txn.transactionPointer) {
          const pointer: TransactionPointer = {
            identifier: txn.transactionPointer.identifier,
            destinationShardId:
              txn.transactionPointer.destinationShardId.toString(),
          };

          setResult({
            isLoading: false,
            isSuccess: true,
            isError: false,
            error: null,
            transactionPointer: pointer,
          });

          return pointer;
        }

        throw new Error("No transaction pointer returned");
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setResult({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error,
          transactionPointer: null,
        });
        throw error;
      }
    },
    [account]
  );

  return {
    ...result,
    sendTransaction,
  };
}
