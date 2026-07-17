async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    
    if (!fileInput.files[0]) {
        Swal.fire("تنبيه", "يرجى اختيار ملف PDF أولاً", "warning");
        return;
    }
    
    previewArea.innerHTML = "جاري استخراج الأرقام...";
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

            // استخراج الأرقام (نفس المنطق القديم)
            const regex = /\b(0\d{7,8}|[1-9]\d{5,8})\b/g;
            let matches = text.match(regex) || [];
            const uniqueCards = [...new Set(matches.filter(c => !c.startsWith("77")))];

            if (uniqueCards.length > 0) {
                previewArea.innerHTML = `
                    <div style="text-align: center; margin-top:10px;">
                        <p style="color:green; font-weight:bold;">تم استخراج ${uniqueCards.length} كرت</p>
                        <textarea id="cards-result" style="width:100%; height:200px; direction:ltr; text-align:left; border:1px solid #ccc; padding:10px; border-radius:5px;">${uniqueCards.join("\n")}</textarea>
                        <button id="copy-btn" style="background:#28a745; color:white; width:100%; padding:15px; border:none; border-radius:5px; margin-top:10px; cursor:pointer;">نسخ جميع الكروت</button>
                    </div>
                `;
                
                // إضافة وظيفة النسخ بضغطة زر
                document.getElementById('copy-btn').onclick = () => {
                    const textarea = document.getElementById('cards-result');
                    textarea.select();
                    document.execCommand('copy');
                    Swal.fire("تم النسخ", "الآن يمكنك لصق الكروت يدوياً في لوحة التحكم", "success");
                };
            } else {
                previewArea.innerHTML = "<p style='color:red;'>لم يتم العثور على أرقام كروت!</p>";
            }
        } catch (e) {
            Swal.fire("خطأ", "فشل في القراءة: " + e.message, "error");
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}
