"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInputField } from "../FormInputField";
import { GraduationCap, Lock } from "lucide-react";

const formSchema = z.object({
  studentId: z.string().min(4, "Student ID must be at least 4 characters"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof formSchema>;

export function StudentLoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      password: "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: FormData) {
    try {
      console.log("Form values:", values);
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
        console.log(`Adding to FormData: ${key} = ${value}`);
      });

      // TODO: Add login API call here
      toast.success("Login successful!", {
        description: "Welcome back!",
      });
      form.reset();
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
          </div>

          <Button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Login
          </Button>
        </form>
      </Form>
    </div>
  );
}
