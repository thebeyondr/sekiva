import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldInfo from "@/components/shared/FieldInfo";
import { AnyFieldApi } from "@tanstack/react-form";

interface PrefixedTextFieldProps {
  field: AnyFieldApi;
  label: string;
  placeholder: string;
  prefix: string;
  handleOnly?: boolean;
}

export function PrefixedTextField({
  field,
  label,
  placeholder,
  prefix,
  handleOnly = false,
}: PrefixedTextFieldProps) {
  const errors = field.state.meta.errors;

  // If handleOnly is true, we should strip any prefix the user might have entered
  const handleChange = (value: string) => {
    if (handleOnly) {
      // Remove the prefix if the user includes it
      const prefixPattern = new RegExp(`^${prefix}`, "i");
      const cleanedValue = value.replace(prefixPattern, "");
      field.handleChange(cleanedValue);
    } else {
      field.handleChange(value);
    }
  };

  // For display purposes, we show the prefix + value, but internally we might store just the handle
  const displayValue = handleOnly
    ? field.state.value
      ? `${field.state.value}`
      : ""
    : field.state.value || "";

  return (
    <div>
      <Label className="text-sm uppercase font-medium tracking-wide text-stone-700">
        {label}
      </Label>
      <div className="flex rounded-sm border border-black/60 focus-within:ring-2 focus-within:ring-black/90 overflow-hidden">
        <div className="bg-stone-100 text-stone-600 px-3 py-2 border-r border-black/60 flex items-center text-sm whitespace-nowrap">
          {prefix}
        </div>
        <Input
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={field.handleBlur}
          placeholder={placeholder}
          className={`shadow-none border-0 rounded-none focus-visible:ring-0 ${
            errors.length > 0 ? "bg-red-50" : ""
          }`}
        />
      </div>
      <FieldInfo field={field} errors={errors} />
    </div>
  );
}
