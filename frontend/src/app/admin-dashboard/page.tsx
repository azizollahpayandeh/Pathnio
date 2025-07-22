"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const access = localStorage.getItem('access');
    const userData = localStorage.getItem('user');
    if (!access || !userData) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== 'superadmin') {
      router.push('/403');
      return;
    }
    // Fetch user list
    fetch('/api/accounts/users/all/', {
      headers: { 'Authorization': `Bearer ${access}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [router]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-10 border border-blue-200">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-6">Admin Dashboard</h1>
        <p className="text-lg text-gray-600 mb-8">Welcome, Azizollah! Here you can manage users and view site statistics.</p>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">User Management</h2>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <table className="min-w-full bg-white rounded-xl shadow text-base">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800">
                  <th className="py-2 px-4 text-left">Username</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-left">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-blue-100">
                    <td className="py-2 px-4">{u.username}</td>
                    <td className="py-2 px-4">{u.email}</td>
                    <td className="py-2 px-4">{u.role === 'superadmin' ? '⚙️ Manager' : '👤 User'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Site Statistics</h2>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            {/* TODO: Show site stats */}
            <p className="text-gray-500">Site statistics will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 