import { createContext } from "react";

// Define the context type
export interface AuthContextType {
  walletAddress: string | null;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  isAuthenticated: boolean;
}

// Create and export the context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
