"use client";

import { RegistrationTabs } from "../../../components/global/Registration/RegistrationTabs";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-black to-gray-900">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Join Neural Tutors
          </h1>
          <p className="mt-4 text-gray-400 text-lg">
            Create your account and start your educational journey
          </p>
        </div>
        <RegistrationTabs />
      </div>
    </main>
  );
}
