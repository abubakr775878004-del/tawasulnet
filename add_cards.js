// دالة إضافة كروت مع وسم التاريخ
async function addNewCardBatch(packageId, cardsArray) {
    const db = firebase.database();
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '_'); // النتيجة: 2026_07_17
    
    // إنشاء مسار المجموعة بناءً على التاريخ
    const batchRef = db.ref(`packets/${packageId}/batches/${today}`);
    
    // إرسال الكروت تحت هذا التاريخ
    const promises = cardsArray.map(card => {
        return batchRef.push({
            code: card,
            status: "available",
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
    });

    await Promise.all(promises);
    
    // تحديث العداد الإجمالي (كما فعلنا سابقاً)
    const counterRef = db.ref(`tariffs/${packageId}/stock`);
    await counterRef.transaction(current => (current || 0) + cardsArray.length);
    
    Swal.fire("تمت الإضافة", `تمت إضافة ${cardsArray.length} كرت تحت تاريخ اليوم ${today}`, "success");
}
