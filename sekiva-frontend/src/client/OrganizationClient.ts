import {
  OrganizationState,
  deserializeState,
} from "@/contracts/OrganizationGenerated";
import { TESTNET_URL, SHARD_PRIORITY } from "@/partisia-config";

const fetchOrganizationFromShard = async (
  id: string,
  shard: string
): Promise<OrganizationState> => {
  const response = await fetch(
    `${TESTNET_URL}/shards/${shard}/blockchain/contracts/${id}`
  ).then((res) => res.json());

  if (!response?.serializedContract?.state?.data) {
    throw new Error(`No contract data from ${shard}`);
  }

  const stateBuffer = Buffer.from(
    response.serializedContract.state.data,
    "base64"
  );
  return deserializeState(stateBuffer);
};

export async function getOrganizationState(
  id: string
): Promise<OrganizationState> {
  let lastError: Error | null = null;

  for (const shard of SHARD_PRIORITY) {
    try {
      return await fetchOrganizationFromShard(id, shard);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (shard === SHARD_PRIORITY[SHARD_PRIORITY.length - 1]) {
        throw lastError;
      }
      continue;
    }
  }
  throw lastError;
}
