async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    
    if (!fileInput.files[0]) return alert("يرجى اختيار ملف PDF!");
    
    previewArea.innerHTML = "جاري المعالجة...";
    const reader = new FileReader();

    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            
            // قراءة النصوص من جميع الصفحات
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const pg = await pdf.getPage(i);
                const content = await pg.getTextContent();
                content.items.forEach(item => text += item.str + " ");
            }

            // --- هذا هو التعديل الجديد والمهم ---
            // يقوم بالبحث عن كرت (بحرف أو بدون) ومكون من 8 أو 9 أرقام 
            // بشرط ألا يبدأ الرقم بـ 77 (لتجنب رقم الجوال)
            const cards = text.match(/\b([a-zA-Z]?(?!77)\d{8,9})\b/g);

            if (cards) {
                // إزالة التكرارات
                const uniqueCards = [...new Set(cards)]; 
                
                previewArea.innerHTML = `
                    <div style="margin-top:15px; padding:10px; border:1px solid #ddd;">
                        <label>اختر الباقة:</label>
                        <select id="target-package" class="form-control">
                            <option value="200">باقة 200</option>
                            <option value="500">باقة 500</option>
                            <option value="1000">باقة 1000</option>
                        </select>
                        <p>تم العثور على ${uniqueCards.length} كارت:</p>
                        <textarea id="cards-result" style="width:100%; height:150px;">${uniqueCards.join("\n")}</textarea>
                        <button onclick="confirmExport()" style="background:green; color:white; width:100%; padding:10px; border:none; margin-top:10px;">تصدير للسيرفر</button>
                    </div>
                `;
                window.extractedCards = uniqueCards;
            } else {
                previewArea.innerHTML = "<p style='color:red;'>لم يتم العثور على كروت. تأكد من الملف!</p>";
            }
        } catch (e) {
            previewArea.innerHTML = "خطأ في المعالجة: " + e.message;
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}
