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
            
            // في ملف الـ PDF الخاص بك، الأرقام تبدو كأرقام 8 خانات
            // سنقوم بالبحث عن أي نص يتكون من 8 أرقام فقط
            textContent.items.forEach(item => {
                let text = item.str.trim();
                
                // النمط الجديد: يبحث عن أرقام بطول 8 خانات بالضبط
                if (/^\d{8}$/.test(text)) {
                    // نتأكد أنها ليست من النصوص المكررة (مثل السعر 500)
                    if (text !== "500") {
                        firebase.database().ref('cards/available').push({
                            code: text,
                            packageId: packageId,
                            addedAt: Date.now(),
                            status: 'متوفر'
                        });
                        count++;
                    }
                }
            });
        }
        alert("تم استخراج " + count + " كارت بنجاح!");
    };
    reader.readAsArrayBuffer(file);
}
