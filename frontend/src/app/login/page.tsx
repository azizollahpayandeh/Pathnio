'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FloatingAlert from '@/components/FloatingAlert';
import api from '../api';
import { Lock } from 'lucide-react';

interface CompanyData {
  companyName: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  address: string;
}

const companyFields = [
  {
    label: 'Company Name',
    name: 'companyName',
    required: true,
    placeholder: 'Enter company name',
  },
  {
    label: 'Full Name',
    name: 'fullName',
    required: true,
    placeholder: 'Enter your full name',
  },
  {
    label: 'Phone Number',
    name: 'phone',
    required: true,
    placeholder: 'Enter phone number',
  },
  {
    label: 'Email',
    name: 'email',
    required: true,
    placeholder: 'Enter email address',
  },
  {
    label: 'Password',
    name: 'password',
    required: true,
    placeholder: 'Create a password',
    type: 'password',
  },
  {
    label: 'Head Office Address',
    name: 'address',
    required: false,
    placeholder: 'Enter head office address',
  },
];

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const access = localStorage.getItem('access');
      if (access) {
        // User is already logged in, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [router]);

  // Register
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterMessage('');
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: CompanyData = {
      companyName: formData.get('companyName') as string,
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      address: formData.get('address') as string,
    };
    try {
      const res = await api.post('accounts/register/company/', {
        user: {
          username: data.email,
          email: data.email,
          password: data.password,
        },
        company_name: data.companyName,
        manager_full_name: data.fullName,
        phone: data.phone,
        address: data.address,
      });
      if (res.status === 201 || res.status === 200) {
        setAlert({
          type: 'success',
          msg: 'Registration successful! You can now log in.',
        });
        setTab('login');
      } else {
        let errorMsg =
          res.data?.detail ||
          'Registration failed. Please check your information.';
        setAlert({ type: 'error', msg: errorMsg });
      }
    } catch (err: unknown) {
      // Extract DRF validation errors (both top-level and nested 'errors')
      const extractError = (data: any): string | null => {
        if (!data) return null;
        if (typeof data.detail === 'string') return data.detail;
        const source = data.errors || data; // DRF may return dict at root
        if (source.user) {
          const u = source.user;
          if (typeof u === 'string') return u;
          if (u.username && Array.isArray(u.username)) return u.username[0];
          if (u.email && Array.isArray(u.email)) return u.email[0];
          if (u.password && Array.isArray(u.password)) return u.password[0];
        }
        const keys = ['company_name','manager_full_name','phone','address','non_field_errors','password'];
        for (const k of keys) {
          const v = source[k];
          if (typeof v === 'string') return v;
          if (Array.isArray(v) && v.length) return v[0];
        }
        // Fallback: first value in dict
        if (source && typeof source === 'object') {
          const first = Object.values(source)[0] as any;
          if (typeof first === 'string') return first;
          if (Array.isArray(first) && first.length) return first[0];
        }
        return null;
      };

      let errorMsg = 'Registration failed. Please try again.';
      try {
        if (err && typeof err === 'object' && 'response' in err) {
          const data = (err as any).response?.data;
          const parsed = extractError(data);
          if (parsed) errorMsg = parsed;
        }
      } catch {}
      setAlert({ type: 'error', msg: errorMsg });
    } finally {
      setRegisterLoading(false);
    }
  };

  // Login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const username = formData.get('login-username') as string;
    const password = formData.get('login-password') as string;
    try {
      const res = await api.post('accounts/auth/login/', {
        username,
        password,
      });
      if (res.status === 200) {
        const access = res.data.access;
        const refresh = res.data.refresh;
        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);
        // ذخیره user با نقش‌ها از پاسخ لاگین
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        setAlert({ type: 'success', msg: 'Login successful!' });
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setAlert({
          type: 'error',
          msg: res.data?.detail || 'Check your credentials.',
        });
      }
    } catch (err: unknown) {
      let errorMsg = 'Login failed. Please try again.';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as any).response?.data?.detail
      ) {
        errorMsg = (err as any).response.data.detail;
      }
      setAlert({ type: 'error', msg: errorMsg });
    } finally {
      setLoginLoading(false);
    }
  };

  // Floating alert auto-close
  React.useEffect(() => {
    if (alert) {
      const t = setTimeout(() => setAlert(null), 3500);
      return () => clearTimeout(t);
    }
  }, [alert]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 relative overflow-hidden">
      {/* Decorative blurred circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-40 z-0" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-30 z-0" />
      <div className="w-full max-w-lg bg-white/90 rounded-3xl shadow-2xl p-8 md:p-12 relative z-10 backdrop-blur-xl border border-blue-100">
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="bg-blue-100 rounded-full p-4 shadow-lg mb-2">
            <Lock className="w-10 h-10 text-blue-700" />
          </div>
          <div className="flex justify-center w-full gap-2">
            <button
              className={`flex-1 px-6 py-2 rounded-l-xl font-semibold transition-colors duration-200 cursor-pointer text-lg ${
                tab === 'login'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-blue-700'
              }`}
              onClick={() => setTab('login')}
            >
              Login
            </button>
            <button
              className={`flex-1 px-6 py-2 rounded-r-xl font-semibold transition-colors duration-200 cursor-pointer text-lg ${
                tab === 'register'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-blue-700'
              }`}
              onClick={() => setTab('register')}
            >
              Register
            </button>
          </div>
        </div>
        {tab === 'login' ? (
          <>
            <h2 className="text-2xl font-extrabold text-center text-blue-700 mb-8 tracking-tight">
              Sign In to Pathnio
            </h2>
            <form className="space-y-7" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="login-username"
                  className="block mb-2 text-sm font-semibold text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="login-username"
                  name="login-username"
                  className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50/60 placeholder:text-blue-300 text-blue-900 text-base shadow-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="block mb-2 text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="login-password"
                  name="login-password"
                  className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50/60 placeholder:text-blue-300 text-blue-900 text-base shadow-sm"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition duration-200 shadow-lg cursor-pointer mt-2 text-lg"
                disabled={loginLoading}
              >
                {loginLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold text-center text-blue-700 mb-8 tracking-tight">
              Register Your Company
            </h2>
            {registerMessage && (
              <div className="mb-4 text-center text-green-600 font-semibold">
                {registerMessage}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleRegister}>
              {companyFields.map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="block mb-2 text-sm font-semibold text-gray-700"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type || 'text'}
                    id={field.name}
                    name={field.name}
                    className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50/60 placeholder:text-blue-300 text-blue-900 text-base shadow-sm"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition duration-200 shadow-lg cursor-pointer mt-2 text-lg"
                disabled={registerLoading}
              >
                {registerLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </>
        )}
      </div>
      {/* Floating Alert */}
      {alert && (
        <FloatingAlert
          type={alert.type}
          msg={alert.msg}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
}
