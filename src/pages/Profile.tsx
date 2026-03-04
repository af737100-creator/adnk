import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { User, Mail, Shield, Save, Loader2, Camera } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile?.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'تم تحديث الملف الشخصي بنجاح' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'فشل التحديث' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">الملف الشخصي</h1>
        <p className="text-stone-500">إدارة معلوماتك الشخصية وإعدادات الحساب</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="h-32 bg-emerald-600 relative">
          <div className="absolute -bottom-12 right-8">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-4 border-white bg-stone-100 flex items-center justify-center text-emerald-700 text-3xl font-bold shadow-sm">
                {fullName.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 left-0 bg-white p-1.5 rounded-full shadow-md border border-stone-100 text-stone-500 hover:text-emerald-600 transition-all">
                <Camera className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-16 p-8">
          <form onSubmit={handleUpdate} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700">الاسم الكامل</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pr-10 rounded-xl border border-stone-200 bg-stone-50 py-3 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">البريد الإلكتروني</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={profile?.id ? 'user@example.com' : ''} // In real app, get from auth
                    className="block w-full pr-10 rounded-xl border border-stone-200 bg-stone-100 py-3 text-stone-500 sm:text-sm cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-[10px] text-stone-400">لا يمكن تغيير البريد الإلكتروني حالياً</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">نوع الحساب</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    disabled
                    value={profile?.role === 'teacher' ? 'معلم' : 'طالب'}
                    className="block w-full pr-10 rounded-xl border border-stone-200 bg-stone-100 py-3 text-stone-500 sm:text-sm cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <Save className="ml-2 h-5 w-5" />
                    حفظ التغييرات
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
