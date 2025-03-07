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
    <div className="p-4 sm:p-6 md:p-8">
      <div className="space-y-2 text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">School Login</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
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
          className="space-y-4 sm:space-y-6"
        >
          <div className="space-y-3 sm:space-y-4">
            <FormInputField
              control={form.control}
              name="schoolId"
              label="School ID"
              placeholder="Enter your school ID"
              icon={<School className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />}
            />

            <FormInputField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
              icon={<Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />}
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
                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 text-sm sm:text-base"
          >
            Login
          </Button>

          <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
            <Button
              type="button"
              variant="link"
              className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-0"
              onClick={() => router.push("/auth/register")}
            >
              Don&apos;t have an account? Register
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-0"
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
