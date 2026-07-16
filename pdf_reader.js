// اختبار بسيط جداً
alert("تم تحميل ملف PDF Reader بنجاح!");

window.addEventListener('load', function() {
    const container = document.getElementById('admin-pdf-containers');
    if (container) {
        alert("تم العثور على حاوية PDF في الصفحة!");
        // هنا ستضع كود القارئ لاحقاً
    } else {
        alert("خطأ: لم يتم العثور على حاوية admin-pdf-containers");
    }
});
