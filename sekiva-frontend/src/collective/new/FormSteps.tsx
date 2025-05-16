import { Button } from "@/components/ui/button";
import { DetailsFields } from "./DetailsFields";
import { collectiveFormOpts } from "./FormOptions";
import { MembersFields } from "./MembersFields";
import { useCollectiveForm } from "./useCollectiveForm";
import { useState } from "react";
import { OrganizationInfo } from "@/contracts/SekivaFactoryGenerated";

import { useAuth } from "@/auth/useAuth";
import { useDeployOrganization } from "@/hooks/useFactoryContract";

const FormSteps = () => {
  const [currStep, setCurrStep] = useState<"define" | "members">("define");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isAuthenticated, isConnected, connect } = useAuth();
  const { mutate: deployOrganization, isPending: isDeploying } =
    useDeployOrganization();

  const form = useCollectiveForm({
    ...collectiveFormOpts,
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        // Check if user is authenticated
        if (!isAuthenticated || !isConnected) {
          // throw new Error("You need to connect your wallet first");
          connect();
        }

        // Format the organization info
        const orgInfo: OrganizationInfo = {
          name: value.name,
          description: value.description,
          profileImage: value.profileImage || "",
          bannerImage: value.bannerImage || "",
          xUrl: value.xUrl || "",
          discordUrl: value.discordUrl || "",
          websiteUrl: value.websiteUrl || "",
        };

        console.log("Deploying organization with info:", orgInfo);
        try {
          deployOrganization(orgInfo);
        } catch (err) {
          console.error("Error deploying organization:", err);
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setIsSubmitting(false);
        }

        // Show success message
        setSuccessMessage(
          "Your collective has been created successfully. You'll be redirected to the home page where you can refresh to see your new collective once the blockchain transaction is confirmed."
        );
      } catch (err) {
        console.error("Error deploying organization:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Define which fields belong to which step
  const stepFields = {
    define: [
      "name",
      "description",
      "profileImage",
      "bannerImage",
      "website",
      "x",
      "discord",
    ],
    members: ["members"],
  };

  const testFormData: OrganizationInfo = {
    name: "THRASHED",
    description: "THRASHED is a collective for warriors",
    profileImage:
      "https://i.pinimg.com/736x/50/3f/8e/503f8ec2c68d2cabdc53702b9cfc6b85.jpg",
    bannerImage:
      "https://i.pinimg.com/736x/34/8e/2c/348e2c524ecaafa6f235e7256bc80a3e.jpg",
    xUrl: "https://x.com/thrashed_be",
    discordUrl: "https://discord.gg/thrashed_be",
    websiteUrl: "https://thrashed.be",
  };

  const handleNextStep = () => {
    // Get current step's fields
    const currentFields = stepFields[currStep];

    // Check if all current fields are valid
    const currentFieldsValid =
      currentFields.every(
        (fieldName: string) =>
          form.state.fieldMeta[fieldName as keyof typeof form.state.fieldMeta]
            ?.errors.length === 0
      ) && !form.state.isPristine;

    if (currentFieldsValid) {
      setCurrStep("members");
    }
  };

  const handlePreviousStep = () => {
    setCurrStep("define");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {currStep === "define" && (
        <>
          <h1 className="text-2xl xl:text-4xl font-normal tracking-tighter py-3">
            Define your collective.
          </h1>
          <DetailsFields form={form} />
        </>
      )}
      {process.env.NODE_ENV === "development" && (
        <>
          <Button
            type="button"
            onClick={() => deployOrganization(testFormData)}
            className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600"
            disabled={isDeploying}
          >
            {isDeploying
              ? "Deploying..."
              : "Test Deploy with Status (Dev Only)"}
          </Button>
          {/* {txStatus && (
            <div
              className={`mt-4 p-3 border rounded-sm ${
                txStatus.status === "error"
                  ? "bg-red-50 text-red-500 border-red-200"
                  : txStatus.status === "confirmed"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-blue-50 text-blue-600 border-blue-200"
              }`}
            >
              {txStatus.status === "signing" && "Signing transaction..."}
              {txStatus.status === "pending" &&
                `Transaction pending (${txStatus.attempt || 1}/60)...`}
              {txStatus.status === "confirmed" && "Transaction confirmed!"}
              {txStatus.status === "error" && `Error: ${txStatus.error}`}
            </div>
          )} */}
        </>
      )}
      {currStep === "members" && (
        <>
          <h1 className="text-2xl xl:text-4xl font-normal tracking-tighter py-3">
            Add members.
          </h1>
          <MembersFields form={form} />

          {!isAuthenticated && (
            <div className="mt-4 p-3 bg-red-50 text-red-500 border border-red-200 rounded-sm">
              You need to connect your wallet first
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-500 border border-red-200 rounded-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 text-green-600 border border-green-200 rounded-sm">
              {successMessage}
            </div>
          )}
        </>
      )}

      {currStep === "define" && (
        <Button type="button" onClick={handleNextStep} className="w-full mt-4">
          next: add members
        </Button>
      )}
      {currStep === "members" && (
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handlePreviousStep}
            className="w-full mt-4"
            disabled={isSubmitting}
          >
            previous: add details
          </Button>
          <Button
            type="submit"
            disabled={
              isDeploying || form.state.isSubmitting || !isAuthenticated
            }
            className="w-full mt-4"
          >
            {isDeploying ? "submitting..." : "create collective"}
          </Button>
        </div>
      )}
    </form>
  );
};

export { FormSteps };
