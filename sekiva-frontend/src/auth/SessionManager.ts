/**
 * Interface representing a Partisia wallet session
 */
export interface PartisiaWalletSession {
  walletType: string;
  connection: {
    account: {
      address: string;
      pub: string;
    };
    popupWindow?: {
      tabId: number;
      box: string;
    };
  };
}

/**
 * Minimal service for managing Partisia wallet sessions
 *
 * Focused on integrating directly with Partisia Wallet SDK's session handling
 */
export class SessionManager {
  // Partisia Wallet stores these keys in sessionStorage
  private static PARTI_WALLET_KEY = "partiWalletConnection";
  private static WALLET_TYPE_KEY = "walletType";
  private static PARTI_WALLET_TYPE = "parti";

  // Additional localStorage keys for cross-session persistence
  private static PERSISTENT_WALLET_KEY = "sekiva_persistent_wallet";
  private static PERSISTENT_WALLET_TYPE_KEY = "sekiva_persistent_wallet_type";

  /**
   * Check for active Partisia browser wallet connection
   * First checks sessionStorage (current session), then localStorage (persistent)
   *
   * @returns The wallet session if available, null otherwise
   */
  static getPartiWalletSession(): PartisiaWalletSession | null {
    try {
      // First, try sessionStorage (current session)
      let walletType = sessionStorage.getItem(this.WALLET_TYPE_KEY);
      let walletData = sessionStorage.getItem(this.PARTI_WALLET_KEY);

      if (walletType === this.PARTI_WALLET_TYPE && walletData) {
        const connection = JSON.parse(walletData);
        return {
          walletType: this.PARTI_WALLET_TYPE,
          connection,
        };
      }

      // Fallback to localStorage (persistent across sessions)
      walletType = localStorage.getItem(this.PERSISTENT_WALLET_TYPE_KEY);
      walletData = localStorage.getItem(this.PERSISTENT_WALLET_KEY);

      if (walletType === this.PARTI_WALLET_TYPE && walletData) {
        const connection = JSON.parse(walletData);

        // Restore to sessionStorage for SDK compatibility
        sessionStorage.setItem(this.PARTI_WALLET_KEY, walletData);
        sessionStorage.setItem(this.WALLET_TYPE_KEY, walletType);

        return {
          walletType: this.PARTI_WALLET_TYPE,
          connection,
        };
      }

      return null;
    } catch (error) {
      console.error("Error retrieving Partisia wallet session:", error);
      return null;
    }
  }

  /**
   * Save wallet connection information to sessionStorage from SDK
   * This saves the complete connection object from the SDK
   * Also saves to localStorage for persistence across browser sessions
   *
   * @param sdkConnection Complete SDK connection object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static saveWalletConnectionFromSdk(sdkConnection: any): void {
    if (
      !sdkConnection ||
      !sdkConnection.account ||
      !sdkConnection.account.address
    ) {
      console.error("Invalid SDK connection object", sdkConnection);
      return;
    }

    console.log(
      `Saving wallet connection from SDK for address: ${sdkConnection.account.address}`
    );

    const connectionString = JSON.stringify(sdkConnection);

    // Save to sessionStorage with the same keys used by Partisia Wallet
    sessionStorage.setItem(this.PARTI_WALLET_KEY, connectionString);
    sessionStorage.setItem(this.WALLET_TYPE_KEY, this.PARTI_WALLET_TYPE);

    // Also save to localStorage for persistence across browser sessions
    localStorage.setItem(this.PERSISTENT_WALLET_KEY, connectionString);
    localStorage.setItem(
      this.PERSISTENT_WALLET_TYPE_KEY,
      this.PARTI_WALLET_TYPE
    );

    // Verify it was saved correctly
    try {
      const savedData = sessionStorage.getItem(this.PARTI_WALLET_KEY);
      console.log(
        "Saved wallet connection:",
        savedData ? JSON.parse(savedData) : null
      );
    } catch (error) {
      console.error("Failed to verify saved connection data", error);
    }
  }

  /**
   * Save wallet connection information to sessionStorage manually
   * Use this as a fallback when the SDK connection is not available
   * Also saves to localStorage for persistence across browser sessions
   *
   * @param address Wallet address
   * @param pubKey Optional public key
   */
  static saveWalletConnection(address: string, pubKey: string = ""): void {
    if (!address) return;

    console.log(`Saving wallet connection for address: ${address}`);

    // Create connection object in the exact format expected by Partisia SDK
    const connection = {
      account: {
        address,
        pub: pubKey,
      },
    };

    const connectionString = JSON.stringify(connection);

    // Save to sessionStorage with the same keys used by Partisia Wallet
    sessionStorage.setItem(this.PARTI_WALLET_KEY, connectionString);
    sessionStorage.setItem(this.WALLET_TYPE_KEY, this.PARTI_WALLET_TYPE);

    // Also save to localStorage for persistence across browser sessions
    localStorage.setItem(this.PERSISTENT_WALLET_KEY, connectionString);
    localStorage.setItem(
      this.PERSISTENT_WALLET_TYPE_KEY,
      this.PARTI_WALLET_TYPE
    );

    // Verify it was saved correctly
    try {
      const savedData = sessionStorage.getItem(this.PARTI_WALLET_KEY);
      console.log(
        "Saved wallet connection:",
        savedData ? JSON.parse(savedData) : null
      );
    } catch (error) {
      console.error("Failed to verify saved connection data", error);
    }
  }

  /**
   * Check if the user has a valid wallet connection
   *
   * @returns true if the user has a connected wallet
   */
  static hasWalletConnection(): boolean {
    return this.getPartiWalletSession() !== null;
  }

  /**
   * Get the connected wallet address if available
   *
   * @returns The wallet address or null if not connected
   */
  static getWalletAddress(): string | null {
    const session = this.getPartiWalletSession();
    return session?.connection?.account?.address || null;
  }

  /**
   * Clear wallet connection from both sessionStorage and localStorage
   */
  static clearWalletConnection(): void {
    console.log(
      "Clearing wallet connection from sessionStorage and localStorage"
    );
    // Clear sessionStorage
    sessionStorage.removeItem(this.PARTI_WALLET_KEY);
    sessionStorage.removeItem(this.WALLET_TYPE_KEY);

    // Clear localStorage
    localStorage.removeItem(this.PERSISTENT_WALLET_KEY);
    localStorage.removeItem(this.PERSISTENT_WALLET_TYPE_KEY);
  }
}
