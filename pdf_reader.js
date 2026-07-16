// دالة عرض معاينة الصفحة الأولى كصورة
async function previewPDFPage(pdf) {
    const previewArea = document.getElementById('preview-area');
    const page = await pdf.getPage(1); // عرض الصفحة الأولى فقط
    const viewport = page.getViewport({ scale: 0.5 }); // تصغير الصورة لتناسب الشاشة
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    previewArea.innerHTML = "<strong>معاينة الصفحة الأولى:</strong><br>";
    previewArea.appendChild(canvas);

    await page.render({ canvasContext: context, viewport: viewport }).promise;
}

// تعديل دالة processPDF لتشمل المعاينة
async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    
    if (fileInput.files.length === 0) {
        alert("يرجى اختيار ملف PDF أولاً!");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;

        // 1. عرض الصورة أولاً
        await previewPDFPage(pdf);

        // 2. استخراج النصوص (كما في السابق)
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            textContent.items.forEach(item => { fullText += item.str + " "; });
        }

        const matches = fullText.match(/\d{9,12}/g);
        if (matches) {
            previewArea.innerHTML += `
                <div style="margin-top:10px;">
                    <p style="color:green;">تم العثور على ${matches.length} كارت:</p>
                    <textarea style="width:100%; height:80px;">${matches.join("\n")}</textarea>
                </div>
            `;
            window.extractedCards = matches;
        }
    };
    reader.readAsArrayBuffer(file);
}
