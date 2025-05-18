import { createContext } from "react";
import { SenderAuthentication } from "@partisiablockchain/blockchain-api-transaction-client";

export interface AuthContextType {
  // Single source of truth for wallet connection
  isConnected: boolean;

  // Active account info
  account: SenderAuthentication | null;
  walletAddress: string | null;

  // Connection status flags
  isConnecting: boolean;
  connectError: Error | null;

  // Methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;

  // Member status and permissions
  isMemberOf: (collectionId: string) => Promise<boolean>;
  canPerformAction: (actionType: string, targetId?: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
