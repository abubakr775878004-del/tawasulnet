async function processUploadedPDF(packageId) {
    const fileInput = document.getElementById('pdf-upload-input-' + packageId);
    const file = fileInput.files[0];
    if (!file) return alert("الرجاء اختيار ملف PDF!");
    
    const reader = new FileReader();
    reader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let count = 0;
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            textContent.items.forEach(item => {
                let text = item.str.trim();
                
                // 1. يجب أن يكون طول النص بين 6 و 8 أرقام
                // 2. يجب ألا يبدأ النص بـ 77 (لأن هذا رقم الجوال)
                if (/^\d{6,8}$/.test(text) && !text.startsWith('77')) {
                    firebase.database().ref('cards/available').push({
                        code: text,
                        packageId: packageId,
                        addedAt: Date.now(),
                        status: 'متوفر'
                    });
                    count++;
                }
            });
        }
        alert("تم استخراج " + count + " كارت بنجاح!");
    };
    reader.readAsArrayBuffer(file);
}
