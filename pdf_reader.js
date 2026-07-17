async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    
    if (!fileInput.files[0]) {
        alert("يرجى اختيار ملف PDF!");
        return;
    }
    
    previewArea.innerHTML = "جاري قراءة الملف...";
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            
            // التأكد من أن مكتبة pdfjsLib معرفة
            if (typeof pdfjsLib === 'undefined') {
                throw new Error("مكتبة pdf.js غير محملة!");
            }

            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let text = "";
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(item => item.str).join(" ");
            }

            // استخراج الأرقام
            const regex = /\b(0\d{7,8}|[1-9]\d{5,8})\b/g;
            const matches = text.match(regex) || [];
            const uniqueCards = [...new Set(matches.filter(c => !c.startsWith("77")))];

            if (uniqueCards.length > 0) {
                previewArea.innerHTML = `
                    <p style="color:green;">تم استخراج ${uniqueCards.length} كرت</p>
                    <textarea id="cards-result" style="width:100%; height:150px;">${uniqueCards.join("\n")}</textarea>
                    <button id="save-btn-final" style="background:#28a745; color:white; width:100%; padding:10px; border:none; margin-top:10px;">حفظ الكروت</button>
                `;
                
                document.getElementById('save-btn-final').onclick = function() {
                    const pkg = document.getElementById('target-package').value;
                    saveToDatabase(pkg);
                };
            } else {
                previewArea.innerHTML = "<p style='color:red;'>لم يتم العثور على كروت في الملف!</p>";
            }
        } catch (e) {
            previewArea.innerHTML = "خطأ: " + e.message;
            console.error(e);
        }
    };
    reader.readAsArrayBuffer(file);
}

function saveToDatabase(pkg) {
    const cardsText = document.getElementById('cards-result').value;
    const cardsArray = cardsText.split('\n').filter(c => c.trim() !== "");
    
    if (cardsArray.length === 0) return;

    // الحفظ في مسار عام 'cards' لتجنب الأخطاء
    const dbRef = firebase.database().ref('cards');
    
    cardsArray.forEach(card => {
        dbRef.push({
            code: card,
            package: pkg,
            status: "available"
        });
    });
    
    alert("✅ تم إرسال الكروت بنجاح!");
    document.getElementById('preview-area').innerHTML = "";
}
