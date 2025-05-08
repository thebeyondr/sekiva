import { withCollectiveForm } from "@/collective/new/useCollectiveForm";
import { collectiveFormOpts } from "@/collective/new/FormOptions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const MembersFields = withCollectiveForm({
  ...collectiveFormOpts,
  render: ({ form }) => {
    return (
      <div className="flex gap-2 max-h-[600px]">
        <form.Field name="members" mode="array">
          {(field) => {
            return (
              <div className="flex flex-col gap-4 w-full">
                <p className="text-xs uppercase font-medium tracking-wide text-stone-700">
                  you have {field.state.value.length || 0} members
                </p>
                {field.state.value.map((_, i) => {
                  return (
                    <div className="flex gap-2 w-full justify-baseline">
                      <p className="mt-3 flex items-center justify-center text-lg uppercase font-medium tracking-wide text-stone-700 bg-blue-500/20 rounded-sm p-1 my-auto w-10 h-10">
                        {i + 1}
                      </p>
                      <form.Field key={i} name={`members[${i}].address`}>
                        {(subField) => {
                          return (
                            <div className="flex gap-2">
                              <Label className="flex-3/5">
                                <p className="text-xs uppercase font-medium tracking-wide text-stone-700">
                                  Address
                                </p>
                                <Input
                                  value={subField.state.value}
                                  onChange={(e) =>
                                    subField.handleChange(e.target.value)
                                  }
                                  className="shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90 "
                                  placeholder="0x0000...0000"
                                />
                              </Label>
                            </div>
                          );
                        }}
                      </form.Field>
                      <form.Field name={`members[${i}].role`}>
                        {(subField) => {
                          return (
                            <Label className="flex-2/5">
                              <p className="text-xs uppercase font-medium tracking-wide text-stone-700">
                                Role
                              </p>
                              <Select
                                defaultValue={subField.state.value}
                                onValueChange={(value) =>
                                  subField.handleChange(value)
                                }
                              >
                                <SelectTrigger className="shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90">
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent className="shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90">
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="member">Member</SelectItem>
                                </SelectContent>
                              </Select>
                            </Label>
                          );
                        }}
                      </form.Field>
                    </div>
                  );
                })}
                <Button
                  className="w-fill shadow-none border-2"
                  variant="outline"
                  onClick={() => {
                    // Check if previous field is not empty
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
    );
  },
});
