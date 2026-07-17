// دالة القراءة المحدثة لدعم الحقن المباشر في الباقة المختارة
async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    // القيمة هنا يجب أن تكون معرف الباقة (مثل 200 أو 300)
    const selectedPackage = document.getElementById('target-package').value;
    
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
                        <button id="save-btn-final" style="background:#059669; color:white; width:100%; padding:15px; border:none; border-radius:8px; cursor:pointer;">حقن الكروت في باقة ${selectedPackage}</button>
                    </div>
                `;
                document.getElementById('save-btn-final').onclick = () => saveToDatabase(selectedPackage, uniqueCards);
            } else {
                previewArea.innerHTML = "<p style='color:red;'>لم يتم العثور على أرقام كروت!</p>";
            }
        } catch (e) {
            Swal.fire("خطأ", "فشل في المعالجة: " + e.message, "error");
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

// دالة الحقن في مسار الباقة المحدد
function saveToDatabase(pkg, cardsArray) {
    if (!pkg) {
        Swal.fire("خطأ", "يجب اختيار الباقة أولاً", "error");
        return;
    }
    
    try {
        // المسار الدقيق كما يظهر في نظامك للباقات (packets/200 أو packets/300)
        const dbRef = firebase.database().ref('packets/' + pkg);
        
        cardsArray.forEach(card => {
            dbRef.push({
                code: card,
                status: "available",
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        });
        
        Swal.fire({
            title: "تمت العملية بنجاح!",
            text: "تم حقن " + cardsArray.length + " كرت في الباقة المختارة.",
            icon: "success",
            confirmButtonText: "موافق"
        });
        
        document.getElementById('preview-area').innerHTML = "";
        
    } catch (error) {
        Swal.fire({
            title: "فشل تصدير العملية!",
            text: "حدث خطأ: " + error.message,
            icon: "error",
            confirmButtonText: "إغلاق"
        });
    }
}
