import { AnyFieldApi } from "@tanstack/react-form";

function FieldInfo({
  field,
  errors,
}: {
  field: AnyFieldApi;
  errors?: string[];
}) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em className="text-xs lg:text-sm text-red-500">
          {errors?.join(", ") || field.state.meta.errors.join(", ")}
        </em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

export default FieldInfo;
