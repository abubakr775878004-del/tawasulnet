function saveToDatabase(pkg) {
    const cardsText = document.getElementById('cards-result').value;
    const cardsArray = cardsText.split('\n').filter(c => c.trim() !== "");
    
    try {
        // نستخدم المسار المباشر 'cards' فقط
        // وغالباً ما يكون هذا هو المسار الذي يراقبه تطبيقك
        const dbRef = firebase.database().ref('cards');
        
        cardsArray.forEach(card => {
            dbRef.push({
                code: card,
                package: pkg, // تخزين اسم الباقة داخل الكرت نفسه
                status: "available",
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        });
        
        showModernToast("✅ تم إضافة الكروت بنجاح");
        document.getElementById('preview-area').innerHTML = "";
        
    } catch (error) {
        showModernToast("❌ خطأ: " + error.message);
    }
}
