async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    const selectedPackage = document.getElementById('target-package').value;
    
    if (!fileInput.files[0]) return alert("يرجى اختيار ملف PDF!");
    
    previewArea.innerHTML = "جاري المعالجة...";
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

            // هذا هو النمط الذي كان يعمل ويستخرج الأرقام التي تبدأ بصفر أو أرقام عادية
            // مع إضافة شرط منع الأرقام التي تبدأ بـ 77 (أرقام الجوال)
            const regex = /\b(0\d{7,8}|[1-9]\d{5,8})\b/g;
            const matches = text.match(regex) || [];
            
            // تصفية النتائج: استبعاد أي رقم يبدأ بـ 77، والحصول على قيم فريدة فقط
            const uniqueCards = [...new Set(matches.filter(c => !c.startsWith("77")))];

            if (uniqueCards.length > 0) {
                previewArea.innerHTML = `
                    <p style="color:green;">تم استخراج ${uniqueCards.length} كرت للباقة ${selectedPackage}</p>
                    <textarea id="cards-result" style="width:100%; height:100px;">${uniqueCards.join("\n")}</textarea>
                    <button onclick="saveToDatabase('${selectedPackage}')" style="background:#28a745; color:white; width:100%; padding:10px; border:none; margin-top:10px;">حفظ الكروت في السيرفر</button>
                `;
            } else {
                previewArea.innerHTML = "<p style='color:red;'>لم يتم العثور على كروت! تأكد من محتوى الملف.</p>";
            }
        } catch (e) {
            previewArea.innerHTML = "حدث خطأ: " + e.message;
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}
