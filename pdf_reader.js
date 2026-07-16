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
            
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                content.items.forEach(item => text += item.str + " ");
            }

            // النمط الجديد: يبحث عن حرف (اختياري) يتبعه 6 إلى 8 أرقام
            // [a-zA-Z]? = حرف واحد (كبير أو صغير) اختياري في البداية
            // \d{6,8} = من 6 إلى 8 أرقام
            // تم استبعاد النمط الذي يبدأ بـ 77 لمنع قراءة أرقام الهواتف
            const cards = text.match(/\b(?!(77)\d{7})[a-zA-Z]?\d{6,8}\b/g);

            if (cards) {
                previewArea.innerHTML = `
                    <div style="margin-bottom:10px;">
                        <label>اختر باقة التصدير:</label>
                        <select id="target-package" class="form-control">
                            <option value="200">باقة 200</option>
                            <option value="500">باقة 500</option>
                            <option value="1000">باقة 1000</option>
                        </select>
                    </div>
                    <textarea id="cards-result" style="width:100%; height:100px;">${cards.join("\n")}</textarea>
                    <button onclick="confirmExport()" style="background:green; color:white; margin-top:5px; width:100%;">تصدير للسيرفر</button>
                `;
                window.extractedCards = cards;
            } else {
                previewArea.innerHTML = "لم يتم العثور على كروت مطابقة.";
            }
        } catch (e) {
            previewArea.innerHTML = "خطأ: " + e.message;
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

// دالة التصدير النهائية
function confirmExport() {
    const pkg = document.getElementById('target-package').value;
    const cards = document.getElementById('cards-result').value;
    alert("تم تجهيز " + window.extractedCards.length + " كارت لباقة " + pkg);
    // هنا تضع كود إرسال البيانات لقاعدة بياناتك
}
