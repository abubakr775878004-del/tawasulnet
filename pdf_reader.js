async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    
    if (fileInput.files.length === 0) {
        alert("يرجى اختيار ملف PDF أولاً!");
        return;
    }

    // 1. إظهار مؤشر التحميل
    previewArea.innerHTML = "جاري معالجة الملف، يرجى الانتظار...";

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;

            // 2. المعاينة (عرض الصفحة الأولى كصورة)
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 0.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            previewArea.innerHTML = "<strong>معاينة الصفحة الأولى:</strong><br>";
            previewArea.appendChild(canvas);
            await page.render({ canvasContext: context, viewport: viewport }).promise;

            // 3. استخراج النصوص
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const pg = await pdf.getPage(i);
                const textContent = await pg.getTextContent();
                textContent.items.forEach(item => { fullText += item.str + " "; });
            }

            const matches = fullText.match(/\d{9,12}/g);
            if (matches) {
                previewArea.innerHTML += `
                    <div style="margin-top:15px;">
                        <p style="color:green;">تم العثور على ${matches.length} كارت:</p>
                        <textarea style="width:100%; height:80px; border:1px solid #ccc;">${matches.join("\n")}</textarea>
                    </div>
                `;
                window.extractedCards = matches;
            } else {
                previewArea.innerHTML += "<p style='color:red;'>لم يتم العثور على أرقام داخل النص.</p>";
            }

        } catch (error) {
            previewArea.innerHTML = "خطأ أثناء قراءة الملف: " + error.message;
        }
    };
    reader.readAsArrayBuffer(file);
}
