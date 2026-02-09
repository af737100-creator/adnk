// تهيئة Supabase Client
const SUPABASE_URL = 'https://aohehiaqfqagoqyuhrmm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eq_PjuSiAbWvxNAD6QHThw_v_x-jVSI';

// إنشاء عميل Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// وظائف المصادقة
async function signUp(email, password, name) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name,
                    role: 'teacher'
                }
            }
        });
        
        if (error) throw error;
        
        // إضافة المستخدم إلى جدول المستخدمين
        if (data.user) {
            const { error: profileError } = await supabaseClient
                .from('users')
                .insert([
                    {
                        id: data.user.id,
                        email: data.user.email,
                        full_name: name,
                        role: 'teacher',
                        created_at: new Date().toISOString()
                    }
                ]);
            
            if (profileError) throw profileError;
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('خطأ في التسجيل:', error.message);
        return { success: false, error: error.message };
    }
}

async function signIn(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error.message);
        return { success: false, error: error.message };
    }
}

async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        
        return { success: true };
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error.message);
        return { success: false, error: error.message };
    }
}

// الحصول على المستخدم الحالي
function getCurrentUser() {
    return supabaseClient.auth.getUser();
}

// الاستماع لتغيرات حالة المصادقة
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('حالة المصادقة تغيرت:', event, session);
    
    if (event === 'SIGNED_IN') {
        // توجيه المستخدم إلى لوحة التحكم
        window.location.href = 'pages/dashboard.html';
    } else if (event === 'SIGNED_OUT') {
        // توجيه المستخدم إلى الصفحة الرئيسية
        window.location.href = '../index.html';
    }
});

// وظائف إدارة الدورات
async function createCourse(courseData) {
    try {
        const { data, error } = await supabaseClient
            .from('courses')
            .insert([courseData])
            .select();
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('خطأ في إنشاء الدورة:', error.message);
        return { success: false, error: error.message };
    }
}

async function getCourses(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('courses')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('خطأ في جلب الدورات:', error.message);
        return { success: false, error: error.message };
    }
}

async function updateCourse(courseId, courseData) {
    try {
        const { data, error } = await supabaseClient
            .from('courses')
            .update(courseData)
            .eq('id', courseId)
            .select();
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('خطأ في تحديث الدورة:', error.message);
        return { success: false, error: error.message };
    }
}

async function deleteCourse(courseId) {
    try {
        const { error } = await supabaseClient
            .from('courses')
            .delete()
            .eq('id', courseId);
        
        if (error) throw error;
        
        return { success: true };
    } catch (error) {
        console.error('خطأ في حذف الدورة:', error.message);
        return { success: false, error: error.message };
    }
}

// وظائف إدارة التفاعلات
async function createInteraction(interactionData) {
    try {
        const { data, error } = await supabaseClient
            .from('interactions')
            .insert([interactionData])
            .select();
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('خطأ في إنشاء التفاعل:', error.message);
        return { success: false, error: error.message };
    }
}

async function getInteractions(courseId) {
    try {
        const { data, error } = await supabaseClient
            .from('interactions')
            .select('*')
            .eq('course_id', courseId)
            .order('time', { ascending: true });
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('خطأ في جلب التفاعلات:', error.message);
        return { success: false, error: error.message };
    }
}

// وظائف إدارة الطلاب
async function getCourseStudents(courseId) {
    try {
        const { data, error } = await supabaseClient
            .from('enrollments')
            .select(`
                *,
                students:student_id (*)
            `)
            .eq('course_id', courseId);
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('خطأ في جلب الطلاب:', error.message);
        return { success: false, error: error.message };
    }
}

async function recordStudentResponse(responseData) {
    try {
        const { data, error } = await supabaseClient
            .from('student_responses')
            .insert([responseData])
            .select();
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('خطأ في تسجيل إجابة الطالب:', error.message);
        return { success: false, error: error.message };
    }
}

// وظائف إدارة الغرف التفاعلية
async function createClassroomSession(sessionData) {
    try {
        const { data, error } = await supabaseClient
            .from('classroom_sessions')
            .insert([sessionData])
            .select();
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('خطأ في إنشاء جلسة الصف:', error.message);
        return { success: false, error: error.message };
    }
}

async function joinClassroomSession(sessionCode, studentId) {
    try {
        // البحث عن الجلسة باستخدام الكود
        const { data: session, error: sessionError } = await supabaseClient
            .from('classroom_sessions')
            .select('*')
            .eq('session_code', sessionCode)
            .single();
        
        if (sessionError) throw sessionError;
        
        // تسجيل الطالب في الجلسة
        const { data, error } = await supabaseClient
            .from('session_participants')
            .insert([{
                session_id: session.id,
                student_id: studentId,
                joined_at: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        
        return { success: true, data: { session, participant: data } };
    } catch (error) {
        console.error('خطأ في الانضمام للجلسة:', error.message);
        return { success: false, error: error.message };
    }
}

// وظائف الدردشة في الوقت الحقيقي
function setupRealtimeChat(sessionId) {
    // الاشتراك في تحديثات الدردشة
    const chatSubscription = supabaseClient
        .channel(`chat:${sessionId}`)
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'chat_messages',
                filter: `session_id=eq.${sessionId}`
            }, 
            (payload) => {
                // معالجة الرسالة الجديدة
                console.log('رسالة جديدة:', payload.new);
                // إضافة الرسالة إلى الواجهة
                addMessageToChat(payload.new.sender_name, payload.new.message, payload.new.sender_id === getCurrentUserId());
            }
        )
        .subscribe();
    
    return chatSubscription;
}

async function sendChatMessage(sessionId, senderId, message) {
    try {
        // الحصول على اسم المرسل
        const { data: userData } = await supabaseClient
            .from('users')
            .select('full_name')
            .eq('id', senderId)
            .single();
        
        const { data, error } = await supabaseClient
            .from('chat_messages')
            .insert([{
                session_id: sessionId,
                sender_id: senderId,
                sender_name: userData?.full_name || 'مجهول',
                message: message,
                sent_at: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('خطأ في إرسال الرسالة:', error.message);
        return { success: false, error: error.message };
    }
}

// وظائف السبورة التفاعلية
async function saveWhiteboardData(sessionId, whiteboardData) {
    try {
        const { data, error } = await supabaseClient
            .from('whiteboard_snapshots')
            .insert([{
                session_id: sessionId,
                data: whiteboardData,
                saved_at: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('خطأ في حفظ السبورة:', error.message);
        return { success: false, error: error.message };
    }
}

function setupRealtimeWhiteboard(sessionId) {
    // الاشتراك في تحديثات السبورة
    const whiteboardSubscription = supabaseClient
        .channel(`whiteboard:${sessionId}`)
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'whiteboard_snapshots',
                filter: `session_id=eq.${sessionId}`
            }, 
            (payload) => {
                // تحديث السبورة بالبيانات الجديدة
                console.log('تحديث السبورة:', payload.new);
                // عرض البيانات على السبورة
                loadWhiteboardData(payload.new.data);
            }
        )
        .subscribe();
    
    return whiteboardSubscription;
}

// وظائف مساعدة
function getCurrentUserId() {
    const user = supabaseClient.auth.getUser();
    return user?.id;
}

// تصدير الوظائف
window.supabaseClient = supabaseClient;
window.authFunctions = {
    signUp,
    signIn,
    signOut,
    getCurrentUser
};
window.courseFunctions = {
    createCourse,
    getCourses,
    updateCourse,
    deleteCourse
};
window.interactionFunctions = {
    createInteraction,
    getInteractions
};
window.classroomFunctions = {
    createClassroomSession,
    joinClassroomSession,
    setupRealtimeChat,
    sendChatMessage,
    saveWhiteboardData,
    setupRealtimeWhiteboard
};