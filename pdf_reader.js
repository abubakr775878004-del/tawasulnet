// 1. استدعاء مكتبة PDF.js
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
document.head.appendChild(script);

// 2. دالة تشغيل القارئ عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', (event) => {
    const container = document.getElementById('admin-pdf-containers');
    if (container) {
        renderPDFReader(); 
    }
});

// 3. دالة بناء الواجهة
function renderPDFReader() {
    const container = document.getElementById('admin-pdf-containers');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card" style="margin-top:20px; padding:15px; border:1px solid #ccc;">
            <h3 class="card-title">قراءة كروت PDF احترافية</h3>
            <input type="file" id="pdf-file" class="form-control" accept="application/pdf">
            <button class="btn btn-info" onclick="processPDF()">استخراج الكروت</button>
            <div id="preview-area" style="margin:10px 0; background:#f0f0f0; padding:10px; min-height:50px;"></div>
            <button class="btn btn-success" id="btn-export" onclick="exportToDatabase()">تصدير للسيرفر</button>
        </div>
    `;
}

// 4. باقي الدوال (processPDF, exportToDatabase) كما كتبناها سابقاً...
