// --- وظائف نظام المجموعات الجديد ---

// 1. إضافة كروت مع وسم التاريخ (يعمل تلقائياً عند حقن الكروت)
async function addCardsByBatch(packageId, cardsArray) {
    const db = firebase.database();
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '_'); 
    
    // حفظ الكروت تحت تاريخ اليوم لتسهيل حذف المجموعة لاحقاً
    const batchRef = db.ref(`packets/${packageId}/batches/${today}`);
    
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
    
    Swal.fire("تمت الإضافة", `تمت إضافة ${cardsArray.length} كرت تحت تاريخ ${today}`, "success");
}

// 2. دالة الحذف الجماعي لمجموعة كاملة حسب التاريخ
async function deleteBatch(packageId, dateString) {
    const db = firebase.database();
    
    Swal.fire({
        title: 'تنبيه',
        text: "هل تريد حذف كافة كروت هذه المجموعة بتاريخ " + dateString + "؟",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، حذف الكل'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const batchRef = db.ref(`packets/${packageId}/batches/${dateString}`);
            
            // جلب عدد الكروت أولاً لتحديث العداد
            batchRef.once('value', snapshot => {
                const count = snapshot.numChildren();
                batchRef.remove().then(() => {
                    const counterRef = db.ref(`tariffs/${packageId}/stock`);
                    counterRef.transaction(current => (current || 0) - count);
                    Swal.fire("تم الحذف", "تم حذف المجموعة وتحديث العداد", "success");
                });
            });
        }
    });
}

console.log("تم تحميل نظام المجموعات والحذف الجماعي بنجاح!");
