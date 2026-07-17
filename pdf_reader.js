// دالة القراءة المحدثة التي تنشئ الزر تلقائياً
async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    
    if (!fileInput.files[0]) return alert("⚠️ يرجى اختيار ملف PDF!");
    
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
            const matches = text.match(regex) || [];
            const uniqueCards = [...new Set(matches.filter(c => !c.startsWith("77")))];

            if (uniqueCards.length > 0) {
                // هنا نقوم بإنشاء النص + الزر يدوياً داخل الـ preview-area
                previewArea.innerHTML = `
                    <p style="color:green;">تم استخراج ${uniqueCards.length} كرت</p>
                    <textarea id="cards-result" style="width:100%; height:100px;">${uniqueCards.join("\n")}</textarea>
                    <button id="manual-save-btn" style="background:#28a745; color:white; width:100%; padding:15px; border:none; margin-top:10px; font-weight:bold; cursor:pointer;">اضغط هنا لحفظ الكروت</button>
                `;
                
                // ربط الزر الجديد بدالة الحفظ
                document.getElementById('manual-save-btn').onclick = function() {
                    const pkg = document.getElementById('target-package').value;
                    saveToDatabase(pkg);
                };
            } else {
                previewArea.innerHTML = "<p style='color:red;'>لم يتم العثور على كروت!</p>";
            }
        } catch (e) {
            previewArea.innerHTML = "خطأ في المعالجة: " + e.message;
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

// دالة الحفظ
function saveToDatabase(pkg) {
    const cardsText = document.getElementById('cards-result').value;
    const cardsArray = cardsText.split('\n').filter(c => c.trim() !== "");
    
    if (cardsArray.length === 0) return;
    
    try {
        // الحفظ في المجلد الرئيسي 'cards'
        const dbRef = firebase.database().ref('cards');
        
        cardsArray.forEach(card => {
            dbRef.push({
                code: card,
                package: pkg,
                status: "available",
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        });
        
        alert("✅ تم الحفظ بنجاح! راقب Firebase الآن.");
        document.getElementById('preview-area').innerHTML = "";
    } catch (error) {
        alert("❌ خطأ: " + error.message);
    }
}
