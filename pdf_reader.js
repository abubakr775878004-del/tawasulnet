async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    // هذا هو المربع الذي سيظهر فيه النتائج
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

            const regex = /\b(0\d{7,8}|[1-9]\d{5,8})\b/g;
            let matches = text.match(regex) || [];
            const uniqueCards = [...new Set(matches.filter(c => !c.startsWith("77")))];

            if (uniqueCards.length > 0) {
                // هنا نقوم بإنشاء مربع النص بنفس الشكل الذي طلبته
                previewArea.innerHTML = `
                    <p style="text-align:center; color:green; font-weight:bold;">تم استخراج ${uniqueCards.length} كرت</p>
                    <textarea id="cards-output" style="width:100%; height:200px; padding:10px; border:1px solid #ccc; border-radius:5px; font-family:monospace; direction:ltr; text-align:left;">${uniqueCards.join("\n")}</textarea>
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
