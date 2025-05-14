import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { ExternalLinkIcon } from "lucide-react";

interface MembersTabProps {
  members: BlockchainAddress[];
  owner: BlockchainAddress;
  administrators: BlockchainAddress[];
}

const MembersTab = ({ members, owner, administrators }: MembersTabProps) => {
  const isAdmin = (address: BlockchainAddress) => {
    return administrators.some(
      (admin) => admin.asString() === address.asString()
    );
  };

  const isOwner = (address: BlockchainAddress) => {
    return owner.asString() === address.asString();
  };

  return (
    <div className="py-4">
      <div className="px-2 py-1 bg-gray-100 rounded-md text-sm mb-6 w-fit">
        {members.length} member{members.length === 1 ? "" : "s"}
      </div>

      {members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 hover:border-gray-300 rounded-md p-3 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                {isOwner(member) && (
                  <span className="text-lg text-amber-600 -mt-1" title="Owner">
                    👑
                  </span>
                )}
                {isAdmin(member) && !isOwner(member) && (
                  <span className="text-lg text-blue-600" title="Administrator">
                    ⚙️
                  </span>
                )}
                <span className="font-mono text-sm truncate max-w-[260px] sm:max-w-md">
                  {member.asString()}
                </span>
              </div>
              <a
                href={`https://browser.testnet.partisiablockchain.com/accounts/${member.asString()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 p-1 hover:bg-blue-50 rounded"
              >
                <ExternalLinkIcon className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">This organization has no members yet.</p>
        </div>
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
    </div>
  );
};

export default MembersTab;
