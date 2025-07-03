"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import api from "../api";

const companyFields = [
  { label: "Company Name", name: "companyName", required: true, placeholder: "Enter company name" },
  { label: "Full Name", name: "fullName", required: true, placeholder: "Enter your full name" },
  { label: "Phone Number", name: "phone", required: true, placeholder: "Enter phone number" },
  { label: "Email", name: "email", required: true, placeholder: "Enter email address" },
  { label: "Password", name: "password", required: true, placeholder: "Create a password", type: "password" },
  { label: "Head Office Address", name: "address", required: false, placeholder: "Enter head office address" },
];

const driverFields = [
  { label: "Full Name", name: "fullName", required: true, placeholder: "Enter your full name" },
  { label: "Mobile Number", name: "mobile", required: true, placeholder: "Enter mobile number" },
  { label: "Password", name: "password", required: true, placeholder: "Create a password", type: "password" },
  { label: "Vehicle Plate Number", name: "plateNumber", required: true, placeholder: "Enter vehicle plate number" },
  { label: "Vehicle Type", name: "vehicleType", required: false, placeholder: "Truck, Van, Motorcycle, ..." },
  { label: "Profile Photo", name: "profilePhoto", required: false, type: "file" },
  { label: "Company (if applicable)", name: "company", required: false, placeholder: "Select company if applicable" },
];

export default function LoginPage() {
  const [tab, setTab] = useState("login");
  const [registerType, setRegisterType] = useState("company");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [loginType, setLoginType] = useState("company");
  const router = useRouter();

  // ثبت‌نام
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterMessage("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    let data: any = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    let payload: any = {};
    if (registerType === "company") {
      payload = {
        user: {
          username: data.email,
          email: data.email,
          password: data.password,
        },
        company_name: data.companyName,
        manager_full_name: data.fullName,
        phone: data.phone,
        address: data.address,
      };
    } else {
      payload = {
        user: {
          username: data.mobile,
          email: data.mobile + "@driver.com",
          password: data.password,
        },
        full_name: data.fullName,
        mobile: data.mobile,
        plate_number: data.plateNumber,
        vehicle_type: data.vehicleType,
        ...(data.company ? { company: data.company } : {}),
        // profile_photo: data.profilePhoto,
      };
    }
    try {
      const res = await api.post(
        registerType === "company"
          ? "accounts/register/company/"
          : "accounts/register/driver/",
        payload
      );
      if (res.status === 201 || res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Registration successful!",
          text: "You can now log in.",
          timer: 2000,
          timerProgressBar: true,
          position: "top",
          showConfirmButton: false,
        });
        setTab("login");
      } else {
        let errorMsg = res.data?.detail || "Registration failed. Please check your information.";
        Swal.fire({
          icon: "error",
          title: "Registration failed",
          text: errorMsg,
          position: "top",
        });
      }
    } catch (err: any) {
      let errorMsg = "Registration failed. Please try again.";
      if (err.response && err.response.data) {
        errorMsg = JSON.stringify(err.response.data);
      }
      Swal.fire({
        icon: "error",
        title: "Registration failed",
        text: errorMsg,
        position: "top",
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  // لاگین
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginMessage("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const username = formData.get("login-username") as string;
    const password = formData.get("login-password") as string;
    try {
      const res = await api.post("auth/token/login/", { username, password });
      if (res.status === 200) {
        const token = res.data.auth_token;
        localStorage.setItem("token", token);
        // دریافت اطلاعات پروفایل کاربر
        const profileRes = await api.get("auth/users/me/");
        if (profileRes.status === 200) {
          localStorage.setItem("user", JSON.stringify(profileRes.data));
        }
        Swal.fire({
          icon: "success",
          title: "Login successful!",
          timer: 1500,
          timerProgressBar: true,
          position: "top",
          showConfirmButton: false,
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        Swal.fire({
          icon: "error",
          title: "Login failed",
          text: res.data?.non_field_errors?.[0] || "Check your credentials.",
          position: "top",
        });
      }
    } catch (err: any) {
      let errorMsg = "Login failed. Please try again.";
      if (err.response && err.response.data) {
        errorMsg = err.response.data?.non_field_errors?.[0] || JSON.stringify(err.response.data);
      }
      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: errorMsg,
        position: "top",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 px-2">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 md:p-10">
        <div className="flex justify-center mb-8">
          <button
            className={`px-6 py-2 rounded-l-lg font-semibold transition-colors duration-200 cursor-pointer ${tab === "login" ? "bg-blue-600 text-white" : "bg-gray-100 text-blue-700"}`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            className={`px-6 py-2 rounded-r-lg font-semibold transition-colors duration-200 cursor-pointer ${tab === "register" ? "bg-blue-600 text-white" : "bg-gray-100 text-blue-700"}`}
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>
        {tab === "login" ? (
          <>
            <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Sign In</h2>
            <div className="flex justify-center gap-4 mb-4">
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${loginType === "company" ? "bg-blue-500 text-white" : "bg-gray-100 text-blue-700"}`}
                onClick={() => setLoginType("company")}
                type="button"
              >
                Company Owner
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${loginType === "driver" ? "bg-blue-500 text-white" : "bg-gray-100 text-blue-700"}`}
                onClick={() => setLoginType("driver")}
                type="button"
              >
                Driver
              </button>
            </div>
            <div className="mb-2 text-center text-gray-500 text-xs">
              {loginType === "company"
                ? "If you are a company owner, enter your email."
                : "If you are a driver, enter your mobile number."}
            </div>
            {loginMessage && <div className="mb-4 text-center text-red-500">{loginMessage}</div>}
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="login-username" className="block mb-2 text-sm font-medium text-gray-700">
                  {loginType === "company" ? "Email" : "Mobile Number"}
                </label>
                <input
                  type={loginType === "company" ? "email" : "text"}
                  id="login-username"
                  name="login-username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder={loginType === "company" ? "Enter your email" : "Enter your mobile number"}
                  required
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block mb-2 text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  id="login-password"
                  name="login-password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 shadow-md cursor-pointer"
                disabled={loginLoading}
              >
                {loginLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Register</h2>
            {registerMessage && <div className="mb-4 text-center text-green-600">{registerMessage}</div>}
            <div className="flex justify-center gap-4 mb-6">
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${registerType === "company" ? "bg-blue-500 text-white" : "bg-gray-100 text-blue-700"}`}
                onClick={() => setRegisterType("company")}
                type="button"
              >
                Company Owner
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${registerType === "driver" ? "bg-blue-500 text-white" : "bg-gray-100 text-blue-700"}`}
                onClick={() => setRegisterType("driver")}
                type="button"
              >
                Driver
              </button>
            </div>
            <form className="space-y-5" onSubmit={handleRegister}>
              {(registerType === "company" ? companyFields : driverFields).map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block mb-2 text-sm font-medium text-gray-700">
                    {field.label}{field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === "file" ? (
                    <input
                      type="file"
                      id={field.name}
                      name={field.name}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ) : field.name === "company" ? (
                    <input
                      type="text"
                      id={field.name}
                      name={field.name}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      id={field.name}
                      name={field.name}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 shadow-md cursor-pointer"
                disabled={registerLoading}
              >
                {registerLoading ? "Registering..." : "Register"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
} 