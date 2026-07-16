// دالة واحدة فقط لعرض أزرار الـ PDF
function renderPDFButtons() {
    const pdfContainer = document.getElementById('admin-pdf-containers');
    
    // التأكد من وجود الحاوية قبل التنفيذ
    if (pdfContainer) {
        pdfContainer.innerHTML = `
            <div style="margin: 15px 0; text-align: center;">
                <a href="رابط_ملفك.pdf" target="_blank" 
                   style="display: block; padding: 12px; background-color: var(--primary); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                   📄 قراءة ملف الـ PDF
                </a>
            </div>
        `;
    }
}

// تشغيل الدالة عند تحميل الصفحة
window.addEventListener('load', renderPDFButtons);
