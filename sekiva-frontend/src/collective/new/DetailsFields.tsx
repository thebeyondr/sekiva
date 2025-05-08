import { withCollectiveForm } from "@/collective/new/useCollectiveForm";
import { collectiveFormOpts } from "@/collective/new/FormOptions";

export const DetailsFields = withCollectiveForm({
  ...collectiveFormOpts,
  render: ({ form }) => {
    return (
      <div className="flex flex-col gap-4">
        <form.AppField
          name="name"
          children={(field) => (
            <field.TextField label="Collective Name" placeholder="ACME" />
          )}
        />
        <form.AppField
          name="description"
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
          children={(field) => (
            <field.TextField
              label="Profile Image"
              placeholder="https://collective.com/image.png"
            />
          )}
        />
        <form.AppField
          name="bannerImage"
          children={(field) => (
            <field.TextField
              label="Banner Image"
              placeholder="https://collective.com/image.png"
            />
          )}
        />
        <form.AppField
          name="website"
          children={(field) => (
            <field.TextField
              label="Website"
              placeholder="https://collective.com"
            />
          )}
        />
        <form.AppField
          name="x"
          children={(field) => (
            <field.TextField label="X" placeholder="https://x.com/collective" />
          )}
        />
        <form.AppField
          name="discord"
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
