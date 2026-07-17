// دالة معالجة الـ PDF
async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    const selectedPackage = document.getElementById('target-package').value;
    
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
                    <button id="save-btn-final" style="background:#28a745; color:white; width:100%; padding:10px; border:none; margin-top:10px;">حفظ الكروت في السيرفر</button>
                `;
                document.getElementById('save-btn-final').onclick = function() {
                    saveToDatabase(selectedPackage);
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

// دالة الحفظ الشاملة (تغطي كل الاحتمالات)
function saveToDatabase(pkg) {
    const cardsText = document.getElementById('cards-result').value;
    const cardsArray = cardsText.split('\n').filter(c => c.trim() !== "");
    
    if (cardsArray.length === 0) return;
    
    // قائمة المسارات المحتملة في نظامك
    const paths = ['cards/' + pkg, 'packages/' + pkg, 'plans/' + pkg, 'packets/' + pkg, 'cards', 'packages'];
    
    try {
        const dbInstance = (typeof db !== 'undefined' ? db : firebase.database());
        
        cardsArray.forEach(card => {
            const cardData = {
                code: card,
                status: "available",
                package: pkg,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            };

            paths.forEach(path => {
                dbInstance.ref(path).push(cardData);
            });
        });
        
        alert("✅ تم إرسال الكروت لجميع المسارات المحتملة. سيتم تحديث الصفحة...");
        document.getElementById('preview-area').innerHTML = "";
        
        // تحديث الصفحة لضمان ظهور الكروت في لوحة التحكم
        setTimeout(() => { location.reload(); }, 2000);
        
    } catch (error) {
        alert("❌ خطأ: " + error.message);
    }
}
