import { ExternalLinkIcon } from "lucide-react";
import { OrganizationState } from "@/contracts/OrganizationGenerated";

interface AboutTabProps {
  organization: OrganizationState;
  contractId: string;
}

const AboutTab = ({ organization, contractId }: AboutTabProps) => {
  return (
    <div className="py-4">
      <div className="space-y-6">
        {/* Contract ID */}
        <div className="flex flex-col xl:flex-row gap-2">
          <div className="w-fit inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono xl:text-sm font-medium bg-gray-100 text-gray-600">
            ID ⁘ {contractId}
          </div>
          <a
            href={`https://browser.testnet.partisiablockchain.com/contracts/${contractId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit inline-flex items-center px-2.5 py-0.5 rounded-full text-xs xl:text-sm font-medium bg-blue-100 text-blue-600 hover:bg-blue-200"
          >
            view on explorer <ExternalLinkIcon className="w-3 h-3 ml-1" />
          </a>
        </div>

        {/* Description */}
        {organization.description && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {organization.description}
            </p>
          </div>
        )}

        {/* Links */}
        {(organization.website ||
          organization.xAccount ||
          organization.discordServer) && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Links</h3>
            <div className="space-y-3">
              {organization.website && (
                <div className="flex items-center gap-3">
                  <span className="font-medium w-20">Website:</span>
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    {organization.website}
                    <ExternalLinkIcon className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}

              {organization.xAccount && (
                <div className="flex items-center gap-3">
                  <span className="font-medium w-20">X:</span>
                  <a
                    href={`https://x.com/${organization.xAccount}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    @{organization.xAccount}
                    <ExternalLinkIcon className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}

              {organization.discordServer && (
                <div className="flex items-center gap-3">
                  <span className="font-medium w-20">Discord:</span>
                  <a
                    href={organization.discordServer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    Join Server
                    <ExternalLinkIcon className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contract Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Contract Details</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="font-medium w-20">Owner:</span>
              <div className="flex flex-col xl:flex-row gap-2">
                <div className="w-fit inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono xl:text-sm font-medium bg-gray-100 text-gray-600">
                  ID ⁘ {organization.owner.asString()}
                </div>
                <a
                  href={`https://browser.testnet.partisiablockchain.com/accounts/${organization.owner.asString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit inline-flex items-center px-2.5 py-0.5 rounded-full text-xs xl:text-sm font-medium bg-blue-100 text-blue-600 hover:bg-blue-200"
                >
                  view <ExternalLinkIcon className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutTab;
