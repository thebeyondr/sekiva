import { useAuth } from "@/auth/useAuth";
import { TESTNET_URL, SHARD_PRIORITY } from "@/partisia-config";
import {
  addAdministrator,
  removeAdministrator,
  addMember,
  removeMember,
  addBallot,
  addMembers,
  updateMetadata,
  OrganizationState,
  deserializeState,
  deployBallot,
  BallotInit,
} from "@/contracts/OrganizationGenerated";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { BlockchainTransactionClient } from "@partisiablockchain/blockchain-api-transaction-client";
import { ShardId } from "@/partisia-config";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Ballot, useBallotContract } from "./useBallotContract";

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
    deployBallot: async (
      orgAddress: BlockchainAddress,
      ballotInfo: {
        options: string[];
        title: string;
        description: string;
        administrator: BlockchainAddress;
      }
    ) => {
      const txClient = getTransactionClient();
      const ballotInit: BallotInit = {
        options: ballotInfo.options,
        title: ballotInfo.title,
        description: ballotInfo.description,
        administrator: ballotInfo.administrator,
      };
      const rpc = deployBallot(ballotInit);
      return txClient.signAndSend(
        { address: orgAddress.asString(), rpc },
        10_000_000
      );
    },
  };
}

// New hook that combines organization data with ballot data
export function useOrganizationWithBallots(orgAddress: BlockchainAddress) {
  const { getState } = useOrganizationContract();
  const { getState: getBallotState } = useBallotContract();

  // Get the organization state
  const orgQuery = useQuery({
    queryKey: ["organization", orgAddress.asString()],
    queryFn: () => getState(orgAddress.asString()),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  // Get all ballots for the organization in parallel
  const ballotStatesQueries = useQueries({
    queries: (orgQuery.data?.ballots || []).map((ballotAddress) => ({
      queryKey: ["ballot", ballotAddress.asString()],
      queryFn: () => getBallotState(ballotAddress.asString()),
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      enabled: !!orgQuery.data?.ballots,
    })),
  });

  // Combine organization with its ballots
  const ballots = ballotStatesQueries
    .map((query, index) => {
      if (!query.data || !orgQuery.data?.ballots) return null;
      return {
        address: orgQuery.data.ballots[index],
        state: query.data,
      };
    })
    .filter(
      (ballot): ballot is { address: BlockchainAddress; state: Ballot } =>
        ballot !== null
    );

  return {
    organization: orgQuery.data,
    ballots,
    loading: orgQuery.isLoading || ballotStatesQueries.some((q) => q.isLoading),
    error:
      (orgQuery.error || ballotStatesQueries.find((q) => q.error)?.error) ??
      null,
    refresh: () => {
      orgQuery.refetch();
      return Promise.all(ballotStatesQueries.map((q) => q.refetch()));
    },
  };
}
