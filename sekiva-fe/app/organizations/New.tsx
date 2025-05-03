import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

const orgFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters")
    .max(200, "Description must be less than 200 characters"),
  profile_picture: z.string().url("Must be a valid URL"),
  banner_picture: z.string().url("Must be a valid URL"),
  members: z.array(z.string()).min(2).max(50),
});

const NewOrganizationScreen = () => {
  const orgForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      profile_picture: "",
      banner_picture: "",
      members: [],
    },
    validators: {
      onChange: ({ value }) => {
        const result = orgFormSchema.safeParse(value);
        if (!result.success) {
          return result.error.issues;
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value);
    },
  });

  return (
    <main className="flex flex-col gap-4 bg-stone-200 h-screen">
      <section>
        <p>Sekiva</p>
      </section>
      <section className="flex flex-col gap-2 border-b border-gray-200 container max-w-5xl mx-auto">
        <h1 className="text-4xl xl:text-6xl font-medium tracking-tighter">
          New Organization
        </h1>
        <p className="text-sm xl:text-base">
          Create a new organization to start voting.
        </p>
      </section>
      <section className="container max-w-5xl mx-auto flex gap-2">
        <section className="w-1/3 bg-blue-200">
          <p>Outline</p>
          <p>Add details</p>
        </section>
        <section className="w-2/3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              orgForm.handleSubmit();
            }}
          >
            <div className="space-y-4">
              <orgForm.Field
                name="name"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors && (
                      <p className="text-sm text-red-500">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />

              <orgForm.Field
                name="description"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Description</Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors && (
                      <p className="text-sm text-red-500">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />

              <orgForm.Field
                name="profile_picture"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Profile Picture URL</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors && (
                      <p className="text-sm text-red-500">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />

              <orgForm.Field
                name="banner_picture"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Banner Picture URL</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors && (
                      <p className="text-sm text-red-500">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />

              <orgForm.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Add members"}
                  </Button>
                )}
              />
            </div>
          </form>
        </section>
      </section>
    </main>
  );
};

export default NewOrganizationScreen;
