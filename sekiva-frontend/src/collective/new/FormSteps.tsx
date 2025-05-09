import { Button } from "@/components/ui/button";
import { DetailsFields } from "./DetailsFields";
import { collectiveFormOpts } from "./FormOptions";
import { MembersFields } from "./MembersFields";
import { useCollectiveForm } from "./useCollectiveForm";
import { useState } from "react";

const FormSteps = () => {
  const [currStep, setCurrStep] = useState<"define" | "members">("define");

  const form = useCollectiveForm({
    ...collectiveFormOpts,
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  // Define which fields belong to which step
  const stepFields = {
    define: ["name", "description", "website"],
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
        </>
      )}

      {currStep === "define" && (
        <Button onClick={handleNextStep} className="w-full mt-4">
          next: add members
        </Button>
      )}
      {currStep === "members" && (
        <div className="flex gap-2">
          <Button onClick={handlePreviousStep} className="w-full mt-4">
            previous: add details
          </Button>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button disabled={isSubmitting} className="w-full mt-4">
                create collective
              </Button>
            )}
          </form.Subscribe>
        </div>
      )}
    </form>
  );
};

export { FormSteps };
