// ميزات إضافية لـ TawasulNet
// 1. نظام الحذف التلقائي
function cleanOldSoldTickets() {
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    firebase.database().ref('cards').orderByChild('status').equalTo('تم البيع').once('value', snapshot => {
        snapshot.forEach(child => {
            if (now - child.val().soldAt > THREE_DAYS_MS) {
                child.ref.remove();
            }
        });
    });
}

// 2. نظام PDF
async function processUploadedPDF() {
    const file = document.getElementById('pdf-upload-input').files[0];
    if (!file) return alert("اختر ملف PDF!");
    const reader = new FileReader();
    reader.onload = async function() {
        const pdf = await pdfjsLib.getDocument(new Uint8Array(this.result)).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
            const text = await (await pdf.getPage(i)).getTextContent();
            text.items.forEach(item => {
                if (/^\d{8,14}$/.test(item.str.trim())) {
                    firebase.database().ref('cards/available').push({
                        code: item.str.trim(),
                        addedAt: Date.now(),
                        status: 'متوفر'
                    });
                }
            });
        }
        alert("تم استخراج الكروت!");
    };
    reader.readAsArrayBuffer(file);
}

// تشغيل تلقائي عند التحميل
window.addEventListener('load', () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) cleanOldSoldTickets();
    });
});
