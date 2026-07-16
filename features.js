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
                
                // النمط: حرف إنجليزي واحد (كبير أو صغير) اختياري، يليه من 6 إلى 8 أرقام
                const isCard = /^[a-zA-Z]?\d{6,8}$/.test(text);
                
                // استبعاد أرقام الجوالات (تبدأ بـ 77 أو 73)
                const isPhone = text.startsWith('77') || text.startsWith('73');
                
                // استبعاد أرقام الأسعار المحددة
                const isPrice = (text === '1000' || text === '500' || text === '200' || text === '300');

                // إذا كان النص يطابق نمط الكرت وليس جوالاً ولا سعراً
                if (isCard && !isPhone && !isPrice) {
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
