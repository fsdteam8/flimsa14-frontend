import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function MorePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
      <header className="mb-10">
        <Image
          src="/assets/images/logo.svg"
          alt="StreamApp Logo"
          width={500}
          height={500}
          className="h-[80px] w-[180px] lg:h-[100px] lg:w-[220px]"
        />
      </header>

      <main className="max-w-xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-10 leading-tight">
          Welcome to AzloTV
        </h1>

        <Button
          asChild
          size="lg"
          className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-3 font-semibold transition-transform duration-200 ease-in-out transform hover:scale-105"
        >
          <Link href="/email">Get Started</Link>
        </Button>
      </main>

      {/* Optional: Add a footer or other elements here */}
      {/* <footer>
        <p className="mt-12 text-sm text-gray-400">© 2024 AzloTV. All rights reserved.</p>
      </footer> */}
    </div>
  );
}
