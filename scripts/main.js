// دالة التنقل لمنع الارتداد للصفحة الرئيسية
function navigateTo(path) {
    console.log("Navigating to:", path);
    // إيقاف أي عمليات إعادة توجيه تلقائية
    window.location.href = path + ".html";
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ النظام جاهز");
    
    // حل مشكلة الارتداد: تعطيل سطر الـ Redirect في دالة checkAuth
    // ابحث عن دالة checkAuth وعطل السطر الذي يحتوي على window.location.href = 'index.html'
});
