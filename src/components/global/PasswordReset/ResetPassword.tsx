"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInputField } from "../FormInputField";
import { Lock } from "lucide-react";
import { resetPassword } from "@/app/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const role = searchParams.get("role") as
    | "school"
    | "teacher"
    | "student"
    | null;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  if (!token || !role) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Invalid Reset Link</h2>
        <p className="text-gray-600 dark:text-gray-400">
          This password reset link is invalid or has expired.
        </p>
        <Button
          onClick={() => router.push("/reset-password")}
          className="mt-4 bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          Request New Reset Link
        </Button>
      </div>
    );
  }

  async function onSubmit(values: FormData) {
    try {
      const result = await resetPassword(token, values.password, role);

      if (result.error) {
        toast.error("Password reset failed!", {
          description: result.error,
        });
      } else {
        toast.success("Password reset successful!", {
          description: "You can now log in with your new password.",
        });
        router.push("/login");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Password reset failed!", {
        description: "An unexpected error occurred.",
      });
    }
  }

  return (
    <div className="p-6">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold">Set New Password</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Please enter your new password
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            if (Object.keys(errors).length > 0) {
              toast.error("Form submission failed!", {
                description: "Please fix the errors before submitting.",
              });
            }
          })}
          className="space-y-6"
        >
          <div className="space-y-4">
            <FormInputField
              control={form.control}
              name="password"
              label="New Password"
              placeholder="Enter your new password"
              type="password"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />

            <FormInputField
              control={form.control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your new password"
              type="password"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Reset Password
          </Button>
        </form>
      </Form>
    </div>
  );
}
