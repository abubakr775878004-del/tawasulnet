// هذا الكود مسؤول عن إضافة الكروت بنظام المجموعات والتاريخ
async function addCardsByBatch(packageId, cardsArray) {
    const db = firebase.database();
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '_'); 
    
    // إنشاء مسار المجموعة بناءً على التاريخ
    const batchRef = db.ref(`packets/${packageId}/batches/${today}`);
    
    // إضافة الكروت
    for (let card of cardsArray) {
        await batchRef.push({
            code: card,
            status: "available",
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
    }

    // تحديث العداد
    const counterRef = db.ref(`tariffs/${packageId}/stock`);
    counterRef.transaction(current => (current || 0) + cardsArray.length);
    
    Swal.fire("تمت الإضافة", `تمت إضافة ${cardsArray.length} كرت بنظام المجموعات بتاريخ ${today}`, "success");
}

// دالة لحذف مجموعة كروت حسب التاريخ
async function deleteBatch(packageId, dateString) {
    const db = firebase.database();
    const batchRef = db.ref(`packets/${packageId}/batches/${dateString}`);
    
    Swal.fire({
        title: 'هل أنت متأكد؟',
        text: "سيتم حذف كامل المجموعة بتاريخ " + dateString,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، احذفها'
    }).then(async (result) => {
        if (result.isConfirmed) {
            await batchRef.remove();
            Swal.fire("تم الحذف", "تم حذف المجموعة بنجاح", "success");
        }
    });
}
