async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    
    if (!fileInput || fileInput.files.length === 0) {
        alert("يرجى اختيار ملف PDF أولاً!");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            
            // تهيئة المكتبة التي أضفناها في السطر 11
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let text = "";
            
            // قراءة كل صفحات الملف
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                content.items.forEach(item => text += item.str + " ");
            }

            // استخراج الأرقام (الكروت)
            const cards = text.match(/\d{9,12}/g); 
            
            if (cards) {
                previewArea.innerHTML = `تم العثور على ${cards.length} كارت:<br>
                <textarea style="width:100%; height:150px;">${cards.join("\n")}</textarea>`;
                window.extractedCards = cards; // حفظ الكروت في الذاكرة للتصدير
            } else {
                previewArea.innerHTML = "لم يتم العثور على أرقام. تأكد أن الملف يحتوي على نص.";
            }
        } catch (err) {
            previewArea.innerHTML = "خطأ في قراءة الملف: " + err.message;
        }
    };
    reader.readAsArrayBuffer(file);
}
