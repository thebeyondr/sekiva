import { Button } from "@/components/ui/button";
import { DetailsFields } from "./DetailsFields";
import { collectiveFormOpts } from "./FormOptions";
import { MembersFields } from "./MembersFields";
import { useCollectiveForm } from "./useCollectiveForm";
import { useState } from "react";
import { OrganizationInfo } from "@/contracts/factory/generated";
import { useNavigate } from "react-router";
import { useAuth } from "@/auth/useAuth";
import { FactoryApi, isConnected } from "@/AppState";

const FormSteps = () => {
  const [currStep, setCurrStep] = useState<"define" | "members">("define");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const form = useCollectiveForm({
    ...collectiveFormOpts,
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        // Check if user is authenticated
        if (!isAuthenticated || !isConnected()) {
          throw new Error("You need to connect your wallet first");
        }

        // Format the organization info
        const orgInfo: OrganizationInfo = {
          name: value.name,
          description: value.description,
          profileImage: value.profileImage || "",
          bannerImage: value.bannerImage || "",
          xUrl: value.x || "",
          discordUrl: value.discord || "",
          websiteUrl: value.website || "",
        };

        console.log("Deploying organization with info:", orgInfo);

        // Get the factory API directly from AppState
        const factoryApi = FactoryApi();

        // Deploy the organization
        const result = await factoryApi.deployOrganization(orgInfo);

        console.log("Organization deployed! Transaction:", result);

        // Show success message
        setSuccessMessage(
          "Your collective has been created successfully. You'll be redirected to the home page where you can refresh to see your new collective once the blockchain transaction is confirmed."
        );

        // Navigate to the home page or collectives page after a short delay
        setTimeout(() => {
          navigate("/");
        }, 2000);
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
        <Button onClick={handleNextStep} className="w-full mt-4">
          next: add members
        </Button>
      )}
      {currStep === "members" && (
        <div className="flex gap-2">
          <Button
            onClick={handlePreviousStep}
            className="w-full mt-4"
            disabled={isSubmitting}
          >
            previous: add details
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting || form.state.isSubmitting || !isAuthenticated
            }
            className="w-full mt-4"
          >
            {isSubmitting ? "Creating..." : "create collective"}
          </Button>
        </div>
      )}
    </form>
  );
};

export { FormSteps };
