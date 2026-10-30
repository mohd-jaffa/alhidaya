import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { type FieldValues, FormProvider, useForm, type UseFormReturn } from "react-hook-form";
import type * as z from "zod";

/**
 * A form around one part of the Pages editor, as the editor holds it (D88):
 * the values it starts from, checked by `schema` when Check is pressed, and
 * its methods handed to the test to read and drive.
 */
export function EditorForm({
  values,
  schema,
  onForm,
  children,
}: {
  values: FieldValues;
  schema?: z.ZodType<FieldValues, FieldValues>;
  onForm?: (form: UseFormReturn<FieldValues>) => void;
  children: ReactNode;
}) {
  const form = useForm<FieldValues>({ defaultValues: values, resolver: schema ? zodResolver(schema) : undefined });
  onForm?.(form);
  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(() => {})}>
        {children}
        <button type="submit">Check</button>
      </form>
    </FormProvider>
  );
}
