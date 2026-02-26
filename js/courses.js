// ============================================
// دوال إدارة الدورات
// ============================================
const coursesAPI = {
    // إنشاء دورة جديدة
    async create(courseData) {
        const user = await auth.getCurrentUser();
        if (!user) throw new Error('يجب تسجيل الدخول أولاً');
        
        const { data, error } = await supabase
            .from('courses')
            .insert([{
                teacher_id: user.id,
                ...courseData,
                thumbnail_url: `https://img.youtube.com/vi/${courseData.youtube_video_id}/0.jpg`
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // جلب دورات المعلم الحالي
    async getMyCourses() {
        const user = await auth.getCurrentUser();
        if (!user) throw new Error('يجب تسجيل الدخول أولاً');
        
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('teacher_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    // جلب جميع الدورات المنشورة (للطلاب)
    async getPublishedCourses() {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    // جلب دورة محددة مع تفاعلاتها
    async getCourseWithInteractions(courseId) {
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();
        if (courseError) throw courseError;

        const { data: interactions, error: intError } = await supabase
            .from('interactions')
            .select('*')
            .eq('course_id', courseId)
            .order('time_seconds', { ascending: true });
        if (intError) throw intError;

        return { ...course, interactions };
    },

    // تحديث الدورة
    async update(courseId, updates) {
        const { data, error } = await supabase
            .from('courses')
            .update(updates)
            .eq('id', courseId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // حذف الدورة
    async delete(courseId) {
        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', courseId);
        if (error) throw error;
        return true;
    }
};

window.coursesAPI = coursesAPI;