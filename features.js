// دالة عرض زر الـ PDF
function renderPDFButtons() {
    // نبحث عن الحاوية داخل الصفحة
    const container = document.getElementById('admin-pdf-containers');
    
    // تأكد أن الحاوية موجودة، وأنها فارغة (لنتجنب التكرار)
    if (container) {
        container.innerHTML = `
            <div style="margin: 10px 0; text-align: center;">
                <a href="رابط_ملفك.pdf" target="_blank" 
                   style="display: block; padding: 12px; background-color: #0056b3; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                   📄 قراءة ملف الـ PDF
                </a>
            </div>
        `;
    }
}

// تشغيل الدالة بمجرد تحميل محتوى الصفحة بالكامل
document.addEventListener('DOMContentLoaded', renderPDFButtons);
