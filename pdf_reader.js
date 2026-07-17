function saveToDatabase(pkg) {
    const cardsText = document.getElementById('cards-result').value;
    const cardsArray = cardsText.split('\n').filter(c => c.trim() !== "");
    
    try {
        // المسار الجديد: قد يكون اسم الباقة هو المجلد الرئيسي في Firebase
        // مثال: إذا كانت الباقة "500"، المسار سيكون 'packages/500'
        const dbRef = firebase.database().ref('packages/' + pkg);
        
        cardsArray.forEach(card => {
            dbRef.push({
                code: card,
                status: "available",
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        });
        
        showModernToast("✅ تم الحفظ في الباقة: " + pkg);
        document.getElementById('preview-area').innerHTML = "";
        
    } catch (error) {
        showModernToast("❌ خطأ: " + error.message);
    }
}
