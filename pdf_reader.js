async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    
    if (!fileInput.files[0]) {
        Swal.fire("تنبيه", "يرجى اختيار ملف PDF أولاً", "warning");
        return;
    }
    
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
                // إظهار نافذة منبثقة احترافية تحتوي على جميع الأكواد
                Swal.fire({
                    title: 'تم استخراج ' + uniqueCards.length + ' كرت',
                    html: `<textarea id="cards-textarea" style="width:100%; height:300px; font-family:monospace; direction:ltr; text-align:left;">${uniqueCards.join("\n")}</textarea>`,
                    confirmButtonText: 'نسخ الأكواد',
                    didOpen: () => {
                        document.getElementById('cards-textarea').select();
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        const copyText = document.getElementById("cards-textarea");
                        copyText.select();
                        document.execCommand("copy");
                        Swal.fire("تم النسخ!", "الآن يمكنك لصق الأكواد في النظام.", "success");
                    }
                });
            } else {
                Swal.fire("خطأ", "لم يتم العثور على أرقام كروت!", "error");
            }
        } catch (e) {
            Swal.fire("خطأ", "فشل في القراءة: " + e.message, "error");
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}
