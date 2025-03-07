"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { School, UserRound, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SchoolLoginForm } from "./SchoolLogin";
import { TeacherLoginForm } from "./TeacherLogin";
import { StudentLoginForm } from "./StudentLogin";

export function LoginTabs() {
  return (
    <Card className="w-full max-w-2xl shadow-xl border-2 border-black/10 dark:border-white/10">
      <Tabs defaultValue="school" className="w-full">
        <TabsList className="w-full grid grid-cols-3 rounded-none rounded-t-xl h-16 bg-gray-50 dark:bg-gray-900/50">
          <TabsTrigger
            value="school"
            className="flex items-center gap-3 rounded-none data-[state=active]:rounded-tl-xl text-base font-medium h-full data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white transition-all"
          >
            <School className="h-5 w-5" />
            School
          </TabsTrigger>
          <TabsTrigger
            value="teacher"
            className="flex items-center gap-3 rounded-none text-base font-medium h-full data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white transition-all"
          >
            <UserRound className="h-5 w-5" />
            Teacher
          </TabsTrigger>
          <TabsTrigger
            value="student"
            className="flex items-center gap-3 rounded-none data-[state=active]:rounded-tr-xl text-base font-medium h-full data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white transition-all"
          >
            <GraduationCap className="h-5 w-5" />
            Student
          </TabsTrigger>
        </TabsList>
        <TabsContent value="school" className="mt-0 border-0">
          <SchoolLoginForm />
        </TabsContent>
        <TabsContent value="teacher" className="mt-0 border-0">
          <TeacherLoginForm />
        </TabsContent>
        <TabsContent value="student" className="mt-0 border-0">
          <StudentLoginForm />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
