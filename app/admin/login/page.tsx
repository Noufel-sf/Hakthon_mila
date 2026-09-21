'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Compass, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle,
  Sparkles,
  Warehouse,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

/*
// ============================================================================
// [BACKEND AUTH INTEGRATION NOTE - FOR FUTURE USE]
// ============================================================================
// As per specifications, Zod validation and live backend auth API logic are 
// commented out below until the backend authentication endpoints are deployed.
//
// import { z } from 'zod';
//
// export const adminLoginSchema = z.object({
//   email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('يرجى إدخال بريد إلكتروني صالح'),
//   password: z.string().min(6, 'كلمة المرور يجب أن لا تقل عن 6 أحرف'),
//   rememberMe: z.boolean().default(false),
// });
//
// export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
// ============================================================================
*/

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick helper to autofill demo credentials for testing
  const handleAutofillDemo = () => {
    setEmail('admin@bawsala.dz');
    setPassword('admin2026');
    setErrorMsg(null);
    toast.info('تم ملء بيانات المشرف التجريبية');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic client validation (without Zod for now)
    if (!email.trim()) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني أو اسم المستخدم.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('يرجى إدخال كلمة المرور.');
      return;
    }

    setIsLoading(true);

    try {
      /*
      // ========================================================================
      // BACKEND API INTEGRATION (COMMENTED OUT UNTIL BACKEND IS READY):
      // ========================================================================
      // 1. Zod runtime validation:
      // const parsed = adminLoginSchema.safeParse({ email, password, rememberMe });
      // if (!parsed.success) {
      //   setErrorMsg(parsed.error.errors[0]?.message || 'بيانات غير صالحة');
      //   setIsLoading(false);
      //   return;
      // }
      //
      // 2. Call backend authentication endpoint:
      // const response = await api.auth.login({
      //   email: parsed.data.email,
      //   password: parsed.data.password,
      // });
      //
      // 3. Save auth tokens:
      // if (response?.token) {
      //   localStorage.setItem('admin_token', response.token);
      //   document.cookie = `admin_token=${response.token}; path=/; max-age=${rememberMe ? 604800 : 86400}; SameSite=Lax;`;
      // }
      // ========================================================================
      */

      // Simulated network authentication delay for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Store local authentication flag
      try {
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_user_email', email);
      } catch (err) {
        console.warn('Storage unavailable', err);
      }

      toast.success('تم تسجيل الدخول بنجاح! مرحباً بك في لوحة القيادة.');
      router.push('/admin');
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      toast.error('تعذر تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-[#070b12] flex flex-col justify-between antialiased selection:bg-[#0E4B35] selection:text-white">
      {/* Top Header Bar with return link */}
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-header font-bold text-slate-600 dark:text-slate-300 hover:text-[#0E4B35] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          <span>العودة إلى المنصة العامة للمساعدات</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-[#0E4B35]/10 text-[#0E4B35] dark:text-emerald-400 border border-[#0E4B35]/20 rounded-none">
            بوابة الإشراف الميداني v2.4
          </span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md">
          {/* Card Border & Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 rounded-none shadow-sm transition-colors">
            
            {/* Split Top Accent Line (Crisis Red + Algerian Green) */}
            <div className="flex h-1.5 w-full">
              <div className="w-1/4 bg-[#C52233]" />
              <div className="w-3/4 bg-[#0E4B35]" />
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Brand Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-none bg-[#0E4B35] text-white shadow-xs mx-auto mb-1">
                  <Compass className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex items-center justify-center gap-1.5">
                  <h1 className="font-header text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    البوصلة <span className="text-[#0E4B35] dark:text-emerald-400">+</span>
                  </h1>
                  <span className="text-[10px] font-bold font-mono tracking-wider text-slate-700 dark:text-slate-300 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none">
                    لوحة المشرف
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  تسجيل دخول مسؤولي المستودعات وتوجيه القوافل الميدانية
                </p>
              </div>

              {/* Error Notice if any */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 rounded-none animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email / Username Field */}
                <div className="space-y-1.5 text-right">
                  <label 
                    htmlFor="admin-email" 
                    className="block text-xs font-header font-bold text-slate-700 dark:text-slate-300"
                  >
                    البريد الإلكتروني المهني
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="admin-email"
                      type="text"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@bawsala.dz"
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-none pr-10 pl-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0E4B35] transition-colors"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5 text-right">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="admin-password" 
                      className="block text-xs font-header font-bold text-slate-700 dark:text-slate-300"
                    >
                      كلمة المرور
                    </label>
                    <button
                      type="button"
                      onClick={() => toast.info('يرجى التواصل مع مسؤول المنظومة المركزي لاستعادة كلمة المرور')}
                      className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-[#0E4B35] dark:hover:text-emerald-400 transition-colors"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-none pr-10 pl-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0E4B35] transition-colors"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded-none accent-[#0E4B35] border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      تذكر هذا الجهاز
                    </span>
                  </label>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    جلسة مشفّرة
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 bg-[#0E4B35] hover:bg-[#093525] text-white font-header font-bold text-sm rounded-none transition-all shadow-xs disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>جاري التحقق والدخول...</span>
                    </>
                  ) : (
                    <>
                      <Warehouse className="w-4 h-4" />
                      <span>تسجيل الدخول إلى لوحة المستودع</span>
                    </>
                  )}
                </button>
              </form>

              {/* Demo Credentials Quick-Fill Helper Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleAutofillDemo}
                  className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-header font-bold rounded-none border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>ملء بيانات تجريبية سريعة (admin@bawsala.dz)</span>
                </button>
              </div>

              {/* Institutional Notice */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-none text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0E4B35] shrink-0" />
                  <span>منظومة موحدة لإغاثة الكوارث بالجزائر</span>
                </div>
                <p className="leading-relaxed">
                  هذه اللوحة مخصصة فقط لمدراء المستودعات الميدانيين وفرق الهلال الأحمر والحماية المدنية المعتمدة.
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 py-4 px-4 text-center text-xs text-slate-400">
        <p className="font-mono text-[11px]">
          البوصلة + © {new Date().getFullYear()} — منصة التنسيق وتوجيه مساعدات الكوارث في الجزائر
        </p>
      </footer>
    </div>
  );
}
