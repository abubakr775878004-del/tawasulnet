async function processUploadedPDF(packageId) {
    const fileInput = document.getElementById('pdf-upload-input-' + packageId);
    const file = fileInput.files[0];
    if (!file) return alert("الرجاء اختيار ملف PDF!");
    
    const reader = new FileReader();
    reader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        
        console.log("تم تحميل الملف، عدد الصفحات: " + pdf.numPages);
        let foundTexts = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            textContent.items.forEach(item => {
                let text = item.str.trim();
                // نجمع النصوص هنا لنرى ما الذي يقرأه البرنامج
                if (text.length > 3) foundTexts.push(text);
            });
        }
        
        // عرض أول 50 نص وجدناه في "وحدة التحكم" لنعرف لماذا لا يتم السحب
        console.log("النصوص المستخرجة:", foundTexts);
        alert("تم فحص الملف! افتح وحدة تحكم المتصفح (Inspect) لرؤية النصوص المستخرجة.");
    };
    reader.readAsArrayBuffer(file);
}
