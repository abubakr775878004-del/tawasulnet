// دالة لإضافة أزرار الـ PDF داخل الحاوية المخصصة
function initPDFAdminFeatures() {
    const pdfContainer = document.getElementById('admin-pdf-containers');
    
    // تأكد أن الحاوية موجودة قبل إضافة أي شيء
    if (pdfContainer) {
        pdfContainer.innerHTML = `
            <div style="text-align: center;">
                <h4 style="margin-bottom: 10px;">ملفات الـ PDF</h4>
                <a href="link-to-your-file.pdf" target="_blank" class="btn" style="display: block; margin-bottom: 5px;">
                    تحميل ملف المبيعات (PDF)
                </a>
                <a href="another-file.pdf" target="_blank" class="btn" style="display: block;">
                    تحميل تعليمات الاستخدام (PDF)
                </a>
            </div>
        `;
    }
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initPDFAdminFeatures);
