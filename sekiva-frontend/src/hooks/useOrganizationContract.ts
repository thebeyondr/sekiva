import { useAuth } from "@/auth/useAuth";
import { TESTNET_URL, SHARD_PRIORITY, CLIENT } from "@/partisia-config";
import {
  addAdministrator,
  removeAdministrator,
  addMember,
  removeMember,
  addBallot,
  addMembers,
  removeMembers,
  updateMetadata,
  OrganizationState,
  deserializeState,
} from "@/contracts/OrganizationGenerated";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { BlockchainTransactionClient } from "@partisiablockchain/blockchain-api-transaction-client";
import { ShardId } from "@/partisia-config";

export type Organization = OrganizationState & {
  lastUpdated: number;
  shardId: ShardId;
};

const fetchOrgFromShard = async (
  id: string,
  shard: ShardId
): Promise<Organization> => {
  console.log(`[Organization] Trying shard ${shard} for org ${id}`);
  const url = `${TESTNET_URL}/shards/Shard${shard}/blockchain/contracts/${id}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `[Organization] Fetch failed for shard ${shard}: ${res.status} ${res.statusText}`
    );
  }
  const text = await res.text();
  if (!text) {
    throw new Error(`[Organization] Empty response for shard ${shard}`);
  }
  let response;
  try {
    response = JSON.parse(text);
  } catch (e) {
    throw new Error(`[Organization] Invalid JSON from shard ${shard}: ${e}`);
  }

  if (!response?.serializedContract?.state?.data) {
    console.log(`[Organization] No data from shard ${shard}:`, response);
    throw new Error(`No contract data from shard ${shard}`);
  }

  console.log(`[Organization] Success from shard ${shard}`);
  console.log(response);
  const stateBuffer = Buffer.from(
    response.serializedContract.state.data,
    "base64"
  );
  const state = deserializeState(stateBuffer);
  return { ...state, lastUpdated: Date.now(), shardId: shard };
};

const getOrgState = async (id: string): Promise<Organization> => {
  let lastError: Error | null = null;

  for (const shard of SHARD_PRIORITY) {
    try {
      const org = await fetchOrgFromShard(id, shard);
      console.log(
        `[Organization] Using data from shard ${shard} for org ${id}`
      );
      return org;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.log(`[Organization] Failed shard ${shard}:`, err);
      if (shard === SHARD_PRIORITY[SHARD_PRIORITY.length - 1]) throw lastError;
    }
  }
  throw lastError;
};

export function useOrganizationContract() {
  const { account } = useAuth();

  const getTransactionClient = () => {
    if (!account) throw new Error("Wallet not connected");
    return BlockchainTransactionClient.create(TESTNET_URL, account);
  };

  // Read state using shard-based fetching
  // const getState = async (orgAddress: string): Promise<OrganizationState> => {
  //   const contract = await CLIENT.getContractData(orgAddress, true);
  //   console.log(contract);
  //   if (!contract) throw new Error("Could not find data for contract");
  //   let stateBuffer: Buffer;
  //   if (typeof contract.serializedContract === "string") {
  //     stateBuffer = Buffer.from(contract.serializedContract, "base64");
  //     console.log("state is string");
  //   } else if (
  //     typeof contract.serializedContract === "object" &&
  //     contract.serializedContract !== null &&
  //     "data" in contract.serializedContract &&
  //     typeof (contract.serializedContract as { data?: string }).data ===
  //       "string"
  //   ) {
  //     stateBuffer = Buffer.from(
  //       (contract.serializedContract as { data: string }).data,
  //       "base64"
  //     );
  //     console.log("state is object");
  //   } else {
  //     throw new Error("Unexpected contract state format");
  //   }
  //   return deserializeState(stateBuffer);
  // };

  // Write actions
  return {
    getState: (orgAddress: string) => getOrgState(orgAddress),
    addAdministrator: async (
      orgAddress: BlockchainAddress,
      memberAddress: BlockchainAddress
    ) => {
      const txClient = getTransactionClient();
      const rpc = addAdministrator(memberAddress);
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
    removeAdministrator: async (
      orgAddress: BlockchainAddress,
      memberAddress: BlockchainAddress
    ) => {
      const txClient = getTransactionClient();
      const rpc = removeAdministrator(memberAddress);
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
    addMember: async (
      orgAddress: BlockchainAddress,
      memberAddress: BlockchainAddress
    ) => {
      const txClient = getTransactionClient();
      const rpc = addMember(memberAddress);
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
    removeMember: async (
      orgAddress: BlockchainAddress,
      memberAddress: BlockchainAddress
    ) => {
      const txClient = getTransactionClient();
      const rpc = removeMember(memberAddress);
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
    addBallot: async (
      orgAddress: BlockchainAddress,
      ballotAddress: BlockchainAddress
    ) => {
      const txClient = getTransactionClient();
      const rpc = addBallot(ballotAddress);
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
    addMembers: async (
      orgAddress: BlockchainAddress,
      memberAddresses: BlockchainAddress[]
    ) => {
      const txClient = getTransactionClient();
      const rpc = addMembers(memberAddresses);
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
    removeMembers: async (
      orgAddress: BlockchainAddress,
      memberAddresses: BlockchainAddress[]
    ) => {
      const txClient = getTransactionClient();
      const rpc = removeMembers(memberAddresses);
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
    updateMetadata: async (
      orgAddress: BlockchainAddress,
      fields: {
        name?: string;
        description?: string;
        profileImage?: string;
        bannerImage?: string;
        website?: string;
        xAccount?: string;
        discordServer?: string;
      }
    ) => {
      const txClient = getTransactionClient();
      const rpc = updateMetadata(
        fields.name,
        fields.description,
        fields.profileImage,
        fields.bannerImage,
        fields.website,
        fields.xAccount,
        fields.discordServer
      );
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        1_000_000
      );
    },
  };
}
