// 1. إضافة مكتبة pdf.js للمشروع ديناميكياً
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
document.head.appendChild(script);

// 2. دالة لجلب الباقات وتهيئة الواجهة
function setupPDFInterface() {
    const container = document.getElementById('admin-pdf-containers');
    if (!container) return;

    container.innerHTML = `
        <div style="background: #f5f5f9; padding: 15px; border-radius: 10px; border: 1px solid #ddd; margin-bottom: 20px;">
            <h5 style="margin-top:0;">استخراج الكروت من PDF</h5>
            <input type="file" id="pdf-input" accept="application/pdf" style="width: 100%; margin-bottom: 10px;">
            <select id="target-package-select" class="form-control" style="margin-bottom: 10px;">
                <option value="">اختر الباقة...</option>
            </select>
            <button class="btn btn-success" style="width: 100%;" onclick="processPDF()">استخراج وحقن الكروت</button>
        </div>
    `;

    // ملء الباقات تلقائياً من الصفحة
    const packageOptions = document.querySelectorAll('.card-title');
    const select = document.getElementById('target-package-select');
    packageOptions.forEach(el => {
        if(el.innerText.includes('باقة')) {
            select.innerHTML += `<option value="${el.innerText}">${el.innerText}</option>`;
        }
    });
}

// 3. دالة معالجة الملف واستخراج النصوص
async function processPDF() {
    const fileInput = document.getElementById('pdf-input');
    const file = fileInput.files[0];
    if (!file) { alert("يرجى اختيار ملف PDF أولاً"); return; }

    const reader = new FileReader();
    reader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(s => s.str).join("\n");
        }

        // هنا نقوم "بحقن" النصوص في المربع الخاص بك في الصفحة
        // ملاحظة: تأكد من أن id المربع في صفحتك هو 'admin-direct-quantity' أو غيره حسب ما تستخدمه
        const targetInput = document.querySelector('textarea, input[type="text"]'); 
        if (targetInput) {
            targetInput.value = fullText;
            alert("تم استخراج الكروت بنجاح وحقنها في مربع الإدخال!");
        }
    };
    reader.readAsArrayBuffer(file);
}

document.addEventListener('DOMContentLoaded', setupPDFInterface);
