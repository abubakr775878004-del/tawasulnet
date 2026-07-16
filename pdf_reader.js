// 1. دالة بناء واجهة القارئ (تشمل اختيار الباقة)
function initPDFReader() {
    const container = document.getElementById('admin-pdf-containers');
    if (container && container.innerHTML.trim() === "") {
        container.innerHTML = `
            <div class="card" style="margin:20px; padding:15px; border:2px dashed #007bff; border-radius:10px;">
                <h3 style="color:#007bff;">قارئ الكروت الذكي</h3>
                <input type="file" id="pdf-file" accept="application/pdf" style="margin-bottom:10px;">
                <button class="btn btn-primary" onclick="processPDF()">استخراج الكروت</button>
                
                <div style="margin-top:15px;">
                    <label>اختر الباقة للتصدير:</label>
                    <select id="target-package" class="form-control">
                        <option value="200">باقة 200</option>
                        <option value="500">باقة 500</option>
                        <option value="1000">باقة 1000</option>
                    </select>
                </div>
                
                <div id="preview-area" style="margin-top:10px; padding:10px; background:#f0f0f0;"></div>
                <button class="btn btn-success" id="btn-export" onclick="exportToDatabase()" style="margin-top:10px;">تصدير للسيرفر</button>
            </div>
        `;
    }
}

// 2. دالة استخراج الأرقام من الملف
async function processPDF() {
    const fileInput = document.getElementById('pdf-file');
    const previewArea = document.getElementById('preview-area');
    
    if (fileInput.files.length === 0) {
        alert("يرجى اختيار ملف PDF أولاً!");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            textContent.items.forEach(item => {
                fullText += item.str + " ";
            });
        }

        const matches = fullText.match(/\d{9,12}/g); 
        
        if (matches) {
            previewArea.innerHTML = "تم العثور على: " + matches.length + " كروت.<br>" + matches.join(", ");
            window.extractedCards = matches;
        } else {
            previewArea.innerHTML = "لم يتم العثور على أرقام كروت.";
        }
    };
    reader.readAsArrayBuffer(file);
}

// 3. دالة التصدير للسيرفر
function exportToDatabase() {
    const selectedPackage = document.getElementById('target-package').value;
    if (!window.extractedCards || window.extractedCards.length === 0) {
        alert("لا توجد كروت للاستخراج!");
        return;
    }
    alert("تم تصدير " + window.extractedCards.length + " كارت إلى باقة " + selectedPackage + " بنجاح!");
}

// 4. تفعيل القارئ عند الضغط على زر لوحة الإدارة
document.addEventListener('DOMContentLoaded', function() {
    const adminNavBtn = document.getElementById('admin-nav-btn');
    if (adminNavBtn) {
        adminNavBtn.addEventListener('click', function() {
            setTimeout(initPDFReader, 300);
        });
    }
});
