// دالة بناء واجهة القارئ - تظهر تلقائياً في منطقة admin-pdf-containers
function initPDFReader() {
    const container = document.getElementById('admin-pdf-containers');
    if (!container) return;
    
    container.innerHTML = `
        <div style="border: 2px dashed #007bff; padding: 15px; margin: 10px; border-radius: 10px;">
            <h3>قارئ الكروت الذكي</h3>
            <input type="file" id="pdf-file" accept="application/pdf">
            <br><br>
            <button onclick="processPDF()" style="background:#007bff; color:white; padding:10px; border:none; cursor:pointer;">استخراج الكروت</button>
            <div id="preview-area" style="margin-top:15px; min-height:50px;"></div>
        </div>
    `;
}

// دالة قراءة الملف
async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    
    if (!fileInput.files[0]) return alert("يرجى اختيار ملف PDF!");
    
    previewArea.innerHTML = "جاري القراءة...";
    const reader = new FileReader();

    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                content.items.forEach(item => text += item.str + " ");
            }

            const cards = text.match(/\d{9,12}/g);
            if (cards) {
                previewArea.innerHTML = `تم العثور على ${cards.length} كارت:<br>
                <textarea style="width:100%; height:100px;">${cards.join("\n")}</textarea>`;
                window.extractedCards = cards;
            } else {
                previewArea.innerHTML = "لم يتم العثور على أرقام.";
            }
        } catch (e) {
            previewArea.innerHTML = "خطأ: " + e.message;
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

// تشغيل الواجهة عند تحميل الصفحة
window.onload = initPDFReader;
