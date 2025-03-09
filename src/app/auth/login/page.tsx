import { LoginTabs } from "@/components/global/Login/LoginTabs";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-black to-gray-900">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Welcome Back
          </h1>
          <p className="mt-4 text-gray-400 text-lg">
            Sign in to continue your educational journey
          </p>
        </div>
        <LoginTabs />
      </div>
    </main>
  );
}
