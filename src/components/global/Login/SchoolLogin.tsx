"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInputField } from "../FormInputField";
import { School, Lock } from "lucide-react";
import { loginSchool } from "@/lib/backend/auth";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  schoolId: z.string().min(4, "School ID must be at least 4 characters"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export function SchoolLoginForm() {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolId: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  });

  async function onSubmit(values: FormData) {
    try {
      console.log("Form submission started with values:", {
        ...values,
        password: values.password ? "***" : undefined,
      });

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value.toString());
        console.log(
          `Adding to FormData: ${key} = ${key === "password" ? "***" : value}`
        );
      });

      console.log("Calling loginSchool with formData");
      const result = await loginSchool(formData);
      console.log("Login result:", result);

      if (result.error) {
        console.error("Login failed:", result.error);
        toast.error("Login failed!", {
          description: result.error,
        });
      } else if (result.success && result.token) {
        console.log("Login successful, setting token and redirecting");
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
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      toast.error("Login failed!", {
        description: "An unexpected error occurred.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">School Login</h2>
        <p className="text-gray-400 text-sm">
          Enter your credentials to access your school dashboard
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormInputField
              control={form.control}
              name="schoolId"
              label="School ID"
              placeholder="Enter your school ID"
              icon={<School className="h-5 w-5 text-gray-400" />}
            />

            <FormInputField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />

            <div className="flex items-center justify-between">
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
                  className="text-sm font-medium text-gray-300"
                >
                  Remember me
                </label>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-5 rounded-lg text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Sign In
          </Button>

          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
            <Button
              type="button"
              variant="link"
              className="text-sm text-gray-400 hover:text-gray-300"
              onClick={() => router.push("/auth/register")}
            >
              Don&apos;t have an account? Register
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm text-gray-400 hover:text-gray-300"
              onClick={() => router.push("/auth/reset-password")}
            >
              Forgot Password?
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
