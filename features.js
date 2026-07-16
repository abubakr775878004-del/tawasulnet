// دالة تحليل ورفع ملف الـ PDF
async function processUploadedPDF(packageId) {
    const fileInput = document.getElementById('pdf-upload-input-' + packageId);
    const file = fileInput.files[0];
    if (!file) return alert("الرجاء اختيار ملف PDF!");
    
    alert("جاري تحليل ملف الباقة رقم: " + packageId);
    
    const reader = new FileReader();
    reader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let count = 0;
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            textContent.items.forEach(item => {
                let text = item.str.trim();
                // تنظيف النص للحصول على الرقم فقط للمقارنة
                let cleanText = text.replace(/[a-zA-Z]/g, '');
                
                // شرط الاستخراج: 6-8 أرقام، ليس جوالاً، وليس سعراً
                const isCard = /^\d{6,8}$/.test(cleanText);
                const isPhone = cleanText.startsWith('77') || cleanText.startsWith('73');
                const isPrice = (cleanText === '1000' || cleanText === '500' || cleanText === '200' || cleanText === '300');

                if (isCard && !isPhone && !isPrice) {
                    firebase.database().ref('cards/available').push({
                        code: text, // حفظ الكود الأصلي بحروفه
                        packageId: packageId,
                        addedAt: Date.now(),
                        status: 'متوفر'
                    });
                    count++;
                }
            });
        }
        alert("تم استخراج " + count + " كارت وإضافتها بنجاح!");
    };
    reader.readAsArrayBuffer(file);
}

// دالة تحديث خيارات البحث وإنشاء أزرار الـ PDF لكل باقة
function updateAdminSearchOptions() {
    const filterPkg = document.getElementById('admin-search-filter-package');
    const container = document.getElementById('admin-pdf-containers');
    if (!filterPkg) return;
    
    const savedVal = filterPkg.value;
    filterPkg.innerHTML = '<option value="جميع">كل الباقات</option>';
    if (container) container.innerHTML = ''; // تنظيف الأزرار القديمة
    
    packages.forEach(p => {
        filterPkg.innerHTML += `<option value="${p.id}">${p.name}</option>`;
        
        if (container) {
            container.innerHTML += `
                <div class="card" style="margin: 10px; padding: 10px; border: 1px dashed #7c3aed;">
                    <label>رفع كروت باقة ${p.name}:</label>
                    <input type="file" id="pdf-upload-input-${p.id}" accept="application/pdf" style="width:100%; margin:5px 0;">
                    <button class="btn" style="background:#7c3aed; width:100%;" onclick="processUploadedPDF('${p.id}')">بدء التحليل والرفع</button>
                </div>
            `;
        }
    });
    filterPkg.value = savedVal;
}
