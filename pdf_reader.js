// إضافة مكتبة قراءة PDF
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
document.head.appendChild(script);

function renderPDFReader() {
    const adminPanel = document.getElementById('tab-admin'); // استبدل بـ ID الحاوية في موقعك
    const readerDiv = document.createElement('div');
    readerDiv.className = "card";
    readerDiv.innerHTML = `
        <h3 class="card-title">قراءة كروت PDF احترافية</h3>
        <input type="file" id="pdf-file" accept="application/pdf" class="form-control">
        <select id="target-package" class="form-control"><option>جاري تحميل الباقات...</option></select>
        <button class="btn btn-info" onclick="processPDF()">استخراج ومعاينة الكروت</button>
        <div id="preview-area" style="margin-top:15px; max-height:200px; overflow-y:auto; background:#f8fafc; padding:10px;"></div>
        <button class="btn btn-success" id="btn-export" style="display:none;" onclick="exportToDatabase()">تصدير للسيرفر</button>
    `;
    adminPanel.appendChild(readerDiv);
}

async function processPDF() {
    const file = document.getElementById('pdf-file').files[0];
    const reader = new FileReader();
    reader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(s => s.str).join(" ");
        }
        
        // استخراج الكروت: 6-8 أرقام أو تبدأ بحرف إنجليزي
        const regex = /\b([a-zA-Z][a-zA-Z0-9]{5,7}|[0-9]{6,8})\b/g;
        const matches = fullText.match(regex) || [];
        
        document.getElementById('preview-area').innerText = matches.join('\n');
        document.getElementById('btn-export').style.display = "block";
    };
    reader.readAsArrayBuffer(file);
}

function exportToDatabase() {
    const codes = document.getElementById('preview-area').innerText.split('\n');
    const packageId = document.getElementById('target-package').value;
    // هنا تضع دالة الحقن (injectTickets) الخاصة بك
    codes.forEach(code => {
        if(code.trim()) injectTicketsManual(code.trim(), packageId);
    });
    alert("تم التصدير بنجاح!");
}
