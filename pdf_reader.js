// --- الجزء الأول: دالة القراءة المحدثة ---
async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    const selectedPackage = document.getElementById('target-package').value; // يأخذ الـ ID من القائمة المنسدلة في صفحتك
    
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
                previewArea.innerHTML = `
                    <p style="color:green;">تم استخراج ${uniqueCards.length} كرت</p>
                    <textarea id="cards-result" style="width:100%; height:100px;">${uniqueCards.join("\n")}</textarea>
                    <button id="save-btn-final" style="background:#28a745; color:white; width:100%; padding:15px; border:none; margin-top:10px; cursor:pointer;">حفظ الكروت في الباقة المختارة</button>
                `;
                document.getElementById('save-btn-final').onclick = function() {
                    saveToDatabase(selectedPackage);
                };
            } else {
                previewArea.innerHTML = "<p style='color:red;'>لم يتم العثور على أرقام كروت!</p>";
            }
        } catch (e) {
            previewArea.innerHTML = "خطأ في المعالجة: " + e.message;
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

// --- الجزء الثاني: دالة الحفظ المخصصة لنظام TawasulNet ---
function saveToDatabase(pkg) {
    const cardsText = document.getElementById('cards-result').value;
    const cardsArray = cardsText.split('\n').filter(c => c.trim() !== "");
    
    if (cardsArray.length === 0 || !pkg) return alert("يرجى اختيار الباقة أولاً!");
    
    try {
        // المسار الذي يحتاجه نظام TawasulNet ليظهر الكروت في الواجهة
        const dbRef = firebase.database().ref('packages/' + pkg + '/cards');
        
        cardsArray.forEach(card => {
            dbRef.push({
                code: card,
                status: "available",
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        });
        
        alert("✅ تم الحفظ بنجاح! انتظر 5 ثوانٍ ليقوم النظام بتحديث القائمة تلقائياً.");
        document.getElementById('preview-area').innerHTML = "";
        
    } catch (error) {
        alert("❌ خطأ أثناء الحفظ: " + error.message);
        console.error(error);
    }
}
