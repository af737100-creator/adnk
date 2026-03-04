import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Course } from '../types';
import { Play, Clock, BookOpen, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function MyCourses() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchEnrolledCourses();
  }, [user]);

  const fetchEnrolledCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('student_id', user?.id);

      if (error) throw error;
      setEnrolledCourses(data || []);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">دروسي المستمرة</h1>
        <p className="text-stone-500">تابع رحلتك التعليمية من حيث توقفت</p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {enrolledCourses.map((enrollment) => (
          <motion.div
            key={enrollment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group overflow-hidden rounded-2xl bg-white shadow-sm border border-stone-100 transition-all hover:shadow-md"
          >
            <div className="relative aspect-video overflow-hidden bg-stone-100">
              {enrollment.course.thumbnail_url ? (
                <img 
                  src={enrollment.course.thumbnail_url} 
                  alt={enrollment.course.title} 
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Play className="h-12 w-12 text-stone-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                <Link
                  to={`/course/play/${enrollment.course.id}`}
                  className="rounded-full bg-white/90 p-3 text-emerald-600 shadow-lg hover:bg-white"
                >
                  <Play className="h-6 w-6 fill-current" />
                </Link>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="mb-1 line-clamp-1 font-bold text-stone-900">{enrollment.course.title}</h3>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-stone-500">
                  <span>التقدم</span>
                  <span>{Math.floor((enrollment.progress_seconds / 3600) * 100) || 0}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-stone-100">
                  <div 
                    className="h-full rounded-full bg-emerald-600 transition-all"
                    style={{ width: `${Math.min(100, (enrollment.progress_seconds / 3600) * 100)}%` }}
                  />
                </div>
              </div>

              <Link
                to={`/course/play/${enrollment.course.id}`}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-stone-50 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-all"
              >
                متابعة التعلم
                <ArrowLeft className="mr-2 h-3 w-3" />
              </Link>
            </div>
          </motion.div>
        ))}

        {enrolledCourses.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-stone-100 p-6">
              <BookOpen className="h-12 w-12 text-stone-300" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900">لم تبدأ أي دروس بعد</h3>
            <p className="text-stone-500">استكشف الدروس المتاحة في لوحة التحكم وابدأ التعلم</p>
            <Link
              to="/dashboard"
              className="mt-6 rounded-xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              استكشاف الدروس
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
