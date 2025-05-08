import { useState, useEffect, ReactNode } from "react";
import { connectMpcWallet } from "@/shared/MpcWalletSignatureProvider";
import { resetAccount, setAccount, isConnected } from "@/AppState";
import { AuthContext } from "@/auth/AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    return storedAddress ? storedAddress : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Initialize authentication state based on localStorage
    return localStorage.getItem("walletAddress") !== null;
  });

  // Effect to reconnect wallet when the component mounts
  useEffect(() => {
    const checkAndReconnect = async () => {
      const storedAddress = localStorage.getItem("walletAddress");

      if (storedAddress && !isConnected()) {
        console.log(
          "Attempting to reconnect wallet with stored address:",
          storedAddress
        );

        // Add a delay to ensure the wallet extension is loaded
        // This gives browser time to initialize extensions
        setTimeout(async () => {
          try {
            await reconnectWallet();
          } catch (error) {
            console.error("Delayed reconnection failed:", error);

            // Try one more time with a longer delay if it fails
            setTimeout(async () => {
              try {
                await reconnectWallet();
              } catch (error) {
                console.error("Final reconnection attempt failed:", error);
                disconnect();
              }
            }, 2000);
          }
        }, 1000);
      }
    };

    // Only try to reconnect after the page is fully loaded
    if (document.readyState === "complete") {
      checkAndReconnect();
    } else {
      window.addEventListener("load", checkAndReconnect);
      return () => window.removeEventListener("load", checkAndReconnect);
    }
  });

  const reconnectWallet = async () => {
    if (isLoading) return; // Prevent multiple reconnect attempts

    setIsLoading(true);
    try {
      console.log("Reconnecting wallet...");
      const userAccount = await connectMpcWallet();

      if (userAccount) {
        console.log("Wallet reconnected successfully");
        setAccount(userAccount);

        // Update wallet address from actual account
        const address = userAccount.getAddress().trim();
        setWalletAddress(address);

        // Store the latest address
        localStorage.setItem("walletAddress", address);

        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to reconnect wallet:", error);
      // If reconnection fails, clear the stored address
      throw error; // Rethrow so we can handle in the delayed retry
    } finally {
      setIsLoading(false);
    }
  };

  const connect = async () => {
    if (isLoading) return; // Prevent multiple connect attempts

    resetAccount();
    setIsLoading(true);

    try {
      console.log("Connecting to wallet...");
      const userAccount = await connectMpcWallet();

      if (userAccount) {
        console.log("Wallet connected successfully");
        setAccount(userAccount);

        const address = userAccount.getAddress().trim();
        setWalletAddress(address);

        // Store address in localStorage for persistence
        localStorage.setItem("walletAddress", address);

        setIsAuthenticated(true);
      }
    } catch (error: unknown) {
      console.error("Wallet connection error:", error);
      disconnect();
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    console.log("Disconnecting wallet");
    resetAccount();
    setWalletAddress(null);
    setIsAuthenticated(false);
    localStorage.removeItem("walletAddress");
  };

  // Debug output in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Auth state updated:", {
        walletAddress,
        isAuthenticated,
        isLoading,
        storedAddress: localStorage.getItem("walletAddress"),
      });
    }
  }, [walletAddress, isAuthenticated, isLoading]);

  return (
    <AuthContext.Provider
      value={{
        walletAddress,
        isLoading,
        connect,
        disconnect,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
