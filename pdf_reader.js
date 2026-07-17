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
            // هذه هي إعدادات القراءة التي كانت تعمل معك سابقاً
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const pg = await pdf.getPage(i);
                const content = await pg.getTextContent();
                content.items.forEach(item => text += item.str + " ");
            }

            // منطق استخراج الكروت (نفس المنطق الذي نجح معك)
            const regex = /\b(0\d{7,8}|[1-9]\d{5,8})\b/g;
            let matches = text.match(regex) || [];
            
            // منع تكرار الكروت
            const uniqueCards = [...new Set(matches.filter(c => !c.startsWith("77")))];

            if (uniqueCards.length > 0) {
                previewArea.innerHTML = `
                    <div style="text-align: center;">
                        <p style="color:green; font-weight:bold;">تم استخراج ${uniqueCards.length} كرت</p>
                        <textarea id="cards-result" style="width:100%; height:100px;">${uniqueCards.join("\n")}</textarea>
                        <button id="save-btn-final" style="background:#059669; color:white; width:100%; padding:15px; border:none; margin-top:10px; cursor:pointer;">حقن الكروت في النظام</button>
                    </div>
                `;
                document.getElementById('save-btn-final').onclick = () => saveToDatabase(selectedPackage, uniqueCards);
            } else {
                previewArea.innerHTML = "<p style='color:red;'>لم يتم العثور على كروت!</p>";
            }
        } catch (e) {
            Swal.fire("خطأ", "فشل في معالجة الملف: " + e.message, "error");
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

// دالة الحفظ المحدثة للمسار الصحيح (packets) مع الإشعارات
function saveToDatabase(pkg, cardsArray) {
    if (!pkg) {
        Swal.fire("خطأ", "يجب اختيار الباقة أولاً", "error");
        return;
    }
    
    try {
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
            text: "تم تصدير " + cardsArray.length + " كرت إلى النظام.",
            icon: "success",
            confirmButtonText: "موافق"
        });
        
        document.getElementById('preview-area').innerHTML = "";
        
    } catch (error) {
        Swal.fire({
            title: "فشل التصدير!",
            text: "حدث خطأ: " + error.message,
            icon: "error",
            confirmButtonText: "إغلاق"
        });
    }
}
