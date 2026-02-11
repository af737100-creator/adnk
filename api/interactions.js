// ملف محاكاة API للتطوير المحلي
module.exports = (req, res) => {
    // هذا لمحاكاة API endpoint
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    const { courseId } = req.query;
    
    // محاكاة بيانات التفاعلات
    const interactions = [
        {
            id: 1,
            courseId: courseId,
            type: 'question',
            time: 60,
            title: 'اختبار فهم المفاهيم',
            content: 'ما هي لغة البرمجة التي ندرسها؟',
            options: ['Java', 'Python', 'C++', 'JavaScript'],
            correctAnswer: 1
        },
        {
            id: 2,
            courseId: courseId,
            type: 'explanation',
            time: 300,
            title: 'معلومة إضافية',
            content: 'Python هي لغة برمجة عالية المستوى، سهلة التعلم وتستخدم في مجالات متعددة.'
        }
    ];
    
    res.status(200).json({
        success: true,
        interactions: interactions.filter(i => i.courseId === courseId)
    });
};