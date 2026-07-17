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

            // استخراج الأرقام
            const regex = /\b(0\d{7,8}|[1-9]\d{5,8})\b/g;
            let matches = text.match(regex) || [];
            const uniqueCards = [...new Set(matches.filter(c => !c.startsWith("77")))];

            if (uniqueCards.length > 0) {
                // عرض الأرقام في مربع نصي ليتم نسخها يدوياً
                previewArea.innerHTML = `
                    <div style="margin-top:20px; text-align:right;">
                        <p style="color:green; font-weight:bold;">تم استخراج ${uniqueCards.length} كرت:</p>
                        <textarea id="cards-list" style="width:100%; height:250px; direction:ltr; padding:10px; border-radius:8px; border:1px solid #ccc; font-family:monospace;">${uniqueCards.join("\n")}</textarea>
                        <button onclick="copyCards()" style="background:#059669; color:white; width:100%; padding:12px; border:none; border-radius:8px; margin-top:10px; cursor:pointer;">نسخ الأكواد</button>
                    </div>
                `;
            } else {
                previewArea.innerHTML = "<p style='color:red;'>لم يتم العثور على أرقام كروت!</p>";
            }
        } catch (e) {
            Swal.fire("خطأ", "فشل في القراءة: " + e.message, "error");
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

// دالة النسخ
function copyCards() {
    const textarea = document.getElementById('cards-list');
    textarea.select();
    document.execCommand('copy');
    Swal.fire("تم النسخ", "تم نسخ جميع الأرقام، الآن يمكنك لصقها يدوياً في النظام.", "success");
}
