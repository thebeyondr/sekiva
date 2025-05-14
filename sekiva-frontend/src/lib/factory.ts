import {
  BlockchainTransactionClient,
  SentTransaction,
} from "@partisiablockchain/blockchain-api-transaction-client";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import {
  deployOrganization,
  deployBallot,
  OrganizationInfo,
  deserializeState,
  SekivaFactoryState,
} from "@/contracts/factory/SekivaFactoryGenerated";
import { ContractError } from "@/types/contract";
import { SHARD_PRIORITY, TESTNET_URL } from "@/partisia-config";

export type FactoryId = string;
export type ShardId = 0 | 1 | 2;
export const FACTORY_ADDRESS = "02217d0d73a046169a53e48ca4a21d2788e62b95ba";

export type Factory = SekivaFactoryState & {
  lastUpdated: number;
  shardId: ShardId;
};

export const fetchFactoryFromShard = async (
  shard: ShardId
): Promise<Factory> => {
  console.log(`[Factory] Trying shard ${shard}`);
  const response = await fetch(
    `${TESTNET_URL}/shards/Shard${shard}/blockchain/contracts/${FACTORY_ADDRESS}`
  ).then((res) => res.json());

  if (!response?.serializedContract?.state?.data) {
    console.log(`[Factory] No data from shard ${shard}:`, response);
    throw new Error(`No contract data from shard ${shard}`);
  }

  console.log(`[Factory] Success from shard ${shard}`);
  const stateBuffer = Buffer.from(
    response.serializedContract.state.data,
    "base64"
  );
  const state = deserializeState(stateBuffer);
  return { ...state, lastUpdated: Date.now(), shardId: shard };
};

export const getFactoryState = async (): Promise<Factory> => {
  let lastError: Error | null = null;

  for (const shard of SHARD_PRIORITY) {
    try {
      const factory = await fetchFactoryFromShard(shard);
      console.log(`[Factory] Using data from shard ${shard}`);
      return factory;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.log(`[Factory] Failed shard ${shard}:`, err);
      if (shard === SHARD_PRIORITY[SHARD_PRIORITY.length - 1]) throw lastError;
    }
  }
  throw lastError;
};

export interface FactoryClient {
  getState: () => Promise<Factory>;
  getOrganizations: () => Promise<BlockchainAddress[]>;
  getBallots: () => Promise<BlockchainAddress[]>;
  getUserMemberships: (
    address: BlockchainAddress
  ) => Promise<BlockchainAddress[]>;
  getOrganizationBallots: (
    orgAddress: BlockchainAddress
  ) => Promise<BlockchainAddress[]>;
  deployOrganization: (
    orgInfo: OrganizationInfo,
    transactionClient: BlockchainTransactionClient
  ) => Promise<SentTransaction>;
  deployBallot: (
    options: string[],
    title: string,
    description: string,
    organization: BlockchainAddress,
    transactionClient: BlockchainTransactionClient
  ) => Promise<SentTransaction>;
}

export const createFactoryClient = (
  transactionClient: BlockchainTransactionClient
): FactoryClient => ({
  getState: getFactoryState,

  getOrganizations: async () => {
    const state = await getFactoryState();
    return state.organizations;
  },

  getBallots: async () => {
    const state = await getFactoryState();
    return state.ballots;
  },

  getUserMemberships: async (address: BlockchainAddress) => {
    const state = await getFactoryState();
    return state.userOrgMemberships.get(address) || [];
  },

  getOrganizationBallots: async (orgAddress: BlockchainAddress) => {
    const state = await getFactoryState();
    return state.organizationBallots.get(orgAddress) || [];
  },

  deployOrganization: async (
    orgInfo: OrganizationInfo,
    transactionClient: BlockchainTransactionClient
  ) => {
    try {
      const rpc = deployOrganization(orgInfo);
      return transactionClient.signAndSend(
        { address: FACTORY_ADDRESS, rpc },
        1_000_000
      );
    } catch (error: unknown) {
      const err = error as ContractError;
      throw new Error(
        `Failed to deploy organization: ${err?.message || "Unknown error"}`
      );
    }
  },

  deployBallot: async (
    options: string[],
    title: string,
    description: string,
    organization: BlockchainAddress
  ) => {
    try {
      const rpc = deployBallot(options, title, description, organization);
      return transactionClient.signAndSend(
        { address: FACTORY_ADDRESS, rpc },
        2_000_000
      );
    } catch (error: unknown) {
      const err = error as ContractError;
      throw new Error(
        `Failed to deploy ballot: ${err?.message || "Unknown error"}`
      );
    }
  },
});
