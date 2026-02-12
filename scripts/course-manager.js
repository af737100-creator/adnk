/**
 * ============================================
 * COURSE-MANAGER.JS - إدارة الدورات التعليمية
 * تعليمي - منصة التعلم التفاعلي
 * الإصدار: 1.0.0
 * ============================================
 */

class CourseManager {
    constructor() {
        this.currentCourse = null;
        this.courses = [];
        this.interactions = [];
        this.initialized = false;
        this.init();
    }

    /**
     * تهيئة مدير الدورات
     */
    async init() {
        try {
            await this.loadCourses();
            this.initialized = true;
            console.log('✅ CourseManager initialized successfully');
        } catch (error) {
            console.error('❌ CourseManager initialization error:', error);
        }
    }

    /**
     * تحميل جميع الدورات للمستخدم الحالي
     */
    async loadCourses() {
        try {
            const user = auth.getCurrentUser();
            if (!user) return [];
            
            const { data, error } = await supabase.client
                .from('courses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            this.courses = data || [];
            return this.courses;
            
        } catch (error) {
            console.error('Load courses error:', error);
            return [];
        }
    }

    /**
     * إنشاء دورة جديدة
     */
    async createCourse(courseData) {
        try {
            const user = auth.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }
            
            // إنشاء slug فريد
            const slug = this.generateSlug(courseData.title);
            
            const course = {
                ...courseData,
                user_id: user.id,
                slug: slug,
                status: 'draft',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await supabase.client
                .from('courses')
                .insert([course])
                .select()
                .single();
            
            if (error) throw error;
            
            this.courses.unshift(data);
            
            this.showNotification('✅ تم إنشاء الدورة بنجاح', 'success');
            return { success: true, data };
            
        } catch (error) {
            console.error('Create course error:', error);
            this.showNotification('❌ فشل إنشاء الدورة', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * الحصول على دورة بواسطة المعرف
     */
    async getCourse(courseId) {
        try {
            const { data, error } = await supabase.client
                .from('courses')
                .select(`
                    *,
                    interactions (*),
                    enrollments (
                        *,
                        users (*)
                    ),
                    course_ratings (*)
                `)
                .eq('id', courseId)
                .single();
            
            if (error) throw error;
            
            this.currentCourse = data;
            return { success: true, data };
            
        } catch (error) {
            console.error('Get course error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * تحديث الدورة
     */
    async updateCourse(courseId, courseData) {
        try {
            const updateData = {
                ...courseData,
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await supabase.client
                .from('courses')
                .update(updateData)
                .eq('id', courseId)
                .select()
                .single();
            
            if (error) throw error;
            
            // تحديث في الذاكرة
            const index = this.courses.findIndex(c => c.id === courseId);
            if (index !== -1) {
                this.courses[index] = data;
            }
            
            this.showNotification('✅ تم تحديث الدورة بنجاح', 'success');
            return { success: true, data };
            
        } catch (error) {
            console.error('Update course error:', error);
            this.showNotification('❌ فشل تحديث الدورة', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * حذف الدورة
     */
    async deleteCourse(courseId) {
        try {
            const { error } = await supabase.client
                .from('courses')
                .delete()
                .eq('id', courseId);
            
            if (error) throw error;
            
            // إزالة من الذاكرة
            this.courses = this.courses.filter(c => c.id !== courseId);
            
            this.showNotification('✅ تم حذف الدورة بنجاح', 'success');
            return { success: true };
            
        } catch (error) {
            console.error('Delete course error:', error);
            this.showNotification('❌ فشل حذف الدورة', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * نشر الدورة
     */
    async publishCourse(courseId) {
        return this.updateCourse(courseId, {
            status: 'published',
            published_at: new Date().toISOString()
        });
    }

    /**
     * إلغاء نشر الدورة
     */
    async unpublishCourse(courseId) {
        return this.updateCourse(courseId, {
            status: 'draft',
            published_at: null
        });
    }

    /**
     * أرشفة الدورة
     */
    async archiveCourse(courseId) {
        return this.updateCourse(courseId, {
            status: 'archived'
        });
    }

    /**
     * إنشاء تفاعل جديد
     */
    async createInteraction(interactionData) {
        try {
            const user = auth.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }
            
            const interaction = {
                ...interactionData,
                user_id: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await supabase.client
                .from('interactions')
                .insert([interaction])
                .select()
                .single();
            
            if (error) throw error;
            
            // تحديث إحصائيات الدورة
            await this.updateCourseStats(interactionData.course_id);
            
            this.showNotification('✅ تم إضافة التفاعل بنجاح', 'success');
            return { success: true, data };
            
        } catch (error) {
            console.error('Create interaction error:', error);
            this.showNotification('❌ فشل إضافة التفاعل', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * تحديث إحصائيات الدورة
     */
    async updateCourseStats(courseId) {
        try {
            // حساب عدد التفاعلات
            const { count: interactionsCount, error: countError } = await supabase.client
                .from('interactions')
                .select('*', { count: 'exact', head: true })
                .eq('course_id', courseId);
            
            if (countError) throw countError;
            
            // تحديث الدورة
            await supabase.client
                .from('courses')
                .update({
                    total_interactions: interactionsCount,
                    updated_at: new Date().toISOString()
                })
                .eq('id', courseId);
            
            return { success: true };
            
        } catch (error) {
            console.error('Update course stats error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * الحصول على تفاعلات الدورة
     */
    async getCourseInteractions(courseId) {
        try {
            const { data, error } = await supabase.client
                .from('interactions')
                .select('*')
                .eq('course_id', courseId)
                .order('time_seconds', { ascending: true });
            
            if (error) throw error;
            
            this.interactions = data || [];
            return { success: true, data };
            
        } catch (error) {
            console.error('Get interactions error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * حذف تفاعل
     */
    async deleteInteraction(interactionId, courseId) {
        try {
            const { error } = await supabase.client
                .from('interactions')
                .delete()
                .eq('id', interactionId);
            
            if (error) throw error;
            
            // تحديث إحصائيات الدورة
            await this.updateCourseStats(courseId);
            
            this.showNotification('✅ تم حذف التفاعل بنجاح', 'success');
            return { success: true };
            
        } catch (error) {
            console.error('Delete interaction error:', error);
            this.showNotification('❌ فشل حذف التفاعل', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * تسجيل طالب في دورة
     */
    async enrollStudent(courseId, studentId) {
        try {
            const { data, error } = await supabase.client
                .from('enrollments')
                .insert([{
                    course_id: courseId,
                    student_id: studentId,
                    enrolled_at: new Date().toISOString(),
                    progress: 0,
                    completed: false
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            this.showNotification('✅ تم التسجيل في الدورة بنجاح', 'success');
            return { success: true, data };
            
        } catch (error) {
            console.error('Enroll student error:', error);
            this.showNotification('❌ فشل التسجيل في الدورة', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * تحديث تقدم الطالب
     */
    async updateStudentProgress(courseId, studentId, progress, completed = false) {
        try {
            const updateData = {
                progress: progress,
                updated_at: new Date().toISOString()
            };
            
            if (completed) {
                updateData.completed = true;
                updateData.completed_at = new Date().toISOString();
            }
            
            const { data, error } = await supabase.client
                .from('enrollments')
                .update(updateData)
                .eq('course_id', courseId)
                .eq('student_id', studentId)
                .select()
                .single();
            
            if (error) throw error;
            
            return { success: true, data };
            
        } catch (error) {
            console.error('Update progress error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * الحصول على طلاب الدورة
     */
    async getCourseStudents(courseId) {
        try {
            const { data, error } = await supabase.client
                .from('enrollments')
                .select(`
                    *,
                    users (*)
                `)
                .eq('course_id', courseId)
                .order('enrolled_at', { ascending: false });
            
            if (error) throw error;
            
            return { success: true, data };
            
        } catch (error) {
            console.error('Get course students error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * البحث عن الدورات
     */
    async searchCourses(query, filters = {}) {
        try {
            let dbQuery = supabase.client
                .from('courses')
                .select('*')
                .eq('status', 'published');
            
            // بحث نصي
            if (query) {
                dbQuery = dbQuery.textSearch('full_text_search', query);
            }
            
            // تصفية حسب الفئة
            if (filters.category) {
                dbQuery = dbQuery.eq('category', filters.category);
            }
            
            // تصفية حسب المستوى
            if (filters.level) {
                dbQuery = dbQuery.eq('level', filters.level);
            }
            
            // تصفية حسب السعر
            if (filters.price === 'free') {
                dbQuery = dbQuery.eq('price', 0);
            } else if (filters.price === 'paid') {
                dbQuery = dbQuery.gt('price', 0);
            }
            
            // ترتيب
            const orderBy = filters.sort || 'created_at';
            const orderDirection = filters.order || 'desc';
            dbQuery = dbQuery.order(orderBy, { ascending: orderDirection === 'asc' });
            
            const { data, error } = await dbQuery;
            
            if (error) throw error;
            
            return { success: true, data };
            
        } catch (error) {
            console.error('Search courses error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * الحصول على الدورات الموصى بها
     */
    async getRecommendedCourses(userId, limit = 6) {
        try {
            // الحصول على فئات الدورات التي سجل فيها المستخدم
            const { data: enrollments, error: enrollError } = await supabase.client
                .from('enrollments')
                .select('courses(category)')
                .eq('student_id', userId);
            
            if (enrollError) throw enrollError;
            
            const categories = [...new Set(enrollments.map(e => e.courses?.category).filter(Boolean))];
            
            let query = supabase.client
                .from('courses')
                .select('*')
                .eq('status', 'published')
                .limit(limit);
            
            if (categories.length > 0) {
                query = query.in('category', categories);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            return { success: true, data };
            
        } catch (error) {
            console.error('Get recommended courses error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * إنشاء slug من العنوان
     */
    generateSlug(title) {
        const slug = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
        
        return `${slug}-${Date.now()}`;
    }

    /**
     * التحقق من ملكية الدورة
     */
    async isCourseOwner(courseId, userId) {
        try {
            const { data, error } = await supabase.client
                .from('courses')
                .select('user_id')
                .eq('id', courseId)
                .single();
            
            if (error) throw error;
            
            return data.user_id === userId;
            
        } catch (error) {
            console.error('Check course owner error:', error);
            return false;
        }
    }

    /**
     * تصدير الدورة
     */
    async exportCourse(courseId, format = 'json') {
        try {
            const course = await this.getCourse(courseId);
            if (!course.success) throw new Error('Course not found');
            
            if (format === 'json') {
                const dataStr = JSON.stringify(course.data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `course-${course.data.slug}.json`;
                a.click();
                
                URL.revokeObjectURL(url);
            }
            
            this.showNotification('✅ تم تصدير الدورة بنجاح', 'success');
            return { success: true };
            
        } catch (error) {
            console.error('Export course error:', error);
            this.showNotification('❌ فشل تصدير الدورة', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * استيراد دورة
     */
    async importCourse(jsonData) {
        try {
            const courseData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            // إزالة المعرفات القديمة
            delete courseData.id;
            delete courseData.created_at;
            delete courseData.updated_at;
            
            if (courseData.interactions) {
                courseData.interactions = courseData.interactions.map(i => {
                    delete i.id;
                    delete i.created_at;
                    delete i.updated_at;
                    return i;
                });
            }
            
            const result = await this.createCourse(courseData);
            
            if (result.success) {
                this.showNotification('✅ تم استيراد الدورة بنجاح', 'success');
            }
            
            return result;
            
        } catch (error) {
            console.error('Import course error:', error);
            this.showNotification('❌ فشل استيراد الدورة', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * إظهار إشعار
     */
    showNotification(message, type = 'info') {
        if (window.auth) {
            auth.showNotification(message, type);
        }
    }
}

// تهيئة CourseManager
const courseManager = new CourseManager();

// تصدير للاستخدام العام
window.courseManager = courseManager;

export default courseManager;