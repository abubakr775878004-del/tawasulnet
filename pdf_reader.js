// هذا الكود يراقب المتصفح ذاتياً ولا يحتاج تعديل ملف HTML
document.addEventListener('DOMContentLoaded', function() {
    const adminNavBtn = document.getElementById('admin-nav-btn');
    if (adminNavBtn) {
        adminNavBtn.addEventListener('click', function() {
            // ننتظر جزءاً من الثانية حتى يفتح التبويب ثم نبني الواجهة
            setTimeout(function() {
                const container = document.getElementById('admin-pdf-containers');
                if (container && container.innerHTML.trim() === "") {
                    container.innerHTML = `
                        <div class="card" style="margin:20px; padding:15px; border:2px dashed #007bff; border-radius:10px;">
                            <h3 style="color:#007bff;">قارئ الكروت الذكي</h3>
                            <input type="file" id="pdf-file" accept="application/pdf" style="margin-bottom:10px;">
                            <button class="btn btn-primary" onclick="processPDF()">استخراج الكروت من PDF</button>
                            <div id="preview-area" style="margin-top:10px; padding:10px; background:#f0f0f0;"></div>
                        </div>
                    `;
                }
            }, 300);
        });
    }
});
