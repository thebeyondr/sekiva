import PartisiaSdk from "partisia-sdk";
import { CLIENT, setAccount, resetAccount } from "../config/BlockchainConfig";
import { Buffer } from "buffer";

// Interface for connected wallet
export interface ConnectedWallet {
  address: string;
  signAndSendTransaction: (payload: any, cost?: number) => Promise<any>;
}

/**
 * Connect to Partisia Wallet
 */
export const connectPartisiaWallet = async (): Promise<ConnectedWallet> => {
  const partisiaSdk = new PartisiaSdk();
  console.log("partisiaSdk", partisiaSdk);
  const connection = await partisiaSdk.connect({
    permissions: ["sign" as any],
    dappName: "Sekiva",
    chainId: "Partisia Blockchain Testnet",
  });

  if (!partisiaSdk.connection?.account) {
    throw new Error("Failed to connect to wallet");
  }

  return {
    address: partisiaSdk.connection.account.address,
    signAndSendTransaction: (payload, cost = 0) => {
      return CLIENT.getAccountData(
        partisiaSdk.connection?.account?.address ?? ""
      ).then((accountData) => {
        if (!accountData) throw new Error("Account data was null");

        // Format transaction payload
        const txPayload = {
          cost: String(cost),
          nonce: accountData.nonce,
          validTo: String(new Date().getTime() + 3600000), // 1 hour validity
          address: partisiaSdk.connection?.account?.address ?? "",
        };

        // Serialize transaction
        const serializedTx = serializeTransaction(txPayload, payload.rpc);

        // Sign and send transaction
        return partisiaSdk
          .signMessage({
            payload: serializedTx.toString("hex"),
            payloadType: "hex",
            dontBroadcast: false,
          })
          .then((value) => ({
            transactionHash: value.trxHash,
          }))
          .catch(() => ({ putSuccessful: false }));
      });
    },
  };
};

/**
 * Handle wallet connection workflow
 */
export const connectWallet = async () => {
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
function serializeTransaction(txData: any, rpc: any) {
  // Simplified implementation - in production use the actual serialization from
  // @partisiablockchain/abi-client
  return Buffer.from("transaction");
}

// import PartisiaSdk from "partisia-sdk";
// import { setAccount, resetAccount } from "../config/BlockchainConfig";
// import { Buffer } from "buffer";
// import {
//   type SenderAuthentication,
//   type Signature,
// } from "@partisiablockchain/blockchain-api-transaction-client";

// /**
//  * Connect to Partisia Wallet
//  */
// export const connectPartisiaWallet =
//   async (): Promise<SenderAuthentication> => {
//     const partisiaSdk = new PartisiaSdk();
//     return partisiaSdk
//       .connect({
//         // eslint-disable-next-line
//         permissions: ["sign" as any],
//         dappName: "Sekiva",
//         chainId: "Partisia Blockchain Testnet",
//       })
//       .then(() => {
//         const connection = partisiaSdk.connection;
//         if (connection != null) {
//           return {
//             getAddress: () => connection.account.address,
//             sign: async (
//               transactionPayload: Buffer,
//               // eslint-disable-next-line @typescript-eslint/no-unused-vars
//               _chainId: string
//             ): Promise<Signature> => {
//               const res = await partisiaSdk.signMessage({
//                 payload: transactionPayload.toString("hex"),
//                 payloadType: "hex",
//                 dontBroadcast: true,
//               });
//               return res.signature;
//             },
//           };
//         } else {
//           throw new Error("Unable to establish connection to MPC wallet");
//         }
//       })
//       .catch((error: unknown) => {
//         if (error instanceof Error) {
//           if (error.message === "Extension not Found") {
//             throw new Error("Partisia Wallet Extension not found.");
//           } else if (error.message === "user closed confirm window") {
//             throw new Error("Sign in using MPC wallet was cancelled");
//           } else if (error.message === "user rejected") {
//             throw new Error("Sign in using MPC wallet was rejected");
//           } else {
//             throw error;
//           }
//         } else {
//           throw new Error(String(error));
//         }
//       });
//   };

// /**
//  * Handle wallet connection workflow
//  */
// export const connectWallet = async (): Promise<SenderAuthentication> => {
//   resetAccount();

//   try {
//     const wallet = await connectPartisiaWallet();
//     setAccount(wallet);
//     return wallet;
//   } catch (error) {
//     console.error("Connection error:", error);
//     throw error;
//   }
// };

// /**
//  * Disconnect current wallet
//  */
// export const disconnectWallet = () => {
//   resetAccount();
// };

// Helper function to serialize transaction (simplified)
// function serializeTransaction(txData: any, rpc: any) {
//   // Simplified implementation - in production use the actual serialization from
//   // @partisiablockchain/abi-client
//   return Buffer.from("transaction");
// }
