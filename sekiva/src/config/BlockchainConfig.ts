import {
  ChainControllerApi,
  Configuration,
  SenderAuthentication,
} from "@partisiablockchain/blockchain-api-transaction-client";

// Configure API client for the testnet
export const CLIENT = new ChainControllerApi(
  new Configuration({
    basePath: "https://node1.testnet.partisiablockchain.com",
  })
);

// Contract address - replace with your deployed contract address
export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";

// Track current account/wallet connection
let currentAccount: SenderAuthentication | undefined;

export const isConnected = () => {
  return currentAccount != null;
};

export const setAccount = (account: SenderAuthentication) => {
  currentAccount = account;
};

export const getAccount = () => {
  return currentAccount;
};

export const resetAccount = () => {
  currentAccount = undefined;
};
