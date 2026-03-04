import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Course } from '../types';
import { Plus, Play, Clock, Users, BookOpen, Loader2, Share2, Check, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [profile]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredCourses(courses.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setFilteredCourses(courses);
    }
  }, [searchQuery, courses]);

  const handleCopyLink = (courseId: string) => {
    const url = `${window.location.origin}/course/play/${courseId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(courseId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchCourses = async () => {
    try {
      let query = supabase.from('courses').select('*');
      
      if (profile?.role === 'teacher') {
        query = query.eq('teacher_id', profile.id);
      } else {
        // For students, show public courses or enrolled courses
        // For now, just show all public courses
        query = query.eq('is_public', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
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
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">أهلاً بك، {profile?.full_name}</h1>
          <p className="text-stone-500">إليك نظرة سريعة على دروسك الحالية</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-stone-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث عن درس..."
              className="block w-64 pr-10 rounded-xl border border-stone-200 bg-white py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          {profile?.role === 'teacher' && (
            <Link
              to="/course/new"
              className="flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all"
            >
              <Plus className="ml-2 h-5 w-5" />
              درس جديد
            </Link>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCourses.map((course) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group overflow-hidden rounded-2xl bg-white shadow-sm border border-stone-100 transition-all hover:shadow-md"
          >
            <div className="relative aspect-video overflow-hidden bg-stone-100">
              {course.thumbnail_url ? (
                <img 
                  src={course.thumbnail_url} 
                  alt={course.title} 
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
                  to={`/course/play/${course.id}`}
                  className="rounded-full bg-white/90 p-3 text-emerald-600 shadow-lg hover:bg-white"
                >
                  <Play className="h-6 w-6 fill-current" />
                </Link>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between">
                <h3 className="mb-1 line-clamp-1 font-bold text-stone-900 flex-1">{course.title}</h3>
                <button 
                  onClick={() => handleCopyLink(course.id)}
                  className="mr-2 text-stone-400 hover:text-emerald-600 transition-all"
                  title="مشاركة الرابط"
                >
                  {copiedId === course.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
                </button>
              </div>
              <p className="mb-4 line-clamp-2 text-xs text-stone-500">{course.description}</p>
              
              <div className="flex items-center justify-between border-t border-stone-50 pt-3">
                <div className="flex items-center text-xs text-stone-400">
                  <Clock className="ml-1 h-3 w-3" />
                  <span>{new Date(course.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
                {profile?.role === 'teacher' ? (
                  <Link 
                    to={`/course/edit/${course.id}`}
                    className="text-xs font-medium text-emerald-600 hover:underline"
                  >
                    تعديل الدرس
                  </Link>
                ) : (
                  <div className="flex items-center text-xs text-emerald-600 font-medium">
                    <BookOpen className="ml-1 h-3 w-3" />
                    <span>ابدأ التعلم</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-stone-100 p-6">
              <BookOpen className="h-12 w-12 text-stone-300" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900">لا توجد دروس حالياً</h3>
            <p className="text-stone-500">ابدأ بإنشاء أول درس تفاعلي لك الآن</p>
            {profile?.role === 'teacher' && (
              <Link
                to="/course/new"
                className="mt-6 rounded-xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                إنشاء درس
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
