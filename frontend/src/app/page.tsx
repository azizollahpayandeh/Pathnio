"use client";
import { useRouter } from "next/navigation";
export default function HomePage() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white rounded-xl shadow p-10 text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Main Page</h1>
        <p className="text-gray-500">Welcome to the Pathnio, the best fleet management system in the world!</p>
        <p className="text-gray-500">Please login to continue</p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4 cursor-pointer" onClick={() => router.push("/login")}>Login</button>
      </div>
    </div>
  );
} 