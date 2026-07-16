document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('admin-pdf-containers');
    if (!container) return;

    // 1. إنشاء الواجهة
    container.innerHTML = `
        <div style="padding: 15px; border: 1px dashed #ccc; margin-bottom: 15px;">
            <input type="file" id="pdf-input" accept="application/pdf" style="margin-bottom: 10px;">
            <select id="my-package-select" class="form-control" style="margin-bottom: 10px;">
                <option value="">اختر الباقة...</option>
            </select>
            <button class="btn btn-success" onclick="readPDF()" style="width: 100%;">قراءة وربط الكروت</button>
        </div>
    `;

    // 2. جلب الباقات الموجودة في الصفحة تلقائياً
    // نبحث عن أي select له علاقة بالباقات
    const originalSelect = document.getElementById('admin-direct-package-select'); 
    if (originalSelect) {
        document.getElementById('my-package-select').innerHTML = originalSelect.innerHTML;
    }
});

// 3. دالة القراءة (استخدام تقنية بسيطة)
function readPDF() {
    const fileInput = document.getElementById('pdf-input');
    if (fileInput.files.length === 0) {
        alert("يرجى اختيار ملف PDF");
        return;
    }
    
    // تنبيه: لقراءة PDF فعلياً في المتصفح، يجب أن يعمل الكود داخل بيئة تسمح بذلك
    // هنا سنقوم بفتح الملف في نافذة جديدة ليتمكن المستخدم من نسخه ولصقه
    const file = fileInput.files[0];
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
    alert("سيتم فتح الملف في نافذة جديدة. قم بنسخ الكروت ولصقها في مربع الإدخال مباشرة.");
}
