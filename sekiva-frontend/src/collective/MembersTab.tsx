import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/auth/useAuth";
import { useOrganizationContract } from "@/hooks/useOrganizationContract";
import { TransactionDialog } from "@/components/shared/TransactionDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownIcon, ArrowUpIcon, Signpost } from "lucide-react";
import { useTransaction } from "@/hooks/useTransaction";

interface MembersTabProps {
  members: BlockchainAddress[];
  owner: BlockchainAddress;
  administrators: BlockchainAddress[];
  organizationId?: string;
}

const MembersTab = ({
  members,
  owner,
  administrators,
  organizationId,
}: MembersTabProps) => {
  const { account, canPerformAction } = useAuth();
  const { requiresWalletConnection } = useTransaction();
  const orgId = organizationId;
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState<string | null>(null);
  const [showPromoteDialog, setShowPromoteDialog] = useState<string | null>(
    null
  );
  const [showDemoteDialog, setShowDemoteDialog] = useState<string | null>(null);
  const [txnDialog, setTxnDialog] = useState<null | {
    id: string;
    destinationShard: string;
  }>(null);
  const [addAddress, setAddAddress] = useState("");
  const [canManageMembers, setCanManageMembers] = useState(false);
  const [canManageAdmins, setCanManageAdmins] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addMember, removeMember, promoteMember, demoteMember } =
    useOrganizationContract();

  const needsWallet = useCallback(() => {
    return requiresWalletConnection();
  }, [requiresWalletConnection]);

  // Check permissions for member management
  useEffect(() => {
    let cancelled = false;
    async function checkPerms() {
      if (!orgId || !account) {
        setCanManageMembers(false);
        setCanManageAdmins(false);
        return;
      }

      try {
        const [canManage, canManageAdmin] = await Promise.all([
          canPerformAction("manage_members", orgId),
          canPerformAction("manage_admins", orgId),
        ]);

        if (!cancelled) {
          setCanManageMembers(canManage);
          setCanManageAdmins(canManageAdmin);
        }
      } catch (error) {
        console.error("[Members] Permission check failed:", error);
      }
    }

    checkPerms();
    return () => {
      cancelled = true;
    };
  }, [orgId, account, canPerformAction]);

  // Action handlers
  const handleAddMember = async () => {
    if (!orgId || !addAddress) return;

    try {
      if (needsWallet()) {
        throw new Error("Please connect your wallet first");
      }

      setTxnDialog({
        id: "pending",
        destinationShard: "pending",
      });

      const pointer = await addMember(orgId, addAddress);
      if (pointer) {
        setTxnDialog({
          id: pointer.identifier,
          destinationShard: pointer.destinationShardId,
        });
        setShowAddDialog(false);
        setAddAddress("");
      }
    } catch (err) {
      console.error("Failed to add member:", err);
      setError(err instanceof Error ? err.message : String(err));
      setTxnDialog(null);
    }
  };
  const handleRemoveMember = async (address: string) => {
    if (!orgId) return;
    try {
      setTxnDialog({
        id: "pending",
        destinationShard: "pending",
      });

      const res = await removeMember(orgId, address);
      if (res) {
        setTxnDialog({
          id: res.identifier,
          destinationShard: res.destinationShardId,
        });
      }
      setShowRemoveDialog(null);
    } catch (err) {
      console.error("Failed to remove member:", err);
      setError(err instanceof Error ? err.message : String(err));
      setTxnDialog(null);
    }
  };
  const handlePromoteMember = async (address: string) => {
    if (!orgId) return;
    try {
      setTxnDialog({
        id: "pending",
        destinationShard: "pending",
      });

      const res = await promoteMember(orgId, address);
      if (res) {
        setTxnDialog({
          id: res.identifier,
          destinationShard: res.destinationShardId,
        });
      }
      setShowPromoteDialog(null);
    } catch (err) {
      console.error("Failed to promote member:", err);
      setError(err instanceof Error ? err.message : String(err));
      setTxnDialog(null);
    }
  };
  const handleDemoteMember = async (address: string) => {
    if (!orgId) return;
    try {
      setTxnDialog({
        id: "pending",
        destinationShard: "pending",
      });

      const res = await demoteMember(orgId, address);
      if (res) {
        setTxnDialog({
          id: res.identifier,
          destinationShard: res.destinationShardId,
        });
      }
      setShowDemoteDialog(null);
    } catch (err) {
      console.error("Failed to demote member:", err);
      setError(err instanceof Error ? err.message : String(err));
      setTxnDialog(null);
    }
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-6">
        <div className="px-2 py-1 bg-gray-100 rounded-md text-sm w-fit">
          {members.length} member{members.length === 1 ? "" : "s"}
        </div>
        {canManageMembers && (
          <>
            {needsWallet() && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-amber-800">
                  Please connect your wallet to manage members. You'll need to
                  sign transactions.
                </p>
              </div>
            )}
            <Button
              onClick={() => setShowAddDialog(true)}
              disabled={needsWallet()}
            >
              Add Member
            </Button>
          </>
        )}
      </div>
      {members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 hover:border-gray-300 rounded-md p-3 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                {owner.asString() === member.asString() && (
                  <span className="text-lg text-amber-600 -mt-1" title="Owner">
                    👑
                  </span>
                )}
                {administrators.some(
                  (a) => a.asString() === member.asString()
                ) &&
                  owner.asString() !== member.asString() && (
                    <span
                      className="text-lg text-blue-600"
                      title="Administrator"
                    >
                      ⚙️
                    </span>
                  )}
                {members.length > 0 &&
                  !administrators.some(
                    (a) => a.asString() === member.asString()
                  ) &&
                  owner.asString() !== member.asString() && (
                    <span
                      className="text-lg text-gray-600 -mt-1"
                      title="Member"
                    >
                      👤
                    </span>
                  )}
                <div className="w-fit inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono xl:text-sm font-medium bg-gray-100 text-gray-600">
                  ID ⁘ {member.asString()}
                </div>
              </div>
              {account && member.asString() !== account.getAddress() && (
                <div className="flex gap-2">
                  {/* Only show promote button if user can manage admins and member isn't already an admin */}
                  {canManageAdmins &&
                    !administrators.some(
                      (a) => a.asString() === member.asString()
                    ) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shadow-none"
                        onClick={() => setShowPromoteDialog(member.asString())}
                      >
                        <ArrowUpIcon className="w-4 h-4" />
                        Promote
                      </Button>
                    )}
                  {/* Only show demote button if user can manage admins and member is an admin but not owner */}
                  {canManageAdmins &&
                    administrators.some(
                      (a) => a.asString() === member.asString()
                    ) &&
                    owner.asString() !== member.asString() && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shadow-none"
                        onClick={() => setShowDemoteDialog(member.asString())}
                      >
                        <ArrowDownIcon className="w-4 h-4" />
                        Demote
                      </Button>
                    )}
                  {/* Only show remove button if user can manage members and member isn't owner */}
                  {canManageMembers &&
                    owner.asString() !== member.asString() && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-red-500 bg-red-100 hover:text-white shadow-none"
                        onClick={() => setShowRemoveDialog(member.asString())}
                      >
                        <Signpost className="w-4 h-4" />
                        Remove
                      </Button>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">This organization has no members yet.</p>
        </div>
      )}
      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog} modal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          {needsWallet() && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-800">
                Please connect your wallet to add members. You'll need to sign a
                transaction.
              </p>
            </div>
          )}
          <Input
            type="text"
            value={addAddress}
            onChange={(e) => setAddAddress(e.target.value)}
            placeholder="Enter member address"
            className="shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90"
          />
          <DialogFooter>
            <Button
              onClick={handleAddMember}
              disabled={!addAddress || needsWallet()}
            >
              Add
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Remove Member Dialog */}
      <Dialog
        open={!!showRemoveDialog}
        onOpenChange={() => setShowRemoveDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
          </DialogHeader>
          {needsWallet() && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-800">
                Please connect your wallet to remove members. You'll need to
                sign a transaction.
              </p>
            </div>
          )}
          <p>Are you sure you want to remove this member?</p>
          <DialogFooter>
            <Button
              onClick={() => handleRemoveMember(showRemoveDialog!)}
              disabled={needsWallet()}
            >
              Remove
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Promote Member Dialog */}
      <Dialog
        open={!!showPromoteDialog}
        onOpenChange={() => setShowPromoteDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote to Admin</DialogTitle>
          </DialogHeader>
          {needsWallet() && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-800">
                Please connect your wallet to promote members. You'll need to
                sign a transaction.
              </p>
            </div>
          )}
          <p>Promote this member to administrator?</p>
          <DialogFooter>
            <Button
              onClick={() => handlePromoteMember(showPromoteDialog!)}
              disabled={needsWallet()}
            >
              Promote
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Demote Member Dialog */}
      <Dialog
        open={!!showDemoteDialog}
        onOpenChange={() => setShowDemoteDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demote Admin</DialogTitle>
          </DialogHeader>
          {needsWallet() && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-800">
                Please connect your wallet to demote administrators. You'll need
                to sign a transaction.
              </p>
            </div>
          )}
          <p>Demote this administrator to regular member?</p>
          <DialogFooter>
            <Button
              onClick={() => handleDemoteMember(showDemoteDialog!)}
              disabled={needsWallet()}
            >
              Demote
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Transaction Dialog */}
      {txnDialog && (
        <TransactionDialog action="action" id={txnDialog.id} trait="other" />
      )}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
          Member Roles
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">👑</span>
            <span className="text-sm">
              Owner - Has full control over the organization
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            <span className="text-sm">
              Administrator - Can manage members and ballots
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">👤</span>
            <span className="text-sm">Member - Can participate in ballots</span>
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default MembersTab;
