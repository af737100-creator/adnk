// ============================================
// دوال التفاعلات
// ============================================
const interactionsAPI = {
    // إضافة تفاعل جديد
    async add(interactionData) {
        const { data, error } = await supabase
            .from('interactions')
            .insert([interactionData])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // جلب تفاعلات دورة معينة
    async getByCourse(courseId) {
        const { data, error } = await supabase
            .from('interactions')
            .select('*')
            .eq('course_id', courseId)
            .order('time_seconds', { ascending: true });
        if (error) throw error;
        return data;
    },

    // حذف تفاعل
    async delete(id) {
        const { error } = await supabase
            .from('interactions')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    // تسجيل إجابة طالب
    async saveResponse(interactionId, answer, isCorrect) {
        const user = await auth.getCurrentUser();
        if (!user) throw new Error('يجب تسجيل الدخول أولاً');

        const { data, error } = await supabase
            .from('student_responses')
            .insert([{
                interaction_id: interactionId,
                student_id: user.id,
                answer,
                is_correct: isCorrect
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // الحصول على إجابات طالب لدورة معينة
    async getMyResponses(courseId) {
        const user = await auth.getCurrentUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('student_responses')
            .select(`
                *,
                interactions!inner(course_id)
            `)
            .eq('student_id', user.id)
            .eq('interactions.course_id', courseId);
        if (error) throw error;
        return data;
    }
};

window.interactionsAPI = interactionsAPI;