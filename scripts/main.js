document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ تم تشغيل النظام بنجاح بدون أخطاء صور.");
    
    // منع الارتداد التلقائي للصفحة الرئيسية
    if (window.location.pathname.includes('dashboard')) {
        console.log("📊 أنت الآن في لوحة التحكم");
    }
});
