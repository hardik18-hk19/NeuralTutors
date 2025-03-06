"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInputField } from "../FormInputField";
import { School, Users, UserRound, Lock, Mail } from "lucide-react";
import { registerSchool } from "@/app/actions/auth";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

const formSchema = z
  .object({
    schoolName: z.string().min(2, "School name must be at least 2 characters"),
    userId: z.string().min(4, "User ID must be at least 4 characters"),
    numStudents: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Please enter a valid number of students",
      }),
    numTeachers: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Please enter a valid number of teachers",
      }),
    email: z.string().email("Please enter a valid email address"),
    password: passwordSchema,
    retypePassword: z.string(),
  })
  .refine((data) => data.password === data.retypePassword, {
    message: "Passwords don't match",
    path: ["retypePassword"],
  });

export type FormData = z.infer<typeof formSchema>;

export function SchoolRegistrationForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolName: "",
      userId: "",
      numStudents: "",
      numTeachers: "",
      email: "",
      password: "",
      retypePassword: "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: FormData) {
    try {
      console.log("Form values:", values);
      const formData = new FormData();

      // Add all form fields except retypePassword
      Object.entries(values).forEach(([key, value]) => {
        if (key !== "retypePassword") {
          formData.append(key, value);
          console.log(`Adding to FormData: ${key} = ${value}`);
        }
      });

      const result = await registerSchool(formData);
      console.log("Registration result:", result);

      if (result.error) {
        toast.error("Registration failed!", {
          description: result.error,
        });
      } else if (result.success && result.data) {
        toast.success("School registered successfully!", {
          description: `Your institution has been added to the system. Your School ID is: ${result.data.schoolId}`,
        });
        form.reset();
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed!", {
        description: "An unexpected error occurred.",
      });
    }
  }

  return (
    <div className="p-6">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold">School Registration</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Register your institution in our system
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
              name="schoolName"
              label="School Name"
              placeholder="Enter school name"
              icon={<School className="h-5 w-5 text-gray-400" />}
            />

            <FormInputField
              control={form.control}
              name="userId"
              label="User ID"
              placeholder="Enter user ID"
              icon={<UserRound className="h-5 w-5 text-gray-400" />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInputField
                control={form.control}
                name="numStudents"
                label="Number of Students"
                placeholder="Enter number of students"
                type="number"
                icon={<Users className="h-5 w-5 text-gray-400" />}
              />

              <FormInputField
                control={form.control}
                name="numTeachers"
                label="Number of Teachers"
                placeholder="Enter number of teachers"
                type="number"
                icon={<Users className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <FormInputField
              control={form.control}
              name="email"
              label="Recovery Email"
              placeholder="Enter recovery email"
              type="email"
              icon={<Mail className="h-5 w-5 text-gray-400" />}
            />

            <FormInputField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter password"
              type="password"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />

            <FormInputField
              control={form.control}
              name="retypePassword"
              label="Retype Password"
              placeholder="Retype your password"
              type="password"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Register School
          </Button>
        </form>
      </Form>
    </div>
  );
}
