import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { OrganizationState } from "@/contracts/OrganizationGenerated";
import { ActionType } from "./useAuth";

export function checkPermission(
  actionType: ActionType,
  state: OrganizationState,
  userAddress: BlockchainAddress
): boolean {
  const isOwner = state.owner.asString() === userAddress.asString();
  const isAdmin = state.administrators.some(
    (admin: BlockchainAddress) => admin.asString() === userAddress.asString()
  );
  const isMember = state.members.some(
    (member: BlockchainAddress) => member.asString() === userAddress.asString()
  );

  switch (actionType) {
    case "create_ballot":
      return isOwner || isAdmin;
    case "vote":
      return isOwner || isAdmin || isMember;
    case "create_collective":
      return true;
    case "manage_members":
      return isOwner || isAdmin;
    case "manage_admins":
      return isOwner;
    case "transfer_ownership":
      return isOwner;
    case "update_metadata":
      return isOwner || isAdmin;
    case "delete_collective":
      return isOwner;
    default:
      return false;
  }
}
