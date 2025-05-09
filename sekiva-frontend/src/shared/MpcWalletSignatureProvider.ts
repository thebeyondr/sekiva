import {
  SenderAuthentication,
  Signature,
} from "@partisiablockchain/blockchain-api-transaction-client";
import PartisiaSdk from "partisia-sdk";
import { PartisiaWalletSession } from "@/auth/SessionManager";

/**
 * Connection parameters for Partisia SDK
 */
interface ConnectParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  permissions: any[]; // Using any for compatibility with PartisiaSdk
  dappName: string;
  chainId: string;
  reconnect?: boolean;
  tabId?: number;
}

/**
 * Initializes a new ConnectedWallet by connecting to Partisia Blockchain
 * Applications MPC wallet.
 *
 * @param sessionData Optional session data for reconnection
 */
export const connectMpcWallet = async (
  sessionData?: PartisiaWalletSession
): Promise<SenderAuthentication> => {
  const partisiaSdk = new PartisiaSdk();

  // Configure connection parameters
  const connectParams: ConnectParams = {
    permissions: ["sign"],
    dappName: "Sekiva",
    chainId: "Partisia Blockchain Testnet",
  };

  // Add reconnection parameters if available from session
  if (sessionData?.connection?.popupWindow) {
    connectParams.reconnect = true;
    connectParams.tabId = sessionData.connection.popupWindow.tabId;
  }

  return partisiaSdk
    .connect(connectParams)
    .then(() => {
      const connection = partisiaSdk.connection;
      if (connection != null) {
        // User connection was successful. Use the connection to build up a connected wallet
        // in state.
        return {
          getAddress: () => connection.account.address,
          sign: async (transactionPayload: Buffer): Promise<Signature> => {
            // Ask the MPC wallet to sign the transaction.
            const res = await partisiaSdk.signMessage({
              payload: transactionPayload.toString("hex"),
              payloadType: "hex",
              dontBroadcast: true,
            });
            return res.signature;
          },
        };
      } else {
        throw new Error("Unable to establish connection to MPC wallet");
      }
    })
    .catch((error) => {
      // Something went wrong with the connection.
      if (error instanceof Error) {
        if (error.message === "Extension not Found") {
          throw new Error("Partisia Wallet Extension not found.");
        } else if (error.message === "user closed confirm window") {
          throw new Error("Sign in using MPC wallet was cancelled");
        } else if (error.message === "user rejected") {
          throw new Error("Sign in using MPC wallet was rejected");
        } else {
          throw error;
        }
      } else {
        throw new Error(error);
      }
    });
};
