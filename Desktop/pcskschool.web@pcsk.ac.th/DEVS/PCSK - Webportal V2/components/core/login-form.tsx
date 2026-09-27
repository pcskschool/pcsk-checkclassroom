"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Clock
} from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("redirectTo", redirectTo);

    try {
      const result = await loginAction(null, formData);
      if (result && !result.success && result.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
      }
    } catch {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ กรุณาลองใหม่อีกครั้ง");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Session Timeout Alert Notice */}
      {reason === "timeout" && (
        <div 
          role="alert"
          className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3"
        >
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">เซสชันหมดอายุอัตโนมัติ</p>
            <p className="text-amber-700 mt-0.5">
              คุณไม่ได้ใช้งานระบบเป็นระยะเวลาหนึ่ง ระบบได้ลงชื่อออกเพื่อความปลอดภัย กรุณาเข้าสู่ระบบใหม่อีกครั้ง
            </p>
          </div>
        </div>
      )}

      {/* Error Alert Box */}
      {errorMessage && (
        <div 
          role="alert"
          aria-live="polite"
          className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-rose-900">ไม่สามารถเข้าสู่ระบบได้</p>
            <p className="text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email Field */}
        <div>
          <label 
            htmlFor="login-email" 
            className="block text-base font-medium text-slate-800 mb-2"
          >
            อีเมลผู้ใช้งาน <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="name@pcsk.ac.th"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 placeholder:text-slate-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20 disabled:bg-slate-50 disabled:text-slate-400 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label 
              htmlFor="login-password" 
              className="block text-base font-medium text-slate-800"
            >
              รหัสผ่าน <span className="text-rose-600">*</span>
            </label>
            <span className="text-xs text-slate-400">ความยาวอย่างน้อย 6 ตัวอักษร</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 placeholder:text-slate-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20 disabled:bg-slate-50 disabled:text-slate-400 transition-colors shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus-visible:text-green-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-lg text-base font-medium text-white bg-green-700 hover:bg-green-800 active:bg-green-900 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>กำลังตรวจสอบข้อมูล...</span>
            </>
          ) : (
            <>
              <span>เข้าสู่ระบบ</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
