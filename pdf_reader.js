function saveToDatabase(pkg) {
    const cardsText = document.getElementById('cards-result').value;
    const cardsArray = cardsText.split('\n').filter(c => c.trim() !== "");
    
    if (cardsArray.length === 0) return;
    
    // سنقوم بتجربة المسار الأكثر احتمالاً في أنظمة تواصل نت:
    // إذا كنت ترى الكروت في صفحتك، فالمسار هو المسؤول عن إظهارها.
    // جرب هذا المسار الذي يربط بين الباقة ونوع البيانات:
    const targetPath = 'packages/' + pkg; 
    const dbRef = firebase.database().ref(targetPath);
    
    try {
        // بدلاً من 'push' (التي تنشئ مساراً جديداً)، سنستخدم 'update' 
        // لنرى هل ستظهر الكروت في المسار الذي تستخدمه الباقة فعلياً
        let updates = {};
        cardsArray.forEach((card, index) => {
            updates['cards/' + index] = {
                code: card,
                status: 'available'
            };
        });
        
        dbRef.update(updates).then(() => {
            alert("✅ تم تنفيذ محاولة حفظ إلى: " + targetPath + "\nتحقق من Firebase الآن!");
        });
        
    } catch (error) {
        alert("❌ خطأ: " + error.message);
    }
}
