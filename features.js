// دالة لجلب الباقات من صفحة index.html تلقائياً
function loadPackagesIntoSelect() {
    const container = document.getElementById('admin-pdf-containers');
    if (!container) return;

    // نبحث عن جميع عناوين الباقات في الصفحة (بافتراض أنك تستخدم كلاس card-title)
    // يمكنك تعديل الكلاس إذا كان مختلفاً في صفحتك
    const packageElements = document.querySelectorAll('.card-title'); 
    
    let optionsHtml = '';
    packageElements.forEach(el => {
        const text = el.innerText;
        // سنبحث عن أي نص يحتوي على كلمة "باقة" أو "ريال" لنعتبره باقة
        if (text.includes('باقة')) {
            optionsHtml += `<option value="${text}">${text}</option>`;
        }
    });

    container.innerHTML = `
        <div style="background: #f5f5f9; padding: 15px; border-radius: 10px; border: 1px solid #ddd; margin-bottom: 20px;">
            <h5 style="margin-top:0;">إدارة الملفات (تلقائي)</h5>
            <input type="file" id="pdf-input" style="width: 100%; margin-bottom: 10px;">
            <select id="target-package" class="form-control" style="margin-bottom: 10px;">
                ${optionsHtml || '<option>لم يتم العثور على باقات</option>'}
            </select>
            <button class="btn btn-primary" style="width: 100%;" onclick="processPDF()">تحويل وربط البيانات</button>
        </div>
    `;
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadPackagesIntoSelect);
