import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  Palette, 
  Globe, 
  Bell, 
  Lock, 
  Languages, 
  Layout, 
  Save, 
  Loader2,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Platform Settings
  const [platformName, setPlatformName] = useState('تعليمي');
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [language, setLanguage] = useState('ar');
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = () => {
    setLoading(true);
    // Simulate saving settings
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">إعدادات المنصة</h1>
        <p className="text-stone-500">تخصيص مظهر وتجربة المنصة التعليمية</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Navigation */}
        <div className="space-y-1">
          {[
            { name: 'عام', icon: Globe },
            { name: 'المظهر', icon: Palette },
            { name: 'الإشعارات', icon: Bell },
            { name: 'الأمان', icon: Lock },
          ].map((item, i) => (
            <button
              key={i}
              className={`flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                i === 0 ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <item.icon className="ml-3 h-5 w-5" />
              {item.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100 space-y-6">
            <h3 className="text-lg font-bold text-stone-900 border-b border-stone-50 pb-4">الإعدادات العامة</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">اسم المنصة</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">اللغة الافتراضية</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-stone-900">الوضع الداكن (Dark Mode)</p>
                  <p className="text-xs text-stone-500">تفعيل المظهر الليلي للمنصة</p>
                </div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-emerald-600' : 'bg-stone-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? '-translate-x-6' : '-translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-50 flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  saved ? <Check className="ml-2 h-4 w-4" /> : <Save className="ml-2 h-4 w-4" />
                )}
                {saved ? 'تم الحفظ' : 'حفظ الإعدادات'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100 space-y-6">
            <h3 className="text-lg font-bold text-stone-900 border-b border-stone-50 pb-4">تخصيص الألوان</h3>
            <div className="grid grid-cols-4 gap-4">
              {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#141414'].map(color => (
                <button
                  key={color}
                  onClick={() => setPrimaryColor(color)}
                  className={`h-12 rounded-xl border-2 transition-all ${primaryColor === color ? 'border-stone-900 scale-110 shadow-md' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
