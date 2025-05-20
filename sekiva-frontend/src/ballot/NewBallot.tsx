import sekivaLogo from "@/assets/sekiva-logo-lg.webp";
import { useAuth } from "@/auth/useAuth";
import NavBar from "@/components/shared/NavBar";
import { TransactionDialog } from "@/components/shared/TransactionDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  TransactionPointer,
  useDeployBallot,
} from "@/hooks/useOrganizationContract";
import { BlockchainAddress } from "@partisiablockchain/abi-client";
import { useForm } from "@tanstack/react-form";
import BN from "bn.js";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

type DurationOption = keyof typeof DURATION_OPTIONS;

// Duration options in seconds
const DURATION_OPTIONS = {
  "5 minutes (dev only)": 5 * 60,
  "3 days": 3 * 24 * 60 * 60,
  "1 week": 7 * 24 * 60 * 60,
  "2 weeks": 14 * 24 * 60 * 60,
  "1 month": 30 * 24 * 60 * 60,
} as const;

function NewBallot() {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [txDetails, setTxDetails] = useState<TransactionPointer | null>(null);
  const { account } = useAuth();
  const { organizationId: collectiveId } = useParams();
  const {
    mutate: deployBallot,
    isPending: isDeploying,
    transactionPointer,
  } = useDeployBallot();

  const [testBallotData, setTestBallotData] = useState<{
    title: string;
    description: string;
    options: string[];
    organization: BlockchainAddress;
    durationSeconds: BN;
  } | null>(null);

  useEffect(() => {
    if (!collectiveId) return;
    setTestBallotData({
      title: "Test Ballot",
      description: "This is a test ballot for development purposes",
      options: ["Option 1", "Option 2", "Option 3"],
      organization: BlockchainAddress.fromString(collectiveId),
      durationSeconds: new BN(DURATION_OPTIONS["5 minutes (dev only)"]),
    });
  }, [collectiveId]);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      options: [] as string[],
      organization: collectiveId || "",
      duration: "3 days" as DurationOption,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setSuccessMessage(null);
      setTxDetails(null);

      try {
        if (!account) {
          throw new Error("You need to connect your wallet first");
        }

        if (!value.organization) {
          throw new Error("Organization address is required");
        }

        const cleanOptions = value.options.filter(
          (option) => option.trim() !== ""
        );

        if (cleanOptions.length < 2) {
          throw new Error("At least 2 options are required");
        }

        const organizationAddress = BlockchainAddress.fromString(
          value.organization
        );

        deployBallot(
          {
            organizationAddress,
            ballotInfo: {
              options: cleanOptions,
              title: value.title,
              description: value.description,
              administrator: BlockchainAddress.fromString(account.getAddress()),
              durationSeconds: new BN(DURATION_OPTIONS[value.duration]),
            },
          },
          {
            onSuccess: (data) => {
              if (transactionPointer) {
                setTxDetails(transactionPointer);
              } else if (data.transactionPointer) {
                setTxDetails({
                  identifier: data.transactionPointer.identifier,
                  destinationShardId:
                    data.transactionPointer.destinationShardId.toString(),
                });
              }
            },
            onError: (error) => {
              setError(error instanceof Error ? error.message : String(error));
            },
          }
        );
      } catch (error) {
        setError(error instanceof Error ? error.message : String(error));
      }
    },
  });

  // Set organization from URL params when component loads
  useEffect(() => {
    if (collectiveId) {
      form.setFieldValue("organization", collectiveId);
    }
  }, [collectiveId]);

  return (
    <div className="min-h-screen bg-sk-yellow-saturated">
      <div className="container mx-auto max-w-[1500px]">
        <NavBar />
        <section className="container mx-auto max-w-3xl py-10">
          <div className="relative flex flex-col gap-4 bg-white rounded-lg p-10 border-2 border-black overflow-clip">
            {collectiveId && (
              <div className="mb-4 flex items-center">
                <Link to={`/collectives/${collectiveId}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    &larr; Back to Collective
                  </Button>
                </Link>
              </div>
            )}
            {process.env.NODE_ENV === "development" && account && (
              <Button
                type="button"
                onClick={() => {
                  if (testBallotData) {
                    deployBallot({
                      organizationAddress: BlockchainAddress.fromString(
                        collectiveId!
                      ),
                      ballotInfo: {
                        options: testBallotData.options,
                        title: testBallotData.title,
                        description: testBallotData.description,
                        administrator: BlockchainAddress.fromString(
                          account.getAddress()
                        ),
                        durationSeconds: testBallotData.durationSeconds,
                      },
                    });
                  }
                }}
                className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600"
                disabled={isDeploying}
              >
                {isDeploying
                  ? "Deploying..."
                  : "Fill Test Ballot Data (Dev Only)"}
              </Button>
            )}
            <div className="absolute bottom-32 -left-1/6 w-1/3 h-auto">
              <img
                src={sekivaLogo}
                alt="Sekiva Logo"
                className="w-full h-full"
              />
            </div>
            <section className="grid grid-cols-12 gap-4">
              <div className="flex col-span-3" />
              <div className="col-span-9 min-h-[500px]">
                <section className="flex flex-col gap-4 max-w-md">
                  <h1 className="text-2xl xl:text-4xl font-normal tracking-tighter py-3">
                    Create new ballot.
                  </h1>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      form.handleSubmit();
                    }}
                    className="flex flex-col gap-4"
                  >
                    <form.Field
                      name="organization"
                      validators={{
                        onBlur: ({ value }) =>
                          !value
                            ? "Organization address is required"
                            : undefined,
                      }}
                    >
                      {(field) => (
                        <div>
                          <Label className="text-sm uppercase font-medium tracking-wide text-stone-700">
                            Organization Address
                          </Label>
                          <Input
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="Paste organization address"
                            readOnly={!!collectiveId}
                            className={`shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90 ${
                              field.state.meta.errors.length > 0
                                ? "border-red-500"
                                : collectiveId
                                  ? "bg-gray-100"
                                  : ""
                            }`}
                          />
                          {!field.state.meta.isValid &&
                            field.state.meta.isTouched && (
                              <p className="text-xs text-red-500 mt-1">
                                {field.state.meta.errors.join(", ")}
                              </p>
                            )}
                        </div>
                      )}
                    </form.Field>

                    {/* Title Field */}
                    <form.Field
                      name="title"
                      validators={{
                        onBlur: ({ value }) =>
                          !value ? "Title is required" : undefined,
                      }}
                    >
                      {(field) => (
                        <div>
                          <Label className="text-sm uppercase font-medium tracking-wide text-stone-700">
                            Title
                          </Label>
                          <Input
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="Ballot title"
                            className={`shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90 ${
                              field.state.meta.errors.length > 0
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          {!field.state.meta.isValid &&
                            field.state.meta.isTouched && (
                              <p className="text-xs text-red-500 mt-1">
                                {field.state.meta.errors.join(", ")}
                              </p>
                            )}
                        </div>
                      )}
                    </form.Field>

                    {/* Description Field */}
                    <form.Field
                      name="description"
                      validators={{
                        onBlur: ({ value }) =>
                          !value ? "Description is required" : undefined,
                      }}
                    >
                      {(field) => (
                        <div>
                          <Label className="text-sm uppercase font-medium tracking-wide text-stone-700">
                            Description
                          </Label>
                          <Textarea
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="What is this ballot about?"
                            className={`shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90 ${
                              field.state.meta.errors.length > 0
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          {!field.state.meta.isValid &&
                            field.state.meta.isTouched && (
                              <p className="text-xs text-red-500 mt-1">
                                {field.state.meta.errors.join(", ")}
                              </p>
                            )}
                        </div>
                      )}
                    </form.Field>

                    {/* Options Section */}
                    <div>
                      <Label className="text-sm uppercase font-medium tracking-wide text-stone-700 mb-2 block">
                        Voting Options
                      </Label>

                      <form.Field name="options" mode="array">
                        {(field) => {
                          return (
                            <div className="flex flex-col gap-2">
                              <p className="text-xs uppercase font-medium tracking-wide text-stone-700 mb-2">
                                Add up to 5 options:{" "}
                                {5 - field.state.value.length} remaining
                              </p>
                              {field.state.value.map((_, i) => (
                                <div
                                  className="flex items-center gap-2 w-full"
                                  key={i}
                                >
                                  <p className="flex items-center justify-center text-lg uppercase font-medium tracking-wide text-stone-700 bg-blue-500/20 rounded-sm p-1 w-10 h-10">
                                    {i + 1}
                                  </p>
                                  <form.Field
                                    name={`options[${i}]`}
                                    validators={{
                                      onBlur: ({ value }) =>
                                        !value
                                          ? "Option text is required"
                                          : undefined,
                                    }}
                                  >
                                    {(optionField) => (
                                      <div className="flex flex-col w-full">
                                        <Input
                                          value={optionField.state.value}
                                          onChange={(e) =>
                                            optionField.handleChange(
                                              e.target.value
                                            )
                                          }
                                          onBlur={optionField.handleBlur}
                                          placeholder={`Option ${i + 1}`}
                                          className={`shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90 ${
                                            optionField.state.meta.errors
                                              .length > 0
                                              ? "border-red-500"
                                              : ""
                                          }`}
                                        />
                                        {!optionField.state.meta.isValid &&
                                          optionField.state.meta.isTouched && (
                                            <p className="text-xs text-red-500 mt-1">
                                              {optionField.state.meta.errors.join(
                                                ", "
                                              )}
                                            </p>
                                          )}
                                      </div>
                                    )}
                                  </form.Field>
                                </div>
                              ))}

                              {field.state.value.length < 5 && (
                                <Button
                                  className="w-full shadow-none border-2"
                                  variant="outline"
                                  onClick={() => {
                                    if (field.state.value.length < 5) {
                                      field.pushValue("");
                                    }
                                  }}
                                  type="button"
                                >
                                  Add option
                                </Button>
                              )}
                            </div>
                          );
                        }}
                      </form.Field>
                    </div>

                    {/* Duration Field */}
                    <form.Field
                      name="duration"
                      validators={{
                        onBlur: ({ value }) =>
                          !value ? "Duration is required" : undefined,
                      }}
                    >
                      {(field) => (
                        <div>
                          <Label className="text-sm uppercase font-medium tracking-wide text-stone-700">
                            Voting Duration
                          </Label>
                          <Select
                            value={field.state.value}
                            onValueChange={(value: DurationOption) =>
                              field.handleChange(value)
                            }
                            disabled={process.env.NODE_ENV !== "development"}
                          >
                            <SelectTrigger className="shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              {(
                                Object.entries(DURATION_OPTIONS) as [
                                  DurationOption,
                                  number,
                                ][]
                              ).map(([label, seconds]) => (
                                <SelectItem
                                  key={label}
                                  value={label}
                                  disabled={
                                    process.env.NODE_ENV !== "development" &&
                                    label === "5 minutes (dev only)"
                                  }
                                >
                                  {label} ({Math.floor(seconds / 3600)} hours)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!field.state.meta.isValid &&
                            field.state.meta.isTouched && (
                              <p className="text-xs text-red-500 mt-1">
                                {field.state.meta.errors.join(", ")}
                              </p>
                            )}
                        </div>
                      )}
                    </form.Field>

                    {!account && (
                      <div className="mt-4 p-3 bg-red-50 text-red-500 border border-red-200 rounded-sm">
                        You need to connect your wallet first
                      </div>
                    )}

                    <form.Subscribe
                      selector={(formState) => ({
                        errors: formState.errors,
                        isSubmitting: formState.isSubmitting,
                        canSubmit: formState.canSubmit,
                      })}
                    >
                      {({ errors, isSubmitting, canSubmit }) => (
                        <>
                          {errors.length > 0 && (
                            <div className="mt-4 p-3 bg-red-50 text-red-500 border border-red-200 rounded-sm">
                              {errors.join(", ")}
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

                          <Button
                            type="submit"
                            className="w-full mt-4"
                            disabled={!canSubmit || isSubmitting || !account}
                          >
                            {isSubmitting ? "Creating..." : "Create ballot"}
                          </Button>
                        </>
                      )}
                    </form.Subscribe>
                  </form>
                </section>
              </div>
            </section>
          </div>
        </section>
      </div>

      {/* Add Transaction Dialog */}
      {txDetails && (
        <TransactionDialog
          action="deploy"
          id={txDetails.identifier}
          destinationShard={txDetails.destinationShardId}
          trait="ballot"
          returnPath={`/collectives/${collectiveId}`}
          onSuccess={(contractAddress) => {
            console.log("Successfully deployed ballot:", contractAddress);
            setSuccessMessage(
              `Your ballot has been created successfully with address: ${contractAddress}`
            );
          }}
          onError={(error) => {
            console.error("Error with transaction:", error);
            setError(`Transaction error: ${error.message}`);
          }}
        />
      )}
    </div>
  );
}

export default NewBallot;
