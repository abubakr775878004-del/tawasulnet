async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    
    if (!fileInput.files[0]) return alert("يرجى اختيار ملف PDF!");
    
    previewArea.innerHTML = "جاري المعالجة وعرض المعاينة...";
    const reader = new FileReader();

    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            
            // 1. المعاينة: رسم الصفحة الأولى كصورة
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 0.6 }); // تكبير المعاينة قليلاً
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            previewArea.innerHTML = "<strong>معاينة الملف:</strong><br>";
            previewArea.appendChild(canvas);
            await page.render({ canvasContext: context, viewport: viewport }).promise;

            // 2. استخراج الكروت
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const pg = await pdf.getPage(i);
                const content = await pg.getTextContent();
                content.items.forEach(item => text += item.str + " ");
            }

            // نمط البحث الذكي
            const cards = text.match(/\b(?!(77)\d{7})[a-zA-Z]?\d{6,8}\b/g);

            if (cards) {
                previewArea.innerHTML += `
                    <div style="margin-top:15px; border-top:1px solid #ccc; padding-top:10px;">
                        <label>اختر باقة التصدير:</label>
                        <select id="target-package" class="form-control">
                            <option value="200">باقة 200</option>
                            <option value="500">باقة 500</option>
                            <option value="1000">باقة 1000</option>
                        </select>
                        <p>تم العثور على ${cards.length} كارت:</p>
                        <textarea id="cards-result" style="width:100%; height:80px;">${cards.join("\n")}</textarea>
                        <button onclick="confirmExport()" style="background:green; color:white; padding:10px; border:none; width:100%; margin-top:5px;">تصدير للسيرفر</button>
                    </div>
                `;
                window.extractedCards = cards;
            } else {
                previewArea.innerHTML += "<p style='color:red;'>لم يتم العثور على كروت مطابقة.</p>";
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
    alert("تم تجهيز " + cards.length + " كارت لتصديرها إلى باقة: " + pkg);
    // هنا سيتم إضافة كود الربط مع Firebase لاحقاً
}
