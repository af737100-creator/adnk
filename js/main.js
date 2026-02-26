
// يمكن وضع دوال مساعدة عامة هنا
// مثل التعامل مع القائمة المنسدلة، إلخ.

// تفعيل القائمة للجوال
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            document.querySelector('.nav-links').classList.toggle('show');
        });
    }
});