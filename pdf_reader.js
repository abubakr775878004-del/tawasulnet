async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    
    if (!fileInput.files[0]) {
        Swal.fire("تنبيه", "يرجى اختيار ملف PDF أولاً", "warning");
        return;
    }
    
    // إشعار بالانتظار
    Swal.fire({ title: 'جاري القراءة...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

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
                // إزالة أي مربع سابق إذا كان موجوداً لمنع التكرار
                const oldOutput = document.getElementById('cards-output-container');
                if (oldOutput) oldOutput.remove();

                // إنشاء حاوية جديدة للمربع
                const container = document.createElement('div');
                container.id = 'cards-output-container';
                container.style.marginTop = "20px";
                
                container.innerHTML = `
                    <p style="text-align:center; font-weight:bold; color: #059669;">تم استخراج ${uniqueCards.length} كرت</p>
                    <textarea id="cards-output" style="width:100%; height:250px; padding:10px; border:2px solid #059669; border-radius:8px; font-family:monospace; direction:ltr; text-align:left;">${uniqueCards.join("\n")}</textarea>
                    <button onclick="document.getElementById('cards-output').select(); document.execCommand('copy'); Swal.fire('تم النسخ', 'الأرقام في الحافظة الآن', 'success');" style="margin-top:10px; width:100%; padding:10px; background:#059669; color:white; border:none; border-radius:5px; cursor:pointer;">تحديد الكل ونسخ</button>
                `;
                
                // إضافة المربع إلى الصفحة (تحت زر استخراج الكروت مباشرة)
                const targetElement = document.getElementById('pdf-file').parentNode.parentNode;
                targetElement.appendChild(container);
                
                Swal.close();
            } else {
                Swal.fire("خطأ", "لم يتم العثور على أرقام كروت!", "error");
            }
        } catch (e) {
            Swal.fire("خطأ", "فشل في القراءة: " + e.message, "error");
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}
