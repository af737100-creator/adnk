import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Course, StudentResponse } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Loader2, Users, CheckCircle, Award, TrendingUp } from 'lucide-react';

export default function Reports() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (profile) fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    try {
      // Fetch courses count
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', profile?.id);

      // Fetch responses
      const { data: responses } = await supabase
        .from('student_responses')
        .select(`
          *,
          interaction:interactions(course_id)
        `);

      // Filter responses for this teacher's courses
      // (In a real app, this would be a more complex SQL join)
      
      // Mocking some data for the demo since we don't have real data yet
      const mockData = {
        totalStudents: 124,
        completionRate: 78,
        avgScore: 85,
        coursesCount: coursesCount || 0,
        performanceData: [
          { name: 'الدرس 1', score: 85 },
          { name: 'الدرس 2', score: 72 },
          { name: 'الدرس 3', score: 90 },
          { name: 'الدرس 4', score: 65 },
        ],
        interactionData: [
          { name: 'صحيح', value: 400 },
          { name: 'خطأ', value: 120 },
        ]
      };

      setStats(mockData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#ef4444'];

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
        <h1 className="text-2xl font-bold text-stone-900">تقارير الأداء</h1>
        <p className="text-stone-500">تحليل شامل لتفاعل الطلاب مع دروسك</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'إجمالي الطلاب', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'نسبة الإكمال', value: `${stats.completionRate}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'متوسط الدرجات', value: `${stats.avgScore}%`, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'عدد الدروس', value: stats.coursesCount, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-stone-900">{item.value}</p>
              </div>
              <div className={`rounded-xl ${item.bg} p-3 ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100">
          <h3 className="mb-6 text-sm font-bold text-stone-900">أداء الطلاب حسب الدرس</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100">
          <h3 className="mb-6 text-sm font-bold text-stone-900">توزيع الإجابات</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.interactionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.interactionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center space-x-6 space-x-reverse">
            {stats.interactionData.map((entry: any, index: number) => (
              <div key={index} className="flex items-center">
                <div className="ml-2 h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-xs text-stone-500">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
