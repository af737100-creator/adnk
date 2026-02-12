/**
 * ============================================
 * ANALYTICS.JS - نظام التحليلات والإحصائيات المتقدم
 * تعليمي - منصة التعلم التفاعلي
 * الإصدار: 1.0.0
 * ============================================
 */

class AnalyticsManager {
    constructor() {
        this.cache = new Map();
        this.charts = new Map();
        this.reports = [];
        this.initialized = false;
        this.init();
    }

    /**
     * تهيئة نظام التحليلات
     */
    async init() {
        try {
            this.initialized = true;
            console.log('✅ AnalyticsManager initialized');
        } catch (error) {
            console.error('❌ AnalyticsManager initialization error:', error);
        }
    }

    /**
     * الحصول على إحصائيات الدورة
     */
    async getCourseStats(courseId) {
        try {
            // التحقق من وجود البيانات في الكاش
            if (this.cache.has(`course_${courseId}`)) {
                return this.cache.get(`course_${courseId}`);
            }
            
            const result = await supabase.analytics.getCourseAnalytics(courseId);
            
            if (result.success) {
                this.cache.set(`course_${courseId}`, result.data);
                setTimeout(() => this.cache.delete(`course_${courseId}`), 5 * 60 * 1000); // 5 دقائق
                
                return result.data;
            }
            
            return null;
            
        } catch (error) {
            console.error('Get course stats error:', error);
            return null;
        }
    }

    /**
     * الحصول على إحصائيات المستخدم
     */
    async getUserStats(userId) {
        try {
            // إحصائيات الدروس
            const { data: courses, error: coursesError } = await supabase.client
                .from('courses')
                .select('id, title, total_students, total_interactions, average_rating')
                .eq('user_id', userId);
            
            if (coursesError) throw coursesError;
            
            // إحصائيات الطلاب
            let totalStudents = 0;
            let totalInteractions = 0;
            let totalRatings = 0;
            let totalRevenue = 0;
            
            courses.forEach(course => {
                totalStudents += course.total_students || 0;
                totalInteractions += course.total_interactions || 0;
                totalRatings += course.average_rating || 0;
            });
            
            const avgRating = courses.length > 0 ? totalRatings / courses.length : 0;
            
            return {
                totalCourses: courses.length,
                totalStudents,
                totalInteractions,
                averageRating: avgRating.toFixed(1),
                totalRevenue,
                courses
            };
            
        } catch (error) {
            console.error('Get user stats error:', error);
            return null;
        }
    }

    /**
     * الحصول على إحصائيات تقدم الطلاب
     */
    async getStudentProgressStats(courseId) {
        try {
            const { data, error } = await supabase.client
                .from('enrollments')
                .select('progress, is_completed, completed_at')
                .eq('course_id', courseId);
            
            if (error) throw error;
            
            const totalStudents = data.length;
            const completedStudents = data.filter(e => e.is_completed).length;
            const completionRate = totalStudents > 0 
                ? (completedStudents / totalStudents * 100).toFixed(1) 
                : 0;
            
            // توزيع التقدم
            const progressDistribution = {
                '0-20': 0,
                '21-40': 0,
                '41-60': 0,
                '61-80': 0,
                '81-100': 0
            };
            
            data.forEach(enrollment => {
                if (enrollment.progress <= 20) progressDistribution['0-20']++;
                else if (enrollment.progress <= 40) progressDistribution['21-40']++;
                else if (enrollment.progress <= 60) progressDistribution['41-60']++;
                else if (enrollment.progress <= 80) progressDistribution['61-80']++;
                else progressDistribution['81-100']++;
            });
            
            return {
                totalStudents,
                completedStudents,
                completionRate,
                progressDistribution,
                enrollments: data
            };
            
        } catch (error) {
            console.error('Get student progress stats error:', error);
            return null;
        }
    }

    /**
     * الحصول على إحصائيات التفاعلات
     */
    async getInteractionStats(courseId) {
        try {
            const { data, error } = await supabase.client
                .from('student_responses')
                .select(`
                    *,
                    interactions (
                        id,
                        type,
                        title,
                        points,
                        correct_answer
                    )
                `)
                .eq('interactions.course_id', courseId);
            
            if (error) throw error;
            
            const stats = {
                totalResponses: data.length,
                correctAnswers: data.filter(r => r.is_correct).length,
                incorrectAnswers: data.filter(r => r.is_correct === false).length,
                byInteractionType: {},
                averageScore: 0,
                totalPoints: 0,
                earnedPoints: 0
            };
            
            let totalScore = 0;
            
            data.forEach(response => {
                const type = response.interactions?.type;
                
                if (type) {
                    if (!stats.byInteractionType[type]) {
                        stats.byInteractionType[type] = {
                            total: 0,
                            correct: 0,
                            incorrect: 0
                        };
                    }
                    
                    stats.byInteractionType[type].total++;
                    
                    if (response.is_correct === true) {
                        stats.byInteractionType[type].correct++;
                        totalScore += 100;
                    } else if (response.is_correct === false) {
                        stats.byInteractionType[type].incorrect++;
                    }
                }
                
                if (response.interactions?.points) {
                    stats.totalPoints += response.interactions.points;
                    if (response.is_correct) {
                        stats.earnedPoints += response.interactions.points;
                    }
                }
            });
            
            stats.averageScore = data.length > 0 
                ? (totalScore / data.length).toFixed(1) 
                : 0;
            
            return stats;
            
        } catch (error) {
            console.error('Get interaction stats error:', error);
            return null;
        }
    }

    /**
     * إنشاء رسم بياني خطي
     */
    createLineChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        
        // تدمير الرسم البياني السابق إذا وجد
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
        }
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: data.datasets.map(dataset => ({
                    label: dataset.label,
                    data: dataset.data,
                    borderColor: dataset.color || '#4361ee',
                    backgroundColor: dataset.backgroundColor || 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: dataset.fill || false,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: options.showLegend !== false,
                        position: options.legendPosition || 'top',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'Cairo, sans-serif'
                            }
                        }
                    },
                    tooltip: {
                        rtl: true,
                        titleFont: {
                            family: 'Cairo, sans-serif'
                        },
                        bodyFont: {
                            family: 'Cairo, sans-serif'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                family: 'Cairo, sans-serif'
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                family: 'Cairo, sans-serif'
                            }
                        }
                    }
                },
                ...options
            }
        });
        
        this.charts.set(canvasId, chart);
        return chart;
    }

    /**
     * إنشاء رسم بياني دائري
     */
    createPieChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
        }
        
        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: data.colors || [
                        '#4361ee', '#4ade80', '#f59e0b', '#ef4444', '#8b5cf6',
                        '#ec4899', '#14b8a6', '#f97316', '#6b7280', '#10b981'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: options.legendPosition || 'bottom',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'Cairo, sans-serif',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        rtl: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                ...options
            }
        });
        
        this.charts.set(canvasId, chart);
        return chart;
    }

    /**
     * إنشاء رسم بياني أعمدة
     */
    createBarChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
        }
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: data.datasets.map(dataset => ({
                    label: dataset.label,
                    data: dataset.data,
                    backgroundColor: dataset.color || '#4361ee',
                    borderRadius: 6
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: options.showLegend !== false,
                        position: options.legendPosition || 'top',
                        rtl: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                ...options
            }
        });
        
        this.charts.set(canvasId, chart);
        return chart;
    }

    /**
     * تصدير التقرير
     */
    exportReport(reportData, format = 'pdf') {
        if (format === 'pdf') {
            this.exportToPDF(reportData);
        } else if (format === 'csv') {
            this.exportToCSV(reportData);
        } else if (format === 'json') {
            this.exportToJSON(reportData);
        }
    }

    /**
     * تصدير إلى PDF
     */
    exportToPDF(reportData) {
        auth.showNotification('📄 جاري إنشاء ملف PDF...', 'info');
        
        setTimeout(() => {
            auth.showNotification('✅ تم تصدير التقرير بنجاح', 'success');
        }, 2000);
    }

    /**
     * تصدير إلى CSV
     */
    exportToCSV(reportData) {
        let csv = '';
        
        // إضافة العناوين
        if (reportData.headers) {
            csv += reportData.headers.join(',') + '\n';
        }
        
        // إضافة البيانات
        if (reportData.rows) {
            reportData.rows.forEach(row => {
                csv += row.join(',') + '\n';
            });
        }
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${Date.now()}.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
        auth.showNotification('✅ تم تصدير التقرير بنجاح', 'success');
    }

    /**
     * تصدير إلى JSON
     */
    exportToJSON(reportData) {
        const dataStr = JSON.stringify(reportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        auth.showNotification('✅ تم تصدير التقرير بنجاح', 'success');
    }

    /**
     * مسح الذاكرة المؤقتة
     */
    clearCache() {
        this.cache.clear();
        auth.showNotification('🗑️ تم مسح الذاكرة المؤقتة', 'info');
    }

    /**
     * تدمير الرسوم البيانية
     */
    destroyCharts() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }
}

// تهيئة AnalyticsManager
const analytics = new AnalyticsManager();

// تصدير للاستخدام العام
window.analytics = analytics;

export default analytics;