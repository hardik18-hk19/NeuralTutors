"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInputField } from "../FormInputField";
import { UserRound, Lock, Mail, IdCard, School } from "lucide-react";
import { registerTeacher } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

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
    teacherName: z
      .string()
      .min(2, "Teacher name must be at least 2 characters"),
    teacherId: z.string().min(4, "Teacher ID must be at least 4 characters"),
    schoolName: z.string().min(2, "School name must be at least 2 characters"),
    schoolId: z.string().min(4, "School ID must be at least 4 characters"),
    userId: z.string().min(4, "User ID must be at least 4 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: passwordSchema,
    retypePassword: z.string(),
  })
  .refine((data) => data.password === data.retypePassword, {
    message: "Passwords don't match",
    path: ["retypePassword"],
  });

export type FormData = z.infer<typeof formSchema>;

export function TeacherRegistrationForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacherName: "",
      teacherId: "",
      schoolName: "",
      schoolId: "",
      userId: "",
      email: "",
      password: "",
      retypePassword: "",
    },
    mode: "onChange",
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
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

      const result = await registerTeacher(formData);
      console.log("Registration result:", result);

      if (result.error) {
        toast.error("Registration failed!", {
          description: result.error,
        });
      } else {
        toast.success("Teacher registered successfully!", {
          description: "Your account has been created.",
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
        <h1 className="text-3xl font-bold">Teacher Registration</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Register as a teacher in our system
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInputField
                control={form.control}
                name="schoolName"
                label="School Name"
                placeholder="Enter school name"
                icon={<School className="h-5 w-5 text-gray-400" />}
              />

              <FormInputField
                control={form.control}
                name="schoolId"
                label="School ID"
                placeholder="Enter school ID"
                icon={<IdCard className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInputField
                control={form.control}
                name="teacherName"
                label="Teacher Name"
                placeholder="Enter your full name"
                icon={<UserRound className="h-5 w-5 text-gray-400" />}
              />

              <FormInputField
                control={form.control}
                name="teacherId"
                label="Teacher ID"
                placeholder="Enter teacher ID"
                icon={<IdCard className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <FormInputField
              control={form.control}
              name="userId"
              label="User ID"
              placeholder="Create a user ID to register"
              icon={<UserRound className="h-5 w-5 text-gray-400" />}
            />

            <FormInputField
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="Enter your email"
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
            Register Teacher
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => router.push("/auth/login")}
            >
              Already have an account? Login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
