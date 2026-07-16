// 1. تحميل المكتبة برمجياً لضمان عملها
if (!window.pdfjsLib) {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    document.head.appendChild(script);
}

// 2. دالة المعالجة الرئيسية
async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    
    if (fileInput.files.length === 0) {
        alert("يرجى اختيار ملف PDF أولاً!");
        return;
    }

    previewArea.innerHTML = "جاري التحميل والمعالجة...";

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function() {
        try {
            // انتظار تحميل المكتبة
            const pdf = await pdfjsLib.getDocument({data: new Uint8Array(this.result)}).promise;
            
            // معاينة الصفحة الأولى
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({scale: 0.5});
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            previewArea.innerHTML = "<strong>المعاينة:</strong><br>";
            previewArea.appendChild(canvas);
            await page.render({canvasContext: context, viewport: viewport}).promise;

            // استخراج النصوص
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const pg = await pdf.getPage(i);
                const textContent = await pg.getTextContent();
                textContent.items.forEach(item => { fullText += item.str + " "; });
            }

            const matches = fullText.match(/\d{9,12}/g); // يبحث عن أرقام من 9 إلى 12 خانة
            if (matches) {
                previewArea.innerHTML += `<p>تم العثور على ${matches.length} كارت:</p>
                <textarea style="width:100%; height:80px;">${matches.join("\n")}</textarea>`;
                window.extractedCards = matches;
            } else {
                previewArea.innerHTML += "<p style='color:red;'>لم يتم العثور على كروت نصية في الملف.</p>";
            }
        } catch (e) {
            previewArea.innerHTML = "حدث خطأ: " + e.message;
        }
    };
    reader.readAsArrayBuffer(file);
}
