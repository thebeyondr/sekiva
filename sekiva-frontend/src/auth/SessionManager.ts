/**
 * Interface representing a Partisia wallet session
 */
export interface PartisiaWalletSession {
  walletType: string;
  connection: {
    account: {
      address: string;
      pub: string;
      shard_id: number;
    };
    popupWindow?: {
      tabId: number;
      box: string;
    };
  };
  lastConnected: number; // timestamp
}

/**
 * Service for managing authentication sessions
 *
 * Following blockchain wallet standards, this manager only uses sessionStorage
 * and doesn't persist sessions beyond the current browser session.
 */
export class SessionManager {
  private static SESSION_KEY = "sekivaSession";
  private static SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Store session data in sessionStorage
   */
  static saveSession(session: PartisiaWalletSession): void {
    // Only store in sessionStorage following blockchain wallet standards
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  /**
   * Get session data with validation
   */
  static getSession(): PartisiaWalletSession | null {
    const sessionData = sessionStorage.getItem(this.SESSION_KEY);
    if (!sessionData) return null;

    try {
      const session = JSON.parse(sessionData);
      if (this.isSessionValid(session)) {
        return session;
      } else {
        // Clear invalid session
        this.clearSession();
      }
    } catch (error) {
      console.error("Error parsing session data", error);
      this.clearSession();
    }

    return null;
  }

  /**
   * Check for Partisia browser wallet connection in sessionStorage
   */
  static checkForPartiWalletConnection(): PartisiaWalletSession | null {
    try {
      const partiWalletData = sessionStorage.getItem("partiWalletConnection");
      const walletType = sessionStorage.getItem("walletType");

      if (partiWalletData && walletType === "parti") {
        const connection = JSON.parse(partiWalletData);

        // Create a session object
        const session: PartisiaWalletSession = {
          walletType: "parti",
          connection,
          lastConnected: Date.now(),
        };

        // Save this session
        this.saveSession(session);
        return session;
      }
    } catch (error) {
      console.error("Error checking for Parti wallet connection:", error);
    }

    return null;
  }

  /**
   * Clear session data
   */
  static clearSession(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  /**
   * Check if a session is still valid
   */
  static isSessionValid(session: PartisiaWalletSession): boolean {
    // Check if session is expired
    const now = Date.now();

    return (
      !!session &&
      !!session.lastConnected &&
      !!session.connection?.account?.address &&
      now - session.lastConnected < this.SESSION_TIMEOUT
    );
  }

  /**
   * Update session's timestamp
   */
  static refreshSession(): void {
    const session = this.getSession();
    if (session) {
      session.lastConnected = Date.now();
      this.saveSession(session);
    }
  }
}
