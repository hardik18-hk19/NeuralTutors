"use client";

import { ReactNode } from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormInputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  type?: string;
  icon: ReactNode;
  description?: string;
}

export function FormInputField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  icon,
  description,
}: FormInputFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <div className="absolute left-3 top-3">{icon}</div>
              <Input
                type={type}
                className="pl-10"
                placeholder={placeholder}
                {...field}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
