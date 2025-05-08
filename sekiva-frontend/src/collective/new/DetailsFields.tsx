import { withCollectiveForm } from "@/collective/new/useCollectiveForm";
import { collectiveFormOpts } from "@/collective/new/FormOptions";

export const DetailsFields = withCollectiveForm({
  ...collectiveFormOpts,
  render: ({ form }) => {
    return (
      <div className="flex flex-col gap-4">
        <form.AppField
          name="name"
          validators={{
            onBlur: ({ value }) =>
              !value ? "Tell us the name of your collective" : undefined,
          }}
          children={(field) => (
            <field.TextField label="Collective Name" placeholder="ACME" />
          )}
        />
        <form.AppField
          name="description"
          validators={{
            onBlur: ({ value }) =>
              !value ? "Tell us about your mission" : undefined,
          }}
          children={(field) => (
            <field.TextField
              label="Description"
              placeholder="What is the mission?"
              type="textarea"
            />
          )}
        />
        <form.AppField
          name="profileImage"
          validators={{
            onBlur: ({ value }) =>
              !value ? "Add the URL of your profile image" : undefined,
          }}
          children={(field) => (
            <field.TextField
              label="Profile Image"
              placeholder="https://collective.com/image.png"
            />
          )}
        />
        <form.AppField
          name="bannerImage"
          validators={{
            onBlur: ({ value }) =>
              !value ? "Add the URL of your banner image" : undefined,
          }}
          children={(field) => (
            <field.TextField
              label="Banner Image"
              placeholder="https://collective.com/image.png"
            />
          )}
        />
        <form.AppField
          name="website"
          validators={{
            onBlur: ({ value }) =>
              !value ? "Add the URL of your website" : undefined,
          }}
          children={(field) => (
            <field.TextField
              label="Website"
              placeholder="https://collective.com"
            />
          )}
        />
        <form.AppField
          name="x"
          validators={{
            onBlur: ({ value }) =>
              !value ? "Add the URL of your X account" : undefined,
          }}
          children={(field) => (
            <field.TextField label="X" placeholder="https://x.com/collective" />
          )}
        />
        <form.AppField
          name="discord"
          validators={{
            onBlur: ({ value }) =>
              !value ? "Add the URL of your Discord server" : undefined,
          }}
          children={(field) => (
            <field.TextField
              label="Discord"
              placeholder="https://discord.com/collective"
            />
          )}
        />
      </div>
    );
  },
});
