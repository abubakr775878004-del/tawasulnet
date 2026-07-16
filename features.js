// تأكد من وضع هذا الكود في ملف features.js
function renderPDFButtons() {
    const container = document.getElementById('admin-pdf-containers');
    
    // هذا الشرط يضمن أنه إذا لم يجد الصندوق، لن يتسبب بأي خطأ في الموقع
    if (container) {
        container.innerHTML = `
            <div style="margin-bottom: 20px; text-align: center;">
                <a href="رابط_ملفك_هنا.pdf" target="_blank" 
                   style="background-color: var(--primary); color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: block; font-weight: bold;">
                   📄 قراءة ملف الـ PDF
                </a>
            </div>
        `;
    }
}

// تشغيل الدالة عند تحميل الصفحة
window.addEventListener('load', renderPDFButtons);
