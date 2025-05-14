import { createContext } from "react";
import { SenderAuthentication } from "@partisiablockchain/blockchain-api-transaction-client";

export interface AuthContextType {
  walletAddress: string | null;
  isConnecting: boolean;
  isDisconnecting: boolean;
  isConnected: boolean;
  isDisconnected: boolean;
  isAuthenticated: boolean;
  account: SenderAuthentication | undefined;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
