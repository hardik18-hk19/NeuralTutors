import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Sparkles,
  GraduationCap,
  School,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-black to-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                Transform Education with{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  AI-Powered Learning
                </span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl dark:text-gray-400">
                Personalized learning experiences, intelligent tutoring, and
                comprehensive analytics to revolutionize your educational
                institution.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="outline"
                  className="px-8 py-6 rounded-xl text-lg font-semibold border-2 hover:bg-gray-800"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 p-6 bg-gray-800 rounded-2xl hover:bg-gray-750 transition-all duration-200">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Brain className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white">
                AI-Powered Learning
              </h3>
              <p className="text-center text-gray-400">
                Adaptive learning paths and personalized tutoring powered by
                advanced AI algorithms.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 p-6 bg-gray-800 rounded-2xl hover:bg-gray-750 transition-all duration-200">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Sparkles className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Smart Analytics</h3>
              <p className="text-center text-gray-400">
                Comprehensive insights into student performance and learning
                patterns.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 p-6 bg-gray-800 rounded-2xl hover:bg-gray-750 transition-all duration-200">
              <div className="p-3 bg-green-500/10 rounded-full">
                <GraduationCap className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Seamless Integration
              </h3>
              <p className="text-center text-gray-400">
                Easy integration with existing school management systems and
                workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-gradient-to-t from-black to-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Ready to Transform Your School?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl">
                Join the future of education with Neural Tutors. Get started
                today and see the difference.
              </p>
            </div>
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                Start Your Journey
                <School className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
