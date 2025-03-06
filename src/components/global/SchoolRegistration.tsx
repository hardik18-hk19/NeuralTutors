"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { FormInputField } from "./FormInputField";
import { School, Users, UserRound, Lock, Mail } from "lucide-react";

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
    password: z.string().min(8, "Password must be at least 8 characters"),
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
  });

  function onSubmit(values: FormData) {
    console.log(values);
  }

  return (
    <Card className="w-full max-w-2xl shadow-xl border-2 border-black/10 dark:border-white/10">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-3xl font-bold">
          School Registration
        </CardTitle>
        <p className="text-gray-500 dark:text-gray-400">
          Register your institution in our system
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
      </CardContent>
    </Card>
  );
}
