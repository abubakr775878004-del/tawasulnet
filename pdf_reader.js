// دالة معالجة الـ PDF الكاملة
async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
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
            
            // فلترة التكرار (منع تكرار الكروت)
            const uniqueCards = [...new Set(matches.filter(c => !c.startsWith("77")))];

            if (uniqueCards.length > 0) {
                previewArea.innerHTML = `
                    <div style="text-align: center;">
                        <p style="color:green; font-weight:bold;">تم العثور على ${uniqueCards.length} كرت (بعد إزالة المكرر)</p>
                        <textarea id="cards-result" style="width:100%; height:100px; border-radius:8px; padding:10px;">${uniqueCards.join("\n")}</textarea>
                        <button id="save-btn-final" style="background:#059669; color:white; width:100%; padding:15px; border:none; margin-top:15px; border-radius:8px; cursor:pointer; font-size:16px;">حقن الكروت في النظام</button>
                    </div>
                `;
                document.getElementById('save-btn-final').onclick = () => saveToDatabase(selectedPackage, uniqueCards);
            } else {
                previewArea.innerHTML = "<p style='color:red;'>لم يتم العثور على أي كروت صالحة!</p>";
            }
        } catch (e) {
            Swal.fire("خطأ", "فشل في معالجة الملف: " + e.message, "error");
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

// دالة الحفظ المحدثة مع الإشعارات العصرية
function saveToDatabase(pkg, cardsArray) {
    if (!pkg) {
        Swal.fire("خطأ", "يجب اختيار الباقة أولاً", "error");
        return;
    }
    
    try {
        // المسار المكتشف من نظامك (packets)
        const dbRef = firebase.database().ref('packets/' + pkg);
        
        cardsArray.forEach(card => {
            dbRef.push({
                code: card,
                status: "available",
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        });
        
        // إشعار نجاح جذاب
        Swal.fire({
            title: "تمت العملية بنجاح!",
            text: "تم حقن " + cardsArray.length + " كرت في النظام.",
            icon: "success",
            confirmButtonText: "موافق"
        });
        
        document.getElementById('preview-area').innerHTML = "";
        
    } catch (error) {
        // إشعار فشل جذاب
        Swal.fire({
            title: "فشل تصدير الكروت!",
            text: "حدث خطأ أثناء الاتصال بالسيرفر: " + error.message,
            icon: "error",
            confirmButtonText: "حاول مجدداً"
        });
    }
}
