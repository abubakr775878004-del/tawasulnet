// --- دالة قراءة الـ PDF (القراءة الأصلية التي تعمل معك) ---
async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    const packageSelect = document.getElementById('target-package');
    const selectedText = packageSelect.options[packageSelect.selectedIndex].text;
    const packageId = selectedText.match(/\d+/)[0]; 
    
    if (!fileInput.files[0]) {
        Swal.fire("تنبيه", "يرجى اختيار ملف PDF أولاً", "warning");
        return;
    }
    
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
                        <button id="save-btn-final" style="background:#059669; color:white; width:100%; padding:15px; border:none; border-radius:8px; cursor:pointer;">إرسال الكروت وتحديث المخزون</button>
                    </div>
                `;
                document.getElementById('save-btn-final').onclick = () => injectCards(packageId, uniqueCards);
            } else {
                previewArea.innerHTML = "<p style='color:red;'>لم يتم العثور على أرقام!</p>";
            }
        } catch (e) {
            Swal.fire("خطأ", "فشل المعالجة: " + e.message, "error");
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

// --- دالة الحقن الاحترافية والمعدلة (المنطق الجديد) ---
async function injectCards(packageId, cardsArray) {
    const db = firebase.database();
    
    // المسار للكرت (كما كان يعمل)
    const cardsRef = db.ref('packets/' + packageId);
    // المسار للعداد (المسار الذي اقترحه المبرمج، يمكنك تغييره لاحقاً)
    const counterRef = db.ref('tariffs/' + packageId + '/stock');

    try {
        // 1. استخدام Promise.all لضمان إرسال كافة الكروت قبل الانتقال للخطوة التالية
        const promises = cardsArray.map(card =>
            cardsRef.push({
                code: card,
                status: "available",
                createdAt: firebase.database.ServerValue.TIMESTAMP
            })
        );

        await Promise.all(promises);

        // 2. تحديث العداد باستخدام Transaction لضمان الدقة
        await counterRef.transaction(current => {
            return (current || 0) + cardsArray.length;
        });

        Swal.fire({
            title: "تم بنجاح",
            text: `تمت إضافة ${cardsArray.length} كرت وتحديث العداد.`,
            icon: "success"
        });

        document.getElementById("preview-area").innerHTML = "";

    } catch (err) {
        Swal.fire("خطأ", "فشل أثناء الحقن: " + err.message, "error");
    }
}
