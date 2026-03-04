import { Link } from 'react-router-dom';
import { Play, CheckCircle, Users, Zap, ArrowLeft, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-50 py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700"
            >
              <Zap className="ml-2 h-4 w-4" />
              مستقبل التعليم التفاعلي هنا
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 text-5xl font-extrabold tracking-tight text-stone-900 lg:text-7xl"
            >
              حوّل أي فيديو إلى <span className="text-emerald-600">درس تفاعلي</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12 max-w-2xl text-lg text-stone-600"
            >
              منصة تعليمي تتيح للمعلمين إضافة أسئلة، ملاحظات، واختبارات قصيرة داخل فيديوهات يوتيوب لضمان تفاعل الطلاب وفهمهم العميق للمحتوى.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 sm:space-x-reverse"
            >
              <Link
                to="/register"
                className="flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-emerald-700 transition-all"
              >
                ابدأ مجاناً الآن
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center rounded-xl border-2 border-stone-200 bg-white px-8 py-4 text-lg font-bold text-stone-700 hover:bg-stone-50 transition-all"
              >
                تسجيل الدخول
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-stone-900 lg:text-4xl">لماذا تختار تعليمي؟</h2>
            <p className="text-stone-500">كل ما تحتاجه لإنشاء تجربة تعليمية مذهلة</p>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                title: 'تفاعل حقيقي',
                desc: 'توقف الفيديو تلقائياً عند نقاط الأسئلة لضمان انتباه الطالب.',
                icon: Play,
                color: 'bg-blue-50 text-blue-600'
              },
              {
                title: 'تقارير مفصلة',
                desc: 'احصل على إحصائيات دقيقة حول أداء كل طالب في كل سؤال.',
                icon: CheckCircle,
                color: 'bg-emerald-50 text-emerald-600'
              },
              {
                title: 'سهولة الاستخدام',
                desc: 'واجهة بسيطة تتيح لك إنشاء درسك الأول في أقل من 5 دقائق.',
                icon: Zap,
                color: 'bg-amber-50 text-amber-600'
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className={`mb-6 rounded-2xl p-4 ${feature.color}`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-stone-900">{feature.title}</h3>
                <p className="text-stone-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-600 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-8 text-3xl font-bold text-white lg:text-4xl">هل أنت مستعد لتغيير طريقة تدريسك؟</h2>
          <Link
            to="/register"
            className="inline-flex items-center rounded-xl bg-white px-10 py-4 text-lg font-bold text-emerald-700 shadow-xl hover:bg-stone-50 transition-all"
          >
            سجل كمعلم الآن
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-6 text-2xl font-bold text-emerald-700">تعليمي</div>
          <p className="text-stone-500">© 2026 جميع الحقوق محفوظة لمنصة تعليمي</p>
        </div>
      </footer>
    </div>
  );
}
