"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInputField } from "../FormInputField";
import { Mail } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/auth";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["school", "teacher", "student"]),
});

type FormData = z.infer<typeof formSchema>;

export function RequestResetForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "student",
    },
    mode: "onChange",
  });

  async function onSubmit(values: FormData) {
    try {
      const result = await requestPasswordReset(values.email, values.role);

      if (result.error) {
        toast.error("Reset request failed!", {
          description: result.error,
        });
      } else {
        setIsSubmitted(true);
        toast.success("Reset email sent!", {
          description: "Please check your email for reset instructions.",
        });
      }
    } catch (error) {
      console.error("Reset request error:", error);
      toast.error("Reset request failed!", {
        description: "An unexpected error occurred.",
      });
    }
  }

  if (isSubmitted) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
        <p className="text-gray-600 dark:text-gray-400">
          We've sent password reset instructions to your email address.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Enter your email to receive reset instructions
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
              name="email"
              label="Email"
              placeholder="Enter your email"
              type="email"
              icon={<Mail className="h-5 w-5 text-gray-400" />}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select
                {...form.register("role")}
                className="w-full p-2 border rounded-md"
              >
                <option value="school">School</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Send Reset Instructions
          </Button>
        </form>
      </Form>
    </div>
  );
}
