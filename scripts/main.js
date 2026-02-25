document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ تم تحميل النظام بنجاح");

    // تشغيل لوحة التحكم إذا كنا في صفحتها
    if (document.body.classList.contains('dashboard-page')) {
        initDashboard();
    }
});

function initDashboard() {
    console.log("📊 تهيئة لوحة التحكم...");
    const coursesList = document.getElementById('courses-list');
    
    const courses = [
        { title: 'مقدمة في البرمجة', students: 45, status: 'منشور' },
        { title: 'أساسيات HTML', students: 32, status: 'مسودة' }
    ];

    if (coursesList) {
        coursesList.innerHTML = courses.map(c => `
            <tr>
                <td>${c.title}</td>
                <td>${c.students}</td>
                <td><span class="status-badge">${c.status}</span></td>
            </tr>
        `).join('');
    }
}

// تعطيل الارتداد الإجباري لضمان تصفحك للمشروع أثناء التطوير
function checkAuth() {
    // تم التعطيل مؤقتاً بناءً على فحص الصور لمنع الطرد لصفحة index.html
    console.log("🔐 فحص الأمان: وضع التطوير نشط");
}
