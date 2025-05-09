import NavBar from "@/components/shared/NavBar";
import sekivaLogo from "@/assets/sekiva-logo-lg.webp";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";

function NewBallot() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      options: [] as string[],
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        console.log("Submitting ballot:", value);
        // Here you would call your API to create the ballot
        alert("Ballot created successfully!");
      } catch (error) {
        console.error("Error creating ballot:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-sk-yellow-saturated">
      <div className="container mx-auto max-w-[1500px]">
        <NavBar />
        <section className="container mx-auto max-w-3xl py-10">
          <div className="relative flex flex-col gap-4 bg-white rounded-lg p-10 border-2 border-black overflow-clip">
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
                      <p className="text-xs uppercase font-medium tracking-wide text-stone-700 mb-2">
                        Add up to 5 options:{" "}
                        {5 - form.state.values.options.length} remaining
                      </p>

                      <form.Field name="options" mode="array">
                        {(field) => {
                          const isFirstField = field.state.value.length === 0;
                          if (isFirstField) field.pushValue("");

                          return (
                            <div className="flex flex-col gap-2">
                              {field.state.value.map((_, i) => (
                                <div className="flex gap-2 w-full" key={i}>
                                  <p className="mt-3 flex items-center justify-center text-lg uppercase font-medium tracking-wide text-stone-700 bg-blue-500/20 rounded-sm p-1 my-auto w-10 h-10">
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

                    <Button
                      type="submit"
                      className="w-full mt-4"
                      disabled={isSubmitting || form.state.isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create ballot"}
                    </Button>
                  </form>
                </section>
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

export default NewBallot;
