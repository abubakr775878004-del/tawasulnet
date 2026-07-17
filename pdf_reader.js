// 1. معالجة الـ PDF
async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    
    if (!fileInput.files[0]) return alert("يرجى اختيار ملف PDF!");
    
    previewArea.innerHTML = "جاري المعالجة...";
    
    const reader = new FileReader();
    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            // تحميل المكتبة
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
                    <button id="save-btn-final" style="background:#28a745; color:white; width:100%; padding:10px; border:none; margin-top:10px;">حفظ الكروت</button>
                `;
                // ربط الزر الجديد
                document.getElementById('save-btn-final').onclick = function() {
                    const pkg = document.getElementById('target-package').value;
                    saveToDatabase(pkg);
                };
            } else {
                previewArea.innerHTML = "<p style='color:red;'>لم يتم العثور على أرقام كروت!</p>";
            }
        } catch (e) {
            previewArea.innerHTML = "خطأ في قراءة الملف: " + e.message;
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

// 2. دالة الحفظ المنفصلة
function saveToDatabase(pkg) {
    const cardsText = document.getElementById('cards-result').value;
    const cardsArray = cardsText.split('\n').filter(c => c.trim() !== "");
    
    if (cardsArray.length === 0) return;

    // استخدام المسار الذي أكدتَ أنت سابقاً أنه يعمل يدوياً في نظامك
    // سنحاول الحفظ في المجلد العام 'cards'
    const dbRef = firebase.database().ref('cards');
    
    cardsArray.forEach(card => {
        dbRef.push({
            code: card,
            package: pkg,
            status: "available"
        });
    });
    
    alert("✅ تم الحفظ بنجاح!");
    document.getElementById('preview-area').innerHTML = "";
}
