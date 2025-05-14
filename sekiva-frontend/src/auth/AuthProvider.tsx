import { useState, useEffect, ReactNode } from "react";
import { connectMpcWallet } from "@/shared/MpcWalletSignatureProvider";
import { AuthContext } from "@/auth/AuthContext";
import { SessionManager } from "./SessionManager";
import {
  SenderAuthentication,
  BlockchainTransactionClient,
} from "@partisiablockchain/blockchain-api-transaction-client";
import { SekivaFactoryClient } from "@/contracts/factory/client";
import { Client, RealZkClient } from "@partisiablockchain/zk-client";
import { createBallotClient, BallotId } from "@/lib/ballot";
import { CLIENT, TESTNET_URL } from "@/partisia-config";

export function AuthProvider({ children }: { children: ReactNode }) {
  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string | null>(() =>
    SessionManager.getWalletAddress()
  );
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    SessionManager.hasWalletConnection()
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Blockchain state
  const [account, setAccount] = useState<SenderAuthentication | undefined>(
    undefined
  );
  const [factoryClient, setFactoryClient] = useState<
    SekivaFactoryClient | undefined
  >(undefined);
  const [factoryAddress, setFactoryAddress] = useState<string | undefined>(
    undefined
  );
  const [zkClient, setZkClient] = useState<RealZkClient | undefined>(undefined);

  // Effect to keep isConnected in sync with state
  useEffect(() => {
    setIsConnected(account !== undefined);
  }, [account]);

  // Effect to reconnect wallet when the component mounts
  useEffect(() => {
    const checkAndReconnect = async () => {
      if (account) return;

      try {
        const session = SessionManager.getPartiWalletSession();
        if (session?.connection?.account?.address) {
          setWalletAddress(session.connection.account.address);
          setIsAuthenticated(true);
          setIsConnected(true);

          // Restore SenderAuthentication for read-only (no sign)
          const restoredAccount: SenderAuthentication = {
            getAddress: () => session.connection.account.address,
            sign: async () => {
              throw new Error("Wallet not connected for signing");
            },
          };
          setAccount(restoredAccount);
          console.log(
            "Restored session from storage, address:",
            session.connection.account.address
          );
        }
      } catch (error) {
        console.error("Failed to reconnect from stored session:", error);
      }
    };

    if (document.readyState === "complete") {
      checkAndReconnect();
    } else {
      window.addEventListener("load", checkAndReconnect);
      return () => window.removeEventListener("load", checkAndReconnect);
    }
  }, [account]);

  // Effect to initialize factory client when account or contract address changes
  useEffect(() => {
    if (account && factoryAddress) {
      try {
        const transactionClient = BlockchainTransactionClient.create(
          TESTNET_URL,
          account
        );
        setFactoryClient(new SekivaFactoryClient(CLIENT, transactionClient));
      } catch (error) {
        console.error("Error updating factory client:", error);
        setFactoryClient(undefined);
      }
    } else {
      setFactoryClient(undefined);
    }
  }, [account, factoryAddress]);

  // Initialize ZK client when account or contract address changes
  useEffect(() => {
    const initZkClient = async () => {
      console.log("[initZkClient] Checking dependencies:", {
        hasAccount: !!account,
        hasContractAddress: !!factoryAddress,
        accountAddress: account?.getAddress(),
        contractAddress: factoryAddress,
      });

      if (!account || !factoryAddress) {
        console.log("[initZkClient] Missing dependencies, clearing clients");
        setZkClient(undefined);
        return;
      }

      try {
        console.log(
          "[initZkClient] Creating ZK client for contract:",
          factoryAddress
        );
        const client = RealZkClient.create(
          factoryAddress,
          new Client(TESTNET_URL)
        );
        setZkClient(client);
        console.log("[initZkClient] ZK client created successfully");
      } catch (error) {
        console.error("[initZkClient] Error creating ZK client:", error);
        setZkClient(undefined);
      }
    };

    initZkClient();
  }, [account, factoryAddress]);

  const connect = async () => {
    if (isConnecting) return;

    setAccount(undefined);
    setIsConnecting(true);

    try {
      console.log("Connecting to wallet...");
      const userAccount = await connectMpcWallet();

      if (userAccount) {
        console.log("Wallet connected successfully");
        setAccount(userAccount);
        const address = userAccount.getAddress().trim();
        setWalletAddress(address);
        setIsAuthenticated(true);
        setIsConnected(true);

        // Initialize clients if we have a contract address
        if (factoryAddress) {
          try {
            const transactionClient = BlockchainTransactionClient.create(
              TESTNET_URL,
              userAccount
            );
            setFactoryClient(
              new SekivaFactoryClient(CLIENT, transactionClient)
            );

            const zkClient = RealZkClient.create(
              factoryAddress,
              new Client(TESTNET_URL)
            );
            setZkClient(zkClient);
          } catch (error) {
            console.error("Error initializing clients after connect:", error);
          }
        }
      }
    } catch (error: unknown) {
      console.error("Wallet connection error:", error);
      disconnect();
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    console.log("Disconnecting wallet");
    setIsDisconnecting(true);

    try {
      setAccount(undefined);
      setFactoryClient(undefined);
      setFactoryAddress(undefined);
      setWalletAddress(null);
      setIsAuthenticated(false);
      setIsConnected(false);
      SessionManager.clearWalletConnection();
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSetContractAddress = (address: string) => {
    setFactoryAddress(address);
  };

  const getFactoryClient = () => factoryClient;

  const getBallotClient = (ballotId: BallotId) => {
    if (!account || !zkClient || !walletAddress) {
      console.log("[getBallotClient] Missing dependencies:", {
        hasAccount: !!account,
        hasZkClient: !!zkClient,
        hasWalletAddress: !!walletAddress,
        accountAddress: account?.getAddress(),
        walletAddress,
        ballotId,
      });
      return undefined;
    }

    try {
      const transactionClient = BlockchainTransactionClient.create(
        TESTNET_URL,
        account
      );
      const zkClient = RealZkClient.create(ballotId, new Client(TESTNET_URL));
      const client = createBallotClient(
        ballotId,
        transactionClient,
        zkClient,
        walletAddress
      );
      console.log("[getBallotClient] Created client for ballot:", ballotId);
      return client;
    } catch (error) {
      console.error("[getBallotClient] Error creating ballot client:", error);
      return undefined;
    }
  };

  // Debug output in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Auth state updated:", {
        walletAddress,
        isAuthenticated,
        isConnecting,
        isDisconnecting,
        isConnected,
        isDisconnected: !isConnected,
        account: account?.getAddress(),
        contractAddress: factoryAddress,
        factoryClient: factoryClient ? "initialized" : "undefined",
        walletSession: SessionManager.getPartiWalletSession(),
        zkClient: zkClient ? "initialized" : "undefined",
      });
    }
  }, [
    walletAddress,
    isAuthenticated,
    isConnecting,
    isDisconnecting,
    isConnected,
    account,
    factoryAddress,
    factoryClient,
    zkClient,
  ]);

  return (
    <AuthContext.Provider
      value={{
        walletAddress,
        isConnecting,
        isDisconnecting,
        isConnected,
        isDisconnected: !isConnected,
        isAuthenticated,
        account,
        factoryClient,
        contractAddress: factoryAddress,
        connect,
        disconnect,
        setContractAddress: handleSetContractAddress,
        getFactoryClient,
        getBallotClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
