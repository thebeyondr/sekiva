import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import {
  useDeployOrganization,
  OrganizationInit,
} from "@/hooks/useFactoryContract";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { useForm, useStore } from "@tanstack/react-form";
import { useState } from "react";
import { TransactionDialog } from "@/components/shared/TransactionDialog";
import { PrefixedTextField } from "./PrefixedTextField";
import CollectivePreview from "./CollectivePreview";
import NavBar from "@/components/shared/NavBar";
import { TextField } from "./TextField";

const NewCollectivePage = () => {
  const { account, isConnected, connect, disconnect } = useAuth();
  const {
    mutate: deployOrganization,
    isPending: isDeploying,
    transactionPointer,
  } = useDeployOrganization();
  const [txDetails, setTxDetails] = useState(
    null as null | { identifier: string; destinationShardId: string }
  );
  const [error, setError] = useState<string | null>(null);

  const ensureWalletConnection = async () => {
    if (isConnected && account) return true;
    try {
      if (isConnected) await disconnect();
      await connect();
      return true;
    } catch {
      setError("Please connect your wallet using the Connect button");
      return false;
    }
  };

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      profileImage: "",
      bannerImage: "",
      website: "",
      x: "",
      discord: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setTxDetails(null);
      const ok = await ensureWalletConnection();
      if (!ok || !account) {
        setError("Please connect your wallet to create a collective");
        return;
      }
      const orgInfo: OrganizationInit = {
        name: value.name,
        description: value.description,
        profileImage: value.profileImage || "",
        bannerImage: value.bannerImage || "",
        xUrl: value.x ? `https://x.com/${value.x}` : "",
        discordUrl: value.discord ? `https://discord.gg/${value.discord}` : "",
        websiteUrl: value.website ? `https://${value.website}` : "",
        administrator: BlockchainAddress.fromString(account.getAddress()),
      };
      deployOrganization(orgInfo, {
        onSuccess: (data) => {
          if (transactionPointer) {
            setTxDetails(transactionPointer);
          } else if (data.transactionPointer) {
            setTxDetails({
              identifier: data.transactionPointer.identifier,
              destinationShardId: data.transactionPointer.destinationShardId,
            });
          }
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : String(err));
        },
      });
    },
  });

  // Use the useStore hook to subscribe to form values for live preview
  const formValues = useStore(form.store, (state) => state.values);

  return (
    <div className="min-h-screen bg-sk-yellow-saturated">
      <NavBar />
      <div className="container mx-auto max-w-[1500px]">
        <section className="container mx-auto max-w-3xl py-10">
          <div className="relative flex flex-col gap-4 bg-white rounded-lg p-10 border-2 border-black overflow-clip">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="w-full"
            >
              <h1 className="text-2xl xl:text-4xl font-normal tracking-tighter py-3">
                Create a new collective
              </h1>
              <div className="flex flex-col gap-4">
                <form.Field
                  name="name"
                  validators={{
                    onBlur: ({ value }) =>
                      !value ? "Enter your collective's name" : undefined,
                  }}
                >
                  {(field) => (
                    <TextField field={field} label="Name" placeholder="ACME" />
                  )}
                </form.Field>
                <form.Field
                  name="description"
                  validators={{
                    onBlur: ({ value }) =>
                      !value ? "Describe your collective's mission" : undefined,
                  }}
                >
                  {(field) => (
                    <TextField
                      field={field}
                      label="Description"
                      placeholder="What is the mission?"
                      type="textarea"
                    />
                  )}
                </form.Field>
                <form.Field name="profileImage">
                  {(field) => (
                    <TextField
                      field={field}
                      label="Profile Image"
                      placeholder="https://collective.com/image.png"
                    />
                  )}
                </form.Field>
                <form.Field name="bannerImage">
                  {(field) => (
                    <TextField
                      field={field}
                      label="Banner Image"
                      placeholder="https://collective.com/banner.png"
                    />
                  )}
                </form.Field>
                <form.Field name="website">
                  {(field) => (
                    <TextField
                      field={field}
                      label="Website"
                      placeholder="collective.com"
                    />
                  )}
                </form.Field>
                <form.Field name="x">
                  {(field) => (
                    <PrefixedTextField
                      field={field}
                      label="X"
                      prefix="x.com/"
                      placeholder="yourhandle"
                      handleOnly={true}
                    />
                  )}
                </form.Field>
                <form.Field name="discord">
                  {(field) => (
                    <PrefixedTextField
                      field={field}
                      label="Discord"
                      prefix="discord.gg/"
                      placeholder="yourserver"
                      handleOnly={true}
                    />
                  )}
                </form.Field>
              </div>
              <div className="my-8">
                <CollectivePreview formValues={formValues} />
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-sm">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="mt-6 w-full"
                disabled={isDeploying}
              >
                {isDeploying ? "Creating..." : "Create Collective"}
              </Button>
              {txDetails && (
                <TransactionDialog
                  action="deploy"
                  id={txDetails.identifier}
                  destinationShard={txDetails.destinationShardId}
                  trait="collective"
                  returnPath="/collectives"
                  onSuccess={() => setTxDetails(null)}
                  onError={() => setTxDetails(null)}
                />
              )}
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NewCollectivePage;
