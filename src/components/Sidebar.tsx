import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  BookOpen, 
  BarChart2,
  Settings, 
  LogOut, 
  User as UserIcon,
  ChevronRight,
  Bell
} from 'lucide-react';
import { Profile } from '../types';
import { supabase } from '../lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  profile: Profile | null;
}

export default function Sidebar({ profile }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { name: 'لوحة التحكم', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'دروسي', icon: BookOpen, path: '/my-courses' },
    { name: 'الملف الشخصي', icon: UserIcon, path: '/profile' },
  ];

  if (profile?.role === 'teacher') {
    menuItems.push({ name: 'إنشاء درس جديد', icon: PlusCircle, path: '/course/new' });
    menuItems.push({ name: 'التقارير', icon: BarChart2, path: '/reports' });
    menuItems.push({ name: 'الإعدادات', icon: Settings, path: '/settings' });
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-50 hidden w-64 flex-col border-l border-stone-200 bg-white md:flex">
      <div className="flex h-20 items-center justify-between border-b border-stone-100 px-6">
        <h1 className="text-2xl font-bold text-emerald-700">تعليمي</h1>
        <button className="relative rounded-full p-2 text-stone-400 hover:bg-stone-50 hover:text-emerald-600 transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 left-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all group",
                location.pathname === item.path
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              )}
            >
              <item.icon className={cn(
                "ml-3 h-5 w-5",
                location.pathname === item.path ? "text-emerald-600" : "text-stone-400 group-hover:text-stone-600"
              )} />
              {item.name}
              {location.pathname === item.path && <ChevronRight className="mr-auto h-4 w-4" />}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-stone-100 p-4">
        <div className="mb-4 flex items-center px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            {profile?.full_name?.charAt(0) || <UserIcon className="h-5 w-5" />}
          </div>
          <div className="mr-3 overflow-hidden">
            <p className="truncate text-sm font-semibold text-stone-900">{profile?.full_name || 'مستخدم'}</p>
            <p className="truncate text-xs text-stone-500">{profile?.role === 'teacher' ? 'معلم' : 'طالب'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="ml-3 h-5 w-5" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
