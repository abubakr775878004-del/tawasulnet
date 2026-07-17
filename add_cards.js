// دالة عرض الكروت مرتبة بالتاريخ مع خيارات الحذف الجماعي
async function displayGroupedCards(packageId) {
    const db = firebase.database();
    const container = document.getElementById('cards-results'); // المكان الذي تظهر فيه الكروت حالياً
    container.innerHTML = "جاري تحميل المجموعات...";

    db.ref(`packets/${packageId}/batches`).on('value', snapshot => {
        container.innerHTML = ""; // مسح القديم
        const batches = snapshot.val();

        if (!batches) {
            container.innerHTML = "<p>لا توجد كروت في هذه الباقة.</p>";
            return;
        }

        Object.keys(batches).forEach(date => {
            const batch = batches[date];
            const batchDiv = document.createElement('div');
            batchDiv.style.border = "1px solid #ccc";
            batchDiv.style.margin = "10px 0";
            batchDiv.style.padding = "10px";

            batchDiv.innerHTML = `
                <div style="background:#f4f4f4; padding:5px; display:flex; justify-content:space-between;">
                    <strong>مجموعة تاريخ: ${date.replace(/_/g, '-')}</strong>
                    <button onclick="deleteBatch('${packageId}', '${date}')" style="color:red;">حذف المجموعة كاملة</button>
                </div>
            `;

            // عرض الكروت داخل المجموعة
            Object.keys(batch).forEach(cardKey => {
                const card = batch[cardKey];
                const cardDiv = document.createElement('div');
                cardDiv.innerHTML = `
                    <input type="checkbox" class="card-checkbox" value="${cardKey}">
                    ${card.code} 
                    <button onclick="deleteSingleCard('${packageId}', '${date}', '${cardKey}')">حذف</button>
                `;
                batchDiv.appendChild(cardDiv);
            });
            container.appendChild(batchDiv);
        });
    });
}

// دالة لحذف كرت واحد داخل المجموعة
async function deleteSingleCard(packageId, date, cardKey) {
    firebase.database().ref(`packets/${packageId}/batches/${date}/${cardKey}`).remove();
    // تحديث العداد
    firebase.database().ref(`tariffs/${packageId}/stock`).transaction(c => (c || 0) - 1);
}
