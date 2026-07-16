// هذا الكود يضمن ظهور الزر فوراً حتى لو حدث خطأ في القراءة
function initPDFReader() {
    const container = document.getElementById('admin-pdf-containers');
    if (!container) {
        console.log("حاوية admin-pdf-containers غير موجودة في الصفحة!");
        return;
    }
    
    container.innerHTML = `
        <div style="border: 2px dashed #007bff; padding: 15px; margin: 10px; border-radius: 10px;">
            <h3>قارئ الكروت الذكي</h3>
            <input type="file" id="pdf-file" accept="application/pdf">
            <br><br>
            <button onclick="processPDF()" style="background:#007bff; color:white; padding:10px; border:none; cursor:pointer;">استخراج الكروت</button>
            <div id="preview-area" style="margin-top:15px;"></div>
        </div>
    `;
}

// تشغيل الواجهة عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', initPDFReader);

// دالة المعالجة
async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    
    if (!fileInput.files[0]) return alert("يرجى اختيار ملف PDF!");
    
    previewArea.innerHTML = "جاري المعالجة...";
    const reader = new FileReader();

    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            // تأكد أن هذا الرابط يعمل في صفحتك
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const pg = await pdf.getPage(i);
                const content = await pg.getTextContent();
                content.items.forEach(item => text += item.str + " ");
            }

            // نمط البحث المحدث (يتجاهل 77)
            const cards = text.match(/\b([a-zA-Z]?(?!77)\d{8,9})\b/g);

            if (cards) {
                const uniqueCards = [...new Set(cards)]; 
                previewArea.innerHTML = `
                    <div style="margin-top:15px;">
                        <label>اختر الباقة:</label>
                        <select id="target-package" class="form-control">
                            <option value="200">باقة 200</option>
                            <option value="500">باقة 500</option>
                            <option value="1000">باقة 1000</option>
                        </select>
                        <p>تم العثور على ${uniqueCards.length} كارت:</p>
                        <textarea id="cards-result" style="width:100%; height:100px;">${uniqueCards.join("\n")}</textarea>
                        <button onclick="confirmExport()" style="background:green; color:white; width:100%; padding:10px; border:none;">تصدير للسيرفر</button>
                    </div>
                `;
                window.extractedCards = uniqueCards;
            } else {
                previewArea.innerHTML = "لم يتم العثور على كروت.";
            }
        } catch (e) {
            previewArea.innerHTML = "خطأ: " + e.message;
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

function confirmExport() {
    alert("تم تجهيز الكروت للتصدير!");
}
