import { useStore } from "@tanstack/react-form";
import { useFieldContext } from "@/collective/new/FormContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldInfo from "@/components/shared/FieldInfo";
import { Textarea } from "@/components/ui/textarea";

export default function TextField({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: "text" | "textarea";
}) {
  const field = useFieldContext<string>();

  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <div>
      <Label className="text-sm uppercase font-medium tracking-wide text-stone-700">
        {label}
      </Label>
      {type === "text" ? (
        <Input
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
          className={`shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90 ${
            field.state.meta.errors.length > 0
              ? "border-red-500 ring-red-500 ring"
              : ""
          }`}
        />
      ) : (
        <Textarea
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
          className={`shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90 ${
            field.state.meta.errors.length > 0 ? "border-red-500" : ""
          }`}
        />
      )}
      <FieldInfo field={field} errors={errors} />
    </div>
  );
}
