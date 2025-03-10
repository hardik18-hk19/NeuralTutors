"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/backend/auth";
import { TeacherData } from "@/lib/backend/types";
import { Card } from "@/components/ui/card";
import {
  UserRound,
  Mail,
  IdCard,
  School,
  Search,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface SchoolData {
  schoolName: string;
  schoolId: string;
  username: string;
}

interface EnhancedTeacherData extends TeacherData {
  createdAt: string;
}

export default function SchoolDashboard({
  params,
}: {
  params: { schoolId: string };
}) {
  const router = useRouter();
  const [teachers, setTeachers] = useState<EnhancedTeacherData[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<
    EnhancedTeacherData[]
  >([]);
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (
        !session ||
        session.role !== "school" ||
        session.schoolId !== params.schoolId
      ) {
        router.push("/auth/login");
        return;
      }
      fetchSchoolData();
    };

    checkAuth();
  }, [router, params.schoolId]);

  useEffect(() => {
    const filtered = teachers.filter(
      (teacher) =>
        teacher.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.teacherId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [searchQuery, teachers]);

  const fetchSchoolData = async () => {
    try {
      const response = await fetch(`/api/school/teachers`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch school data");
      }

      setSchool(data.school);
      setTeachers(data.teachers);
      setFilteredTeachers(data.teachers);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch school data"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
          <School className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{school?.schoolName}</h1>
          <div className="space-y-1">
            <p className="text-gray-500 dark:text-gray-400">
              School ID: {school?.schoolId}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Username: {school?.username}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Teachers</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          {filteredTeachers.length} teacher
          {filteredTeachers.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <Card
            key={teacher.id}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{teacher.teacherName}</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {teacher.teacherId}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Mail className="h-4 w-4" />
                <span>{teacher.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <IdCard className="h-4 w-4" />
                <span>ID: {teacher.id}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined: {format(new Date(teacher.createdAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery
              ? "No teachers found matching your search."
              : "No teachers found."}
          </p>
        </div>
      )}
    </div>
  );
}
