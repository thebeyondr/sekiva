import { createFormHook } from "@tanstack/react-form";
import { lazy } from "react";
import { fieldContext, formContext } from "@/collective/new/FormContext.tsx";

const TextField = lazy(() => import("./TextField.tsx"));

export const { useAppForm: useCollectiveForm, withForm: withCollectiveForm } =
  createFormHook({
    fieldComponents: {
      TextField,
    },
    formComponents: {},
    fieldContext,
    formContext,
  });
