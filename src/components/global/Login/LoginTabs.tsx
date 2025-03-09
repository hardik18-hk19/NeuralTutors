"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { School, UserRound, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SchoolLoginForm } from "./SchoolLogin";
import { TeacherLoginForm } from "./TeacherLogin";
import { StudentLoginForm } from "./StudentLogin";

export function LoginTabs() {
  return (
    <Card className="w-full max-w-2xl mx-auto backdrop-blur-sm bg-black/30 border border-gray-800 shadow-2xl">
      <Tabs defaultValue="school" className="w-full">
        <TabsList className="w-full grid grid-cols-3 rounded-none rounded-t-xl h-16 bg-black/50">
          <TabsTrigger
            value="school"
            className="flex items-center gap-3 rounded-none data-[state=active]:rounded-tl-xl text-base font-medium h-full data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 transition-all"
          >
            <School className="h-5 w-5" />
            School
          </TabsTrigger>
          <TabsTrigger
            value="teacher"
            className="flex items-center gap-3 rounded-none text-base font-medium h-full data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400 transition-all"
          >
            <UserRound className="h-5 w-5" />
            Teacher
          </TabsTrigger>
          <TabsTrigger
            value="student"
            className="flex items-center gap-3 rounded-none data-[state=active]:rounded-tr-xl text-base font-medium h-full data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400 transition-all"
          >
            <GraduationCap className="h-5 w-5" />
            Student
          </TabsTrigger>
        </TabsList>
        <TabsContent value="school" className="mt-0 border-0 p-6">
          <SchoolLoginForm />
        </TabsContent>
        <TabsContent value="teacher" className="mt-0 border-0 p-6">
          <TeacherLoginForm />
        </TabsContent>
        <TabsContent value="student" className="mt-0 border-0 p-6">
          <StudentLoginForm />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
