function initPDFReader() {
    const container = document.getElementById('admin-pdf-containers');
    
    // التأكد من أن الحاوية موجودة
    if (!container) {
        console.log("خطأ: لم يتم العثور على الحاوية admin-pdf-containers");
        return;
    }

    // بناء واجهة قارئ الـ PDF داخل الحاوية
    // نتحقق إذا كانت فارغة أولاً حتى لا تتكرر الأزرار عند الضغط المتكرر
    if (container.innerHTML.trim() === "") {
        container.innerHTML = `
            <div class="card" style="margin-top:20px; padding:15px; border:1px solid #ccc; background: #fff;">
                <h3 class="card-title">قارئ الكروت الذكي</h3>
                <input type="file" id="pdf-file" class="form-control" accept="application/pdf">
                <button class="btn btn-info" onclick="processPDF()" style="margin-top:10px;">استخراج الكروت</button>
                <div id="preview-area" style="margin:10px 0; background:#f9f9f9; padding:10px; min-height:50px; border-radius:5px;"></div>
                <button class="btn btn-success" id="btn-export" onclick="exportToDatabase()" style="margin-top:10px;">تصدير للسيرفر</button>
            </div>
        `;
    }
}
