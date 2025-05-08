import { Button } from "@/components/ui/button";
import { DetailsFields } from "./new/DetailsFields";
import { collectiveFormOpts, membersCheck } from "./new/FormOptions";
import { MembersFields } from "./new/MembersFields";
import { useCollectiveForm } from "./new/useCollectiveForm";

const FormStep = ({
  currStep,
  handleNextStep,
  handlePreviousStep,
}: {
  currStep: number;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
}) => {
  const form = useCollectiveForm({
    ...collectiveFormOpts,
    validators: {
      onChange: ({ value }) => {
        const errors = {
          fields: {},
        } as {
          fields: Record<string, string>;
        };
        if (!value.name) {
          errors.fields.name = "Tell us the name of your collective";
        }
        if (!value.description) {
          errors.fields.description = "Tell us about your mission";
        }
        if (!value.members) {
          errors.fields.members = membersCheck(value.members);
        }
        if (!value.profileImage) {
          errors.fields.profileImage = "Add the URL of your profile image";
        }
        if (!value.bannerImage) {
          errors.fields.bannerImage = "Add the URL of your banner image";
        }
        if (!value.website) {
          errors.fields.website = "Add the URL of your website";
        }
        if (!value.discord) {
          errors.fields.discord = "Add the URL of your Discord server";
        }
        if (!value.x) {
          errors.fields.x = "Add the URL of your X account";
        }

        return errors;
      },
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {currStep === 1 && (
        <>
          <h1 className="text-2xl xl:text-4xl font-normal tracking-tighter py-3">
            Define your collective.
          </h1>
          <DetailsFields form={form} />
        </>
      )}
      {currStep === 2 && (
        <>
          <h1 className="text-2xl xl:text-4xl font-normal tracking-tighter py-3">
            Add members.
          </h1>
          <MembersFields form={form} />
        </>
      )}

      {currStep === 1 && (
        <Button onClick={handleNextStep} className="w-full mt-4">
          next: add members
        </Button>
      )}
      {currStep === 2 && (
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

export { FormStep };
