import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Loader2, GraduationCap, Presentation } from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../types';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (signUpError) throw signUpError;

      // The profile is usually created by a Supabase trigger, 
      // but we'll navigate to login or dashboard depending on setup
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-700">تعليمي</h1>
          <p className="mt-2 text-stone-500">انضم إلينا وابدأ رحلة التعلم التفاعلي</p>
        </div>

        <form onSubmit={handleRegister} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">الاسم الكامل</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="أحمد محمد"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">البريد الإلكتروني</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">كلمة المرور</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                  role === 'student' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                    : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-200'
                }`}
              >
                <GraduationCap className="mb-2 h-6 w-6" />
                <span className="text-sm font-medium">طالب</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                  role === 'teacher' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                    : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-200'
                }`}
              >
                <Presentation className="mb-2 h-6 w-6" />
                <span className="text-sm font-medium">معلم</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <>
                <UserPlus className="ml-2 h-5 w-5" />
                إنشاء الحساب
              </>
            )}
          </button>

          <div className="text-center text-sm">
            <span className="text-stone-500">لديك حساب بالفعل؟ </span>
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
              تسجيل الدخول
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
