import PartisiaSdk from "partisia-sdk";
import { setAccount, resetAccount } from "../config/BlockchainConfig";
import { Buffer } from "buffer";
import {
  SenderAuthentication,
  Signature,
} from "@partisiablockchain/blockchain-api-transaction-client";

/**
 * Connect to Partisia Wallet
 */
export const connectPartisiaWallet =
  async (): Promise<SenderAuthentication> => {
    const partisiaSdk = new PartisiaSdk();
    return partisiaSdk
      .connect({
        // eslint-disable-next-line
        permissions: ["sign" as any],
        dappName: "Counter App",
        chainId: "Partisia Blockchain Testnet",
      })
      .then(() => {
        const connection = partisiaSdk.connection;
        if (connection != null) {
          return {
            getAddress: () => connection.account.address,
            sign: async (
              transactionPayload: Buffer,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              _chainId: string
            ): Promise<Signature> => {
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
      .catch((error: unknown) => {
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
          throw new Error(String(error));
        }
      });
  };

/**
 * Handle wallet connection workflow
 */
export const connectWallet = async (): Promise<SenderAuthentication> => {
  resetAccount();

  try {
    const wallet = await connectPartisiaWallet();
    setAccount(wallet);
    return wallet;
  } catch (error) {
    console.error("Connection error:", error);
    throw error;
  }
};

/**
 * Disconnect current wallet
 */
export const disconnectWallet = () => {
  resetAccount();
};

// Helper function to serialize transaction (simplified)
// function serializeTransaction(txData: any, rpc: any) {
//   // Simplified implementation - in production use the actual serialization from
//   // @partisiablockchain/abi-client
//   return Buffer.from("transaction");
// }
