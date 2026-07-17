async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    const selectedPackage = document.getElementById('target-package').value;
    
    if (!fileInput.files[0]) return showModernToast("⚠️ يرجى اختيار ملف PDF!");
    
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
            previewArea.innerHTML = "خطأ في قراءة PDF: " + e.message;
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

function saveToDatabase(pkg) {
    const cardsText = document.getElementById('cards-result').value;
    const cardsArray = cardsText.split('\n').filter(c => c.trim() !== "");
    
    try {
        // المسار هنا 'cards/' + pkg يطابق غالباً نظامك
        const dbRef = firebase.database().ref('cards/' + pkg);
        
        cardsArray.forEach(card => {
            dbRef.push({
                code: card,
                status: "available",
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        });
        
        showModernToast("✅ تم الحفظ، جاري تحديث الصفحة...");
        document.getElementById('preview-area').innerHTML = "";
        
        // تحديث الصفحة ليقرأ النظام الكروت الجديدة
        setTimeout(() => { location.reload(); }, 2000);
        
    } catch (error) {
        showModernToast("❌ خطأ: " + error.message);
    }
}

function showModernToast(message) {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#333';
    toast.style.color = '#fff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '20px';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '14px';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}
