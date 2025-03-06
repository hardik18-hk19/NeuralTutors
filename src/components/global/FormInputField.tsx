"use client";

import { ReactNode } from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormData } from "./SchoolRegistration";

interface FormInputFieldProps {
  control: Control<FormData>;
  name: keyof FormData;
  label: string;
  placeholder: string;
  type?: string;
  icon: ReactNode;
}

export function FormInputField({
  control,
  name,
  label,
  placeholder,
  type = "text",
  icon,
}: FormInputFieldProps) {
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
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
