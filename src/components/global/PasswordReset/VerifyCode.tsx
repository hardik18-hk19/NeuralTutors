"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInputField } from "../FormInputField";
import { Key, RefreshCw } from "lucide-react";
import { verifyResetCode, resendVerificationCode } from "@/lib/backend/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const formSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

type FormData = z.infer<typeof formSchema>;

export function VerifyCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const role = searchParams.get("role") as
    | "school"
    | "teacher"
    | "student"
    | null;
  const [isResending, setIsResending] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
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
    if (!token || !role) return;

    try {
      const result = await verifyResetCode(token, values.code, role);

      if (result.error) {
        toast.error("Verification failed!", {
          description: result.error,
        });
      } else if (result.success && result.token) {
        // Redirect to password reset form with the new token
        router.push(
          `/reset-password/confirm?token=${result.token}&role=${role}`
        );
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed!", {
        description: "An unexpected error occurred.",
      });
    }
  }

  async function handleResendCode() {
    if (!token || !role) return;

    try {
      setIsResending(true);
      const result = await resendVerificationCode(
        token as string,
        role as "school" | "teacher" | "student"
      );

      if (result.error) {
        toast.error("Failed to resend code!", {
          description: result.error,
        });
      } else if (result.success) {
        toast.success("Code resent successfully!", {
          description: "Please check your email for the new code.",
        });
        // Update the token in the URL if a new one was provided
        if (result.token) {
          router.replace(
            `/reset-password/verify?token=${result.token}&role=${role}`
          );
        }
      }
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Failed to resend code!", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="p-6">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold">Verify Code</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Enter the verification code sent to your email
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
              name="code"
              label="Verification Code"
              placeholder="Enter 6-digit code"
              icon={<Key className="h-5 w-5 text-gray-400" />}
            />
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Verify Code
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendCode}
              disabled={isResending}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isResending ? "animate-spin" : ""}`}
              />
              {isResending ? "Resending..." : "Resend Code"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
