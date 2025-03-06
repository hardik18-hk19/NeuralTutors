"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { FormInputField } from "./FormInputField";
import {
  UserRound,
  Lock,
  Mail,
  IdCard,
  School,
  GraduationCap,
} from "lucide-react";

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
    studentName: z
      .string()
      .min(2, "Student name must be at least 2 characters"),
    studentId: z.string().min(4, "Student ID must be at least 4 characters"),
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

export function StudentRegistrationForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      studentId: "",
      schoolName: "",
      schoolId: "",
      userId: "",
      email: "",
      password: "",
      retypePassword: "",
    },
    mode: "onChange", // Enable real-time validation
  });

  function onSubmit(values: FormData) {
    toast.success("Student registered successfully!", {
      description: "Your account has been created.",
    });
    console.log(values);
  }

  return (
    <Card className="w-full max-w-2xl shadow-xl border-2 border-black/10 dark:border-white/10">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-3xl font-bold">
          Student Registration
        </CardTitle>
        <p className="text-gray-500 dark:text-gray-400">
          Register as a student in our system
        </p>
      </CardHeader>
      <CardContent>
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
                  name="studentName"
                  label="Student Name"
                  placeholder="Enter your full name"
                  icon={<GraduationCap className="h-5 w-5 text-gray-400" />}
                />

                <FormInputField
                  control={form.control}
                  name="studentId"
                  label="Student ID"
                  placeholder="Enter student ID"
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
              Register Student
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
