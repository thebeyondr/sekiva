import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { OrganizationInit } from "@/contracts/SekivaFactoryGenerated";
import { useDeployOrganization } from "@/hooks/useFactoryContract";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { useForm } from "@tanstack/react-form";
import {
  CheckCircle2,
  Shield,
  SkipForward,
  UserCircle,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import CollectivePreview from "./CollectivePreview";
import { PrefixedTextField } from "./PrefixedTextField";
import { TextField } from "./TextField";
import { CollectiveFormValues, Member } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormStepsProps {
  onStepChange?: (step: "define" | "members") => void;
}

export const FormSteps = ({ onStepChange }: FormStepsProps) => {
  const [currStep, setCurrStep] = useState<"define" | "members">("define");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { account, isConnected, connect } = useAuth();
  const { mutate: deployOrganization, isPending: isDeploying } =
    useDeployOrganization();

  // Notify parent component when step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currStep);
    }
  }, [currStep, onStepChange]);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      profileImage: "",
      bannerImage: "",
      website: "",
      x: "",
      discord: "",
      members: [] as Member[],
    },
    onSubmit: async ({ value }) => {
      try {
        setError(null);
        setSuccessMessage(null);

        // Check if user is connected
        if (!isConnected || !account) {
          connect();
          return;
        }

        // Format the organization info - ensure we convert form field names to API field names
        const orgInfo: OrganizationInit = {
          name: value.name,
          description: value.description,
          profileImage: value.profileImage || "",
          bannerImage: value.bannerImage || "",
          // Map x, discord, website to their URL properties
          xUrl: value.x ? `https://x.com/${value.x}` : "",
          discordUrl: value.discord
            ? `https://discord.gg/${value.discord}`
            : "",
          websiteUrl: value.website ? `https://${value.website}` : "",
          administrator: BlockchainAddress.fromString(account.getAddress()),
        };

        console.log("Deploying organization with info:", orgInfo);
        try {
          deployOrganization(orgInfo);
        } catch (err) {
          console.error("Error deploying organization:", err);
          setError(err instanceof Error ? err.message : String(err));
          return;
        }

        // Show success message
        setSuccessMessage(
          "Your collective has been created successfully. You'll be redirected to the home page where you can refresh to see your new collective once the blockchain transaction is confirmed."
        );
      } catch (err) {
        console.error("Error deploying organization:", err);
        setError(err instanceof Error ? err.message : String(err));
      }
    },
  });

  const handleNextStep = () => {
    // Validate all fields in the current step
    const fieldsAreValid = ["name", "description"].every((fieldName) => {
      const fieldMeta = form.getFieldMeta(
        fieldName as keyof CollectiveFormValues
      );
      return !fieldMeta || fieldMeta.errors.length === 0;
    });

    if (fieldsAreValid) {
      setCurrStep("members");
    }
  };

  const handlePreviousStep = () => {
    setCurrStep("define");
  };

  const handleSkipMembers = () => {
    form.handleSubmit();
  };

  const testFormData: OrganizationInit = {
    name: "THRASHED",
    description: "THRASHED is a collective for warriors",
    profileImage:
      "https://i.pinimg.com/736x/50/3f/8e/503f8ec2c68d2cabdc53702b9cfc6b85.jpg",
    bannerImage:
      "https://i.pinimg.com/736x/34/8e/2c/348e2c524ecaafa6f235e7256bc80a3e.jpg",
    xUrl: "https://x.com/thrashed_be",
    discordUrl: "https://discord.gg/thrashed_be",
    websiteUrl: "https://thrashed.be",
    administrator: BlockchainAddress.fromString(
      "005f9b6af48da2d353117fb2d0bbb59743241c556e"
    ),
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

          <div className="mb-6 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-sm text-amber-800">
            <UserCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
              You will automatically be added as the administrator of this
              collective.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <form.Field
              name="name"
              validators={{
                onBlur: ({ value }) =>
                  !value ? "Enter your collective's name" : undefined,
              }}
            >
              {(field) => (
                <TextField
                  field={field}
                  label="Collective Name"
                  placeholder="ACME"
                />
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

            <form.Field
              name="profileImage"
              validators={{
                onBlur: ({ value }) =>
                  !value ? "Add a profile image URL" : undefined,
              }}
            >
              {(field) => (
                <TextField
                  field={field}
                  label="Profile Image"
                  placeholder="https://collective.com/image.png"
                />
              )}
            </form.Field>

            <form.Field
              name="bannerImage"
              validators={{
                onBlur: ({ value }) =>
                  !value ? "Add a banner image URL" : undefined,
              }}
            >
              {(field) => (
                <TextField
                  field={field}
                  label="Banner Image"
                  placeholder="https://collective.com/image.png"
                />
              )}
            </form.Field>

            <form.Field
              name="website"
              validators={{
                onBlur: ({ value }) =>
                  !value ? "Enter your website" : undefined,
              }}
            >
              {(field) => (
                <PrefixedTextField
                  field={field}
                  label="Website"
                  prefix="https://"
                  placeholder="collective.com"
                />
              )}
            </form.Field>

            <form.Field
              name="x"
              validators={{
                onBlur: ({ value }) =>
                  !value ? "Add your X handle" : undefined,
              }}
            >
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

            <form.Field
              name="discord"
              validators={{
                onBlur: ({ value }) =>
                  !value ? "Add your Discord server" : undefined,
              }}
            >
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

            <form.Subscribe selector={(state) => state.values}>
              {(values) => <CollectivePreview formValues={values} />}
            </form.Subscribe>
          </div>
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
        </>
      )}

      {currStep === "members" && (
        <>
          <h1 className="text-2xl xl:text-4xl font-normal tracking-tighter py-3">
            Add members (optional).
          </h1>

          <div className="mb-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-sm text-gray-700">
              <Shield className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                Your wallet address (
                {account
                  ? `${account.getAddress().substring(0, 6)}...${account.getAddress().substring(account.getAddress().length - 4)}`
                  : ""}
                ) will be the administrator of this collective.
              </p>
            </div>

            {/* <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-sm text-gray-700">
              <Share2 className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                After creation, you'll be able to share your collective link
                with potential members.
              </p>
            </div> */}
          </div>

          <div className="flex flex-col gap-4 w-full">
            <form.Field name="members" mode="array">
              {(field) => {
                const isFirstField = field.state.value.length === 0;
                if (isFirstField)
                  field.pushValue({ address: "", role: "member" });
                return (
                  <div className="flex flex-col gap-6 w-full">
                    <p className="text-sm font-medium text-gray-700">
                      YOU HAVE {field.state.value.length || 0} MEMBER
                      {field.state.value.length === 1 ? "" : "S"}
                    </p>
                    <div className="space-y-5">
                      {field.state.value.map((_, i) => {
                        // Get field validation states for the row
                        const addressFieldName =
                          `members[${i}].address` as const;
                        const roleFieldName = `members[${i}].role` as const;

                        const addressMeta = form.getFieldMeta(addressFieldName);

                        const hasAddressError =
                          addressMeta &&
                          !addressMeta.isValid &&
                          addressMeta.isTouched;
                        const addressErrors = hasAddressError
                          ? addressMeta.errors
                          : [];

                        return (
                          <div
                            className="flex flex-col gap-1 w-full pb-3 border-b border-gray-100"
                            key={i}
                          >
                            <div className="flex gap-3 w-full justify-baseline">
                              <p className="mt-3 flex items-center justify-center text-sm font-medium tracking-wide text-gray-500 bg-gray-100 rounded-sm p-1 my-auto w-8 h-8">
                                {i + 1}
                              </p>
                              <form.Field
                                key={i}
                                name={addressFieldName}
                                validators={{
                                  onBlur: ({ value }) =>
                                    !value ? "Enter an address" : undefined,
                                  onChange: ({ value }) => {
                                    if (!value) return undefined;

                                    // Check if address format is valid
                                    if (
                                      !/^00[a-fA-F0-9]{40}$/.test(
                                        value as string
                                      )
                                    ) {
                                      return "Enter a valid Partisia address";
                                    }

                                    // Check if address is the current user's address
                                    if (
                                      account &&
                                      value === account.getAddress()
                                    ) {
                                      return "Use a different address (you're already admin)";
                                    }

                                    return undefined;
                                  },
                                }}
                              >
                                {(subField) => (
                                  <Label className="flex-3/5">
                                    <p className="text-xs uppercase font-medium mb-1 text-gray-600">
                                      Address
                                    </p>
                                    <Input
                                      value={subField.state.value}
                                      onChange={(e) =>
                                        subField.handleChange(e.target.value)
                                      }
                                      onBlur={subField.handleBlur}
                                      className={`shadow-none border-gray-300 rounded-sm focus-visible:ring-1 focus-visible:ring-gray-400 ${
                                        hasAddressError ? "border-red-300" : ""
                                      }`}
                                      placeholder="00x...x"
                                    />
                                  </Label>
                                )}
                              </form.Field>
                              <form.Field name={roleFieldName}>
                                {(subField) => (
                                  <Label className="flex-2/5">
                                    <p className="text-xs uppercase font-medium mb-1 text-gray-600">
                                      Role
                                    </p>
                                    <Select
                                      defaultValue="member"
                                      onValueChange={(value) =>
                                        subField.handleChange(value)
                                      }
                                    >
                                      <SelectTrigger
                                        onBlur={subField.handleBlur}
                                        className="shadow-none border-gray-300 rounded-sm focus-visible:ring-1 focus-visible:ring-gray-400"
                                      >
                                        <SelectValue placeholder="Select a role" />
                                      </SelectTrigger>
                                      <SelectContent className="shadow-none rounded-sm">
                                        <SelectItem value="admin">
                                          Admin
                                        </SelectItem>
                                        <SelectItem value="member">
                                          Member
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </Label>
                                )}
                              </form.Field>
                            </div>
                            {/* Error message row - aligned with wallet address field */}
                            {hasAddressError && (
                              <div className="text-xs text-red-500 pl-11">
                                {addressErrors.join(", ")}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <Button
                      className="mt-2 shadow-none border border-gray-300 text-gray-700 hover:bg-gray-50"
                      variant="outline"
                      onClick={() => {
                        // Check if previous field is not empty if the index is not 0
                        if (
                          field.state.value[field.state.value.length - 1]
                            .address !== ""
                        ) {
                          field.pushValue({ address: "", role: "member" });
                        }
                      }}
                      type="button"
                    >
                      Add member
                    </Button>
                  </div>
                );
              }}
            </form.Field>
          </div>

          {!isConnected && (
            <div className="mt-4 p-3 flex items-center gap-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-sm">
              <div className="h-5 w-5 flex-shrink-0">⚠️</div>
              <p>Connect your wallet to continue</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 flex items-center gap-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-sm">
              <div className="h-5 w-5 flex-shrink-0">⚠️</div>
              <p>{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3 flex items-center gap-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-sm">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-gray-600" />
              <p>{successMessage}</p>
            </div>
          )}
        </>
      )}

      {currStep === "define" && (
        <div className="flex gap-2 mt-4">
          <Button
            type="button"
            onClick={handleNextStep}
            className="w-full flex items-center gap-2"
          >
            <span>next: add members</span>
            <Users className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={handleSkipMembers}
            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center gap-2"
          >
            <span>skip members</span>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      )}

      {currStep === "members" && (
        <div className="flex gap-2 mt-4">
          <Button
            type="button"
            variant={"secondary"}
            onClick={handlePreviousStep}
            className="w-full shadow-none"
          >
            previous: add details
          </Button>
          <Button
            type="submit"
            disabled={isDeploying || !isConnected}
            className="w-full flex items-center gap-2"
          >
            {isDeploying ? (
              <>
                <span>submitting...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </>
            ) : (
              <>
                <span>create collective</span>
                <CheckCircle2 className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
};
