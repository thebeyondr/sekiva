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
import { SekivaFactoryApi } from "./contracts/factory/api";

export const TESTNET_URL = "https://node1.testnet.partisiablockchain.com";

export const CLIENT = new ShardedClient(TESTNET_URL, [
  "Shard0",
  "Shard1",
  "Shard2",
]);

let contractAddress: string | undefined;
let currentAccount: SenderAuthentication | undefined;
let factoryApi: SekivaFactoryApi | undefined;

export const setAccount = (account: SenderAuthentication | undefined) => {
  currentAccount = account;
  initializeFactoryApi();
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
      "https://node1.testnet.partisiablockchain.com",
      currentAccount
    );
  }
  return new SekivaFactoryApi(CLIENT, transactionClient);
};

export const getFactoryApi = () => {
  return factoryApi;
};

export const getContractAddress = () => {
  return contractAddress;
};

export const setContractAddress = (address: string) => {
  contractAddress = address;
  initializeFactoryApi();
};

function initializeFactoryApi() {
  if (currentAccount && contractAddress) {
    try {
      const transactionClient = BlockchainTransactionClient.create(
        TESTNET_URL,
        currentAccount
      );

      factoryApi = new SekivaFactoryApi(CLIENT, transactionClient);
    } catch (error) {
      console.error("Error updating factory API:", error);
      factoryApi = undefined;
    }
  } else {
    factoryApi = undefined;
  }
}
