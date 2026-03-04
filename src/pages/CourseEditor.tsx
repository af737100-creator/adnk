import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { 
  Save, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause,
  Clock,
  Type,
  HelpCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Interaction, Course } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const Player = ReactPlayer as any;

export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const playerRef = useRef<any>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [interactions, setInteractions] = useState<Partial<Interaction>[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;

      setTitle(course.title);
      setDescription(course.description || '');
      setVideoUrl(course.video_url);

      const { data: interactionData, error: interactionError } = await supabase
        .from('interactions')
        .select('*')
        .eq('course_id', id)
        .order('timestamp', { ascending: true });

      if (interactionError) throw interactionError;
      setInteractions(interactionData || []);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInteraction = (type: 'question' | 'note') => {
    const newInteraction: Partial<Interaction> = {
      type,
      timestamp: Math.floor(currentTime),
      content: type === 'question' 
        ? { question: '', options: ['', ''], correctAnswer: 0 }
        : { text: '' }
    };
    setInteractions([...interactions, newInteraction].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)));
  };

  const handleSave = async () => {
    if (!title || !videoUrl) {
      alert('يرجى إدخال العنوان ورابط الفيديو');
      return;
    }

    setSaving(true);
    try {
      const courseData = {
        title,
        description,
        video_url: videoUrl,
        teacher_id: user?.id,
        thumbnail_url: `https://img.youtube.com/vi/${getYoutubeId(videoUrl)}/mqdefault.jpg`,
        is_public: true
      };

      let courseId = id;

      if (id) {
        const { error } = await supabase.from('courses').update(courseData).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('courses').insert(courseData).select().single();
        if (error) throw error;
        courseId = data.id;
      }

      // Handle interactions
      // Simplest way: delete all and re-insert for now
      if (id) {
        await supabase.from('interactions').delete().eq('course_id', id);
      }

      if (interactions.length > 0) {
        const interactionsToInsert = interactions.map(i => ({
          course_id: courseId,
          type: i.type,
          timestamp: i.timestamp,
          content: i.content
        }));
        const { error } = await supabase.from('interactions').insert(interactionsToInsert);
        if (error) throw error;
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving course:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-stone-50">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-6">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="ml-4 text-stone-400 hover:text-stone-600">
            <ChevronRight className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-stone-900">{id ? 'تعديل الدرس' : 'إنشاء درس جديد'}</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center rounded-xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
          حفظ الدرس
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Course Info */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-stone-700">عنوان الدرس</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="مثال: مقدمة في علم الأحياء"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700">رابط يوتيوب</label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-stone-700">وصف الدرس</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="اكتب وصفاً قصيراً للدرس..."
                />
              </div>
            </div>

            {/* Video Preview & Timeline */}
            {videoUrl && (
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                  <Player
                    ref={playerRef}
                    url={videoUrl}
                    width="100%"
                    height="100%"
                    playing={playing}
                    onProgress={(p: any) => setCurrentTime(p.playedSeconds)}
                    controls
                  />
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <button
                      onClick={() => handleAddInteraction('question')}
                      className="flex items-center rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      <HelpCircle className="ml-2 h-4 w-4" />
                      إضافة سؤال
                    </button>
                    <button
                      onClick={() => handleAddInteraction('note')}
                      className="flex items-center rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                    >
                      <FileText className="ml-2 h-4 w-4" />
                      إضافة ملاحظة
                    </button>
                  </div>
                  <div className="text-sm font-mono text-stone-500">
                    {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Interactions List */}
        <div className="w-80 border-r border-stone-200 bg-white overflow-y-auto p-4">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-400">التفاعلات المضافة</h2>
          <div className="space-y-3">
            {interactions.map((interaction, index) => (
              <div 
                key={index}
                className="group rounded-xl border border-stone-100 bg-stone-50 p-3 transition-all hover:border-emerald-200"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center text-xs font-medium text-stone-500">
                    <Clock className="ml-1 h-3 w-3" />
                    {Math.floor((interaction.timestamp || 0) / 60)}:{((interaction.timestamp || 0) % 60).toFixed(0).padStart(2, '0')}
                  </div>
                  <button 
                    onClick={() => setInteractions(interactions.filter((_, i) => i !== index))}
                    className="text-stone-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                {interaction.type === 'question' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={interaction.content.question}
                      onChange={(e) => {
                        const newInteractions = [...interactions];
                        newInteractions[index].content.question = e.target.value;
                        setInteractions(newInteractions);
                      }}
                      className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="اكتب السؤال هنا..."
                    />
                    {interaction.content.options.map((opt: string, optIdx: number) => (
                      <div key={optIdx} className="flex items-center">
                        <input
                          type="radio"
                          checked={interaction.content.correctAnswer === optIdx}
                          onChange={() => {
                            const newInteractions = [...interactions];
                            newInteractions[index].content.correctAnswer = optIdx;
                            setInteractions(newInteractions);
                          }}
                          className="ml-2 text-emerald-600 focus:ring-emerald-500"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newInteractions = [...interactions];
                            newInteractions[index].content.options[optIdx] = e.target.value;
                            setInteractions(newInteractions);
                          }}
                          className="flex-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none"
                          placeholder={`خيار ${optIdx + 1}`}
                        />
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newInteractions = [...interactions];
                        newInteractions[index].content.options.push('');
                        setInteractions(newInteractions);
                      }}
                      className="text-[10px] font-bold text-emerald-600 hover:underline"
                    >
                      + إضافة خيار
                    </button>
                  </div>
                ) : (
                  <textarea
                    value={interaction.content.text}
                    onChange={(e) => {
                      const newInteractions = [...interactions];
                      newInteractions[index].content.text = e.target.value;
                      setInteractions(newInteractions);
                    }}
                    rows={3}
                    className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="اكتب الملاحظة هنا..."
                  />
                )}
              </div>
            ))}
            
            {interactions.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-xs text-stone-400">لم يتم إضافة تفاعلات بعد</p>
                <p className="mt-1 text-[10px] text-stone-400">استخدم الأزرار لإضافة أسئلة أو ملاحظات عند نقاط زمنية محددة</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
