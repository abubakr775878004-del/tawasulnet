async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    
    if (fileInput.files.length === 0) {
        alert("يرجى اختيار ملف PDF أولاً!");
        return;
    }

    previewArea.innerHTML = "جاري القراءة... يرجى الانتظار...";

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            // التأكد من تحميل المكتبة
            if (typeof pdfjsLib === 'undefined') {
                throw new Error("مكتبة PDF غير محملة، تأكد من إضافة السكربت في tawasul.html");
            }
            
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                textContent.items.forEach(item => {
                    fullText += item.str + " ";
                });
            }

            // تعديل النمط للبحث عن الأرقام (تأكد أن أرقام كروتك هي من 9 إلى 12 رقماً)
            const matches = fullText.match(/\d{9,12}/g); 
            
            if (matches && matches.length > 0) {
                // عرض الكروت في منطقة المعاينة قبل التصدير
                previewArea.innerHTML = `
                    <div style="color:green;">تم العثور على ${matches.length} كارت:</div>
                    <textarea style="width:100%; height:100px; margin-top:5px;">${matches.join("\n")}</textarea>
                `;
                window.extractedCards = matches;
            } else {
                previewArea.innerHTML = "<span style='color:red;'>لم يتم العثور على أرقام. النص المستخرج:</span><br>" + fullText.substring(0, 200) + "...";
            }
        } catch (error) {
            previewArea.innerHTML = "خطأ في المعالجة: " + error.message;
        }
    };
    reader.readAsArrayBuffer(file);
}
