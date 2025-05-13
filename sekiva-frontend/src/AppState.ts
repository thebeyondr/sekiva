/*
 * Copyright (C) 2022 - 2023 Partisia Blockchain Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// import { Client, RealZkClient } from "@partisiablockchain/zk-client";
import { ShardedClient } from "./client/ShardedClient";
import {
  BlockchainTransactionClient,
  SenderAuthentication,
} from "@partisiablockchain/blockchain-api-transaction-client";
import { SekivaFactoryClient } from "./contracts/factory/client";
// import { BallotClient } from "./contracts/ballot/client";

export const TESTNET_URL = "https://node1.testnet.partisiablockchain.com";

export const CLIENT = new ShardedClient(TESTNET_URL, [
  "Shard0",
  "Shard1",
  "Shard2",
]);

let contractAddress: string | undefined;
let currentAccount: SenderAuthentication | undefined;
export let factoryClient: SekivaFactoryClient | undefined;
// export let ballotClient: BallotClient | undefined;

export const setAccount = (account: SenderAuthentication | undefined) => {
  currentAccount = account;
  initializeFactoryClient();
};

export const getAccount = () => {
  return currentAccount;
};

export const resetAccount = () => {
  currentAccount = undefined;
};

export const isConnected = () => {
  return currentAccount != null;
};

export const FactoryApi = () => {
  let transactionClient = undefined;
  if (currentAccount != undefined) {
    transactionClient = BlockchainTransactionClient.create(
      TESTNET_URL,
      currentAccount
    );
  }
  return new SekivaFactoryClient(CLIENT, transactionClient);
};

export const getFactoryClient = () => {
  return factoryClient;
};

export const getContractAddress = () => {
  return contractAddress;
};

export const setContractAddress = (address: string) => {
  contractAddress = address;
  initializeFactoryClient();
};

function initializeFactoryClient() {
  if (currentAccount && contractAddress) {
    try {
      const transactionClient = BlockchainTransactionClient.create(
        TESTNET_URL,
        currentAccount
      );
      factoryClient = new SekivaFactoryClient(CLIENT, transactionClient);
      // ballotClient = BallotClient.withAccount(
      //   transactionClient,
      //   currentAccount
      // );
    } catch (error) {
      console.error("Error updating factory API:", error);
      factoryClient = undefined;
      // ballotClient = undefined;
    }
  } else {
    factoryClient = undefined;
    // ballotClient = BallotClient.forReadOnly(
    //   BlockchainTransactionClient.create(TESTNET_URL, currentAccount)
    // );
  }
}
