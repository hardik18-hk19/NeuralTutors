"use client";

import { StudentRegistrationForm } from "../../../../components/global/StudentRegistration";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <StudentRegistrationForm />
    </div>
  );
}
