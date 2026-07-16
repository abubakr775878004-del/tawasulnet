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
            
            // 1. المعاينة: رسم الصفحة الأولى
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 0.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;

            // 2. استخراج النصوص
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const pg = await pdf.getPage(i);
                const content = await pg.getTextContent();
                content.items.forEach(item => text += item.str + " ");
            }

            // 3. البحث الذكي (يستخرج [حرف + أرقام] أو [أرقام بدون 77 في البداية])
            const rawMatches = text.match(/[a-zA-Z]?\d{7,9}/g) || [];
            const uniqueCards = [...new Set(rawMatches)].filter(c => {
                if (c.startsWith("77")) return false; // تجاهل الجوال
                if (/[a-zA-Z]/.test(c)) return true;   // قبول أي شيء فيه حرف
                return c.length >= 8;                  // قبول الأرقام فقط إذا كان طولها 8 أو 9
            });

            if (uniqueCards.length > 0) {
                previewArea.innerHTML = `<strong>معاينة الملف:</strong><br>`;
                previewArea.appendChild(canvas);
                previewArea.innerHTML += `
                    <div style="margin-top:15px; border:1px solid #ccc; padding:10px;">
                        <label>اختر الباقة:</label>
                        <select id="target-package" class="form-control">
                            <option value="200">باقة 200</option>
                            <option value="500">باقة 500</option>
                            <option value="1000">باقة 1000</option>
                        </select>
                        <p>تم العثور على ${uniqueCards.length} كارت:</p>
                        <textarea id="cards-result" style="width:100%; height:100px;">${uniqueCards.join("\n")}</textarea>
                        <button onclick="confirmExport()" style="background:green; color:white; width:100%; padding:10px; border:none; margin-top:5px;">تصدير للسيرفر</button>
                    </div>
                `;
            } else {
                previewArea.innerHTML = "لم يتم العثور على كروت. تأكد من تطابق النمط.";
            }
        } catch (e) {
            previewArea.innerHTML = "خطأ في المعالجة: " + e.message;
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

function confirmExport() {
    const pkg = document.getElementById('target-package').value;
    const cards = document.getElementById('cards-result').value.split('\n');
    alert("تم تجهيز " + cards.length + " كارت لباقة " + pkg + " للتصدير.");
}
