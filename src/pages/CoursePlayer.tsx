import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  HelpCircle,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  List
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Interaction, Course } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const Player = ReactPlayer as any;

export default function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const playerRef = useRef<any>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeInteraction, setActiveInteraction] = useState<Interaction | null>(null);
  const [answeredInteractions, setAnsweredInteractions] = useState<Set<string>>(new Set());
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const [activeTab, setActiveTab] = useState<'interactions' | 'discussion' | 'resources'>('interactions');

  useEffect(() => {
    fetchCourseData();
    // Load saved progress if exists
    loadProgress();
  }, [id]);

  const loadProgress = async () => {
    if (!user || !id) return;
    const { data } = await supabase
      .from('enrollments')
      .select('progress_seconds')
      .eq('student_id', user.id)
      .eq('course_id', id)
      .single();
    
    if (data?.progress_seconds) {
      playerRef.current?.seekTo(data.progress_seconds);
    }
  };

  const saveProgress = async (seconds: number) => {
    if (!user || !id) return;
    // Debounce progress saving to every 5 seconds
    if (Math.floor(seconds) % 5 === 0) {
      await supabase.from('enrollments').upsert({
        student_id: user.id,
        course_id: id,
        progress_seconds: Math.floor(seconds),
        last_watched_at: new Date().toISOString()
      }, { onConflict: 'student_id,course_id' });
    }
  };

  const fetchCourseData = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

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

  const handleProgress = (state: any) => {
    setCurrentTime(state.playedSeconds);
    saveProgress(state.playedSeconds);
    
    // Check for interactions
    const interaction = interactions.find(i => 
      Math.floor(i.timestamp) === Math.floor(state.playedSeconds) && 
      !answeredInteractions.has(i.id)
    );

    if (interaction) {
      setPlaying(false);
      setActiveInteraction(interaction);
    }
  };

  const handleSubmitResponse = async () => {
    if (!activeInteraction) return;

    if (activeInteraction.type === 'question') {
      if (selectedOption === null) return;
      
      const isCorrect = selectedOption === activeInteraction.content.correctAnswer;
      setFeedback(isCorrect ? 'correct' : 'incorrect');

      // Save response to Supabase
      await supabase.from('student_responses').insert({
        student_id: user?.id,
        interaction_id: activeInteraction.id,
        response: { selectedOption },
        is_correct: isCorrect
      });

      setTimeout(() => {
        setAnsweredInteractions(prev => new Set([...prev, activeInteraction.id]));
        setActiveInteraction(null);
        setFeedback(null);
        setSelectedOption(null);
        setPlaying(true);
      }, 2000);
    } else {
      // For notes, just continue
      setAnsweredInteractions(prev => new Set([...prev, activeInteraction.id]));
      setActiveInteraction(null);
      setPlaying(true);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!course) return <div>Course not found</div>;

  return (
    <div className="flex h-screen flex-col bg-stone-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex h-16 items-center justify-between px-6 bg-stone-900/50 backdrop-blur-md">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="ml-4 text-stone-400 hover:text-white">
            <ChevronRight className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-sm font-bold">{course.title}</h1>
            <p className="text-[10px] text-stone-400">مشاهدة الدرس التفاعلي</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex items-center text-xs text-stone-400">
            <List className="ml-2 h-4 w-4" />
            <span>{answeredInteractions.size} / {interactions.length} تفاعل</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Video & Interaction */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
          <div className="w-full h-full max-w-5xl aspect-video relative">
            <Player
              ref={playerRef}
              url={course.video_url}
              width="100%"
              height="100%"
              playing={playing}
              playbackRate={playbackRate}
              onProgress={handleProgress}
              controls={!activeInteraction}
            />

            {/* Interaction Overlay */}
            <AnimatePresence>
              {activeInteraction && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
                >
                  <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-stone-900 shadow-2xl">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        {activeInteraction.type === 'question' ? (
                          <><HelpCircle className="ml-1 h-3 w-3" /> سؤال</>
                        ) : (
                          <><FileText className="ml-1 h-3 w-3" /> ملاحظة</>
                        )}
                      </div>
                      <div className="text-xs text-stone-400">
                        ثانية {activeInteraction.timestamp}
                      </div>
                    </div>

                    <h2 className="mb-6 text-xl font-bold leading-tight">
                      {activeInteraction.type === 'question' 
                        ? activeInteraction.content.question 
                        : 'ملاحظة تعليمية'}
                    </h2>

                    {activeInteraction.type === 'question' ? (
                      <div className="space-y-3">
                        {activeInteraction.content.options.map((opt: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => !feedback && setSelectedOption(idx)}
                            className={`w-full rounded-xl border-2 p-4 text-right text-sm font-medium transition-all ${
                              selectedOption === idx 
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                : 'border-stone-100 hover:border-stone-200'
                            } ${
                              feedback === 'correct' && idx === activeInteraction.content.correctAnswer
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : feedback === 'incorrect' && selectedOption === idx
                                ? 'border-red-500 bg-red-500 text-white'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{opt}</span>
                              {feedback === 'correct' && idx === activeInteraction.content.correctAnswer && <CheckCircle2 className="h-5 w-5" />}
                              {feedback === 'incorrect' && selectedOption === idx && <XCircle className="h-5 w-5" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="prose prose-stone mb-8">
                        <p className="text-stone-600 leading-relaxed">{activeInteraction.content.text}</p>
                      </div>
                    )}

                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={handleSubmitResponse}
                        disabled={activeInteraction.type === 'question' && selectedOption === null}
                        className="rounded-xl bg-emerald-600 px-8 py-3 font-bold text-white shadow-lg hover:bg-emerald-700 disabled:opacity-50 transition-all"
                      >
                        {activeInteraction.type === 'question' ? 'تأكيد الإجابة' : 'متابعة الفيديو'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Tabs */}
        <div className="w-96 bg-stone-900 border-r border-stone-800 flex flex-col">
          <div className="flex border-b border-stone-800">
            {[
              { id: 'interactions', name: 'التفاعلات', icon: List },
              { id: 'discussion', name: 'النقاش', icon: HelpCircle },
              { id: 'resources', name: 'المصادر', icon: FileText },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 text-xs font-bold transition-all border-b-2 ${
                  activeTab === tab.id ? 'border-emerald-600 text-white' : 'border-transparent text-stone-500 hover:text-stone-300'
                }`}
              >
                <tab.icon className="mx-auto mb-1 h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'interactions' && (
              <div className="space-y-4">
                {interactions.map(i => (
                  <button
                    key={i.id}
                    onClick={() => {
                      playerRef.current?.seekTo(i.timestamp);
                      setPlaying(true);
                    }}
                    className={`w-full text-right p-3 rounded-xl border transition-all ${
                      answeredInteractions.has(i.id) 
                        ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-400' 
                        : 'bg-stone-800/50 border-stone-700 text-stone-300 hover:border-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono opacity-60">
                        {Math.floor(i.timestamp / 60)}:{(i.timestamp % 60).toFixed(0).padStart(2, '0')}
                      </span>
                      {answeredInteractions.has(i.id) && <CheckCircle2 className="h-3 w-3" />}
                    </div>
                    <p className="text-xs font-medium line-clamp-2">
                      {i.type === 'question' ? i.content.question : 'ملاحظة تعليمية'}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'discussion' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-4">
                  <div className="bg-stone-800/50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-emerald-500 mb-1">أحمد محمد</p>
                    <p className="text-xs text-stone-300">هل يمكن شرح هذه النقطة مرة أخرى؟</p>
                  </div>
                </div>
                <div className="mt-4">
                  <input 
                    type="text" 
                    placeholder="اكتب سؤالك هنا..."
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2 text-xs text-white focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-3">
                <div className="flex items-center p-3 rounded-xl bg-stone-800/50 border border-stone-700 hover:bg-stone-800 transition-all cursor-pointer">
                  <FileText className="ml-3 h-5 w-5 text-blue-400" />
                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-200">ملخص الدرس.pdf</p>
                    <p className="text-[10px] text-stone-500">2.4 MB</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <footer className="h-20 bg-stone-900 border-t border-stone-800 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="relative">
            <button 
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="flex items-center text-xs font-bold text-stone-400 hover:text-white transition-all"
            >
              {playbackRate}x
            </button>
            <AnimatePresence>
              {showSpeedMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full mb-2 left-0 w-20 rounded-xl bg-stone-800 border border-stone-700 p-1 shadow-xl z-50"
                >
                  {[0.5, 1, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => {
                        setPlaybackRate(speed);
                        setShowSpeedMenu(false);
                      }}
                      className={`w-full rounded-lg px-2 py-1.5 text-xs font-bold transition-all ${
                        playbackRate === speed ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:bg-stone-700'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={() => setPlaying(!playing)}
            className="p-2 rounded-full hover:bg-stone-800 text-white"
          >
            {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
          </button>
          <div className="text-xs font-mono text-stone-400">
            {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}
          </div>
        </div>

        <div className="flex-1 mx-8 relative h-1 bg-stone-800 rounded-full">
          {/* Interaction Markers */}
          {interactions.map(i => (
            <div 
              key={i.id}
              className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full z-10 ${
                answeredInteractions.has(i.id) ? 'bg-emerald-500' : 'bg-stone-500'
              }`}
              style={{ left: `${(i.timestamp / (playerRef.current?.getDuration() || 1)) * 100}%` }}
              title={i.type}
            />
          ))}
          <div 
            className="absolute inset-y-0 left-0 bg-emerald-600 rounded-full"
            style={{ width: `${(currentTime / (playerRef.current?.getDuration() || 1)) * 100}%` }}
          />
        </div>

        <div className="flex items-center">
          <button className="p-2 rounded-full hover:bg-stone-800 text-stone-400">
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
