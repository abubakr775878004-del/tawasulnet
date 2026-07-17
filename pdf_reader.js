function saveToDatabase(pkg) {
    const cardsText = document.getElementById('cards-result').value;
    const cardsArray = cardsText.split('\n').filter(c => c.trim() !== "");
    
    try {
        // المسار هنا يجب أن يكون دقيقاً حسب القائمة المنسدلة
        // في نظام TawasulNet، المجلد الفرعي للباقة غالباً ما يكون هو الـ pkg نفسه
        const dbRef = firebase.database().ref('cards/' + pkg);
        
        cardsArray.forEach(card => {
            dbRef.push({
                code: card,
                status: "available", // هذا هو الشرط الذي يقرأه نظامك ليظهر الكرت
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        });
        
        showModernToast("✅ تم إضافة الكروت للباقة بنجاح");
        document.getElementById('preview-area').innerHTML = "";
        
        // تحديث الصفحة تلقائياً لتظهر الكروت الجديدة في قائمة الـ 19 كرت
        setTimeout(() => { location.reload(); }, 1000);
        
    } catch (error) {
        showModernToast("❌ خطأ: " + error.message);
    }
}
