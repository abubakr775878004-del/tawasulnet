// --- الكود الكامل لملف pdf_reader.js ---

// دالة قراءة الـ PDF (التي أثبتت نجاحها في قراءة الكروت)
async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    const packageSelect = document.getElementById('target-package');
    
    if (!fileInput.files[0]) {
        Swal.fire("تنبيه", "يرجى اختيار ملف PDF أولاً", "warning");
        return;
    }
    
    // الحصول على نص الباقة واستخراج الرقم منها بدقة
    const selectedText = packageSelect.options[packageSelect.selectedIndex].text;
    const packageId = selectedText.match(/\d+/)[0]; 

    previewArea.innerHTML = "جاري المعالجة...";
    const reader = new FileReader();

    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const pg = await pdf.getPage(i);
                const content = await pg.getTextContent();
                content.items.forEach(item => text += item.str + " ");
            }

            const regex = /\b(0\d{7,8}|[1-9]\d{5,8})\b/g;
            let matches = text.match(regex) || [];
            const uniqueCards = [...new Set(matches.filter(c => !c.startsWith("77")))];

            if (uniqueCards.length > 0) {
                previewArea.innerHTML = `
                    <div style="text-align: center; margin-top:10px;">
                        <p style="color:green; font-weight:bold;">تم استخراج ${uniqueCards.length} كرت</p>
                        <button id="save-btn-final" style="background:#059669; color:white; width:100%; padding:15px; border:none; border-radius:8px; cursor:pointer;">حقن الكروت في الباقة ${packageId}</button>
                    </div>
                `;
                document.getElementById('save-btn-final').onclick = () => saveToDatabase(packageId, uniqueCards);
            } else {
                previewArea.innerHTML = "<p style='color:red;'>لم يتم العثور على أرقام كروت صالحة!</p>";
            }
        } catch (e) {
            Swal.fire("خطأ", "فشل في المعالجة: " + e.message, "error");
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

// دالة الحفظ المحدثة (الحقن + محاولة تحديث العداد)
function saveToDatabase(packageId, cardsArray) {
    try {
        const db = firebase.database();
        const cardsRef = db.ref('packets/' + packageId);
        
        // 1. إضافة الكروت للمخزون
        cardsArray.forEach(card => {
            cardsRef.push({
                code: card,
                status: "available",
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        });

        // 2. تحديث العداد (محاولة تحديث المسار المباشر)
        // إذا كان نظامك يستخدم مساراً مختلفاً للعداد، قد تحتاج لتعديل كلمة 'count'
        const countRef = db.ref('package_counts/' + packageId);
        countRef.transaction((current) => {
            return (current || 0) + cardsArray.length;
        });

        Swal.fire({
            title: "تمت العملية بنجاح!",
            text: "تمت إضافة " + cardsArray.length + " كرت للباقة " + packageId,
            icon: "success",
            confirmButtonText: "موافق"
        });
        
        document.getElementById('preview-area').innerHTML = "";
        
    } catch (error) {
        Swal.fire({
            title: "فشل!",
            text: "خطأ أثناء الحقن: " + error.message,
            icon: "error"
        });
    }
}
