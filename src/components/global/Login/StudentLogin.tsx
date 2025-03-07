"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInputField } from "../FormInputField";
import { GraduationCap, Lock } from "lucide-react";
import { loginStudent } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  studentId: z.string().min(4, "Student ID must be at least 4 characters"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export function StudentLoginForm() {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  });

  async function onSubmit(values: FormData) {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const result = await loginStudent(formData);

      if (result.error) {
        toast.error("Login failed!", {
          description: result.error,
        });
      } else if (result.success && result.token) {
        // Set the token in a cookie
        document.cookie = `token=${result.token}; path=/; max-age=${
          values.rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60
        }`;

        toast.success("Login successful!", {
          description: `Welcome back, ${result.user?.name}!`,
        });

        // Redirect to dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed!", {
        description: "An unexpected error occurred.",
      });
    }
  }

  return (
    <div className="p-6">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold">Student Login</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back! Please enter your credentials
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
              name="studentId"
              label="Student ID"
              placeholder="Enter your student ID"
              icon={<GraduationCap className="h-5 w-5 text-gray-400" />}
            />

            <FormInputField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={form.watch("rememberMe")}
                onCheckedChange={(checked) =>
                  form.setValue("rememberMe", checked as boolean)
                }
              />
              <label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Login
          </Button>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="link"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => router.push("/auth/register")}
            >
              Don&apos;t have an account? Register
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => router.push("/auth/login")}
            >
              Forgot Password?
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
