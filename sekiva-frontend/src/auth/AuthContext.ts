import { createContext } from "react";
import { SenderAuthentication } from "@partisiablockchain/blockchain-api-transaction-client";
import { SekivaFactoryClient } from "@/contracts/factory/client";
import { BallotClient, BallotId } from "@/lib/ballot";

export interface AuthContextType {
  walletAddress: string | null;
  isConnecting: boolean;
  isDisconnecting: boolean;
  isConnected: boolean;
  isDisconnected: boolean;
  isAuthenticated: boolean;
  account: SenderAuthentication | undefined;
  factoryClient: SekivaFactoryClient | undefined;
  contractAddress: string | undefined;
  connect: () => Promise<void>;
  disconnect: () => void;
  setContractAddress: (address: string) => void;
  getFactoryClient: () => SekivaFactoryClient | undefined;
  getBallotClient: (ballotId: BallotId) => BallotClient | undefined;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
