async function processUploadedPDF(packageId) { // أضفنا packageId لنعرف لأي باقة يتم الرفع
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
                // نعدل النمط ليقبل أي أرقام من 8 إلى 14 خانة
                if (/^\d{8,14}$/.test(text)) {
                    firebase.database().ref('cards/available').push({
                        code: text,
                        packageId: packageId, // إضافة معرف الباقة هنا
                        addedAt: Date.now(),
                        status: 'متوفر'
                    });
                    count++;
                }
            });
        }
        alert("تم استخراج " + count + " كارت وإضافتها للباقة بنجاح!");
    };
    reader.readAsArrayBuffer(file);
}
