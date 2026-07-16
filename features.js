document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('admin-pdf-containers');
    if (container) {
        container.innerHTML = `
            <div style="margin: 15px 0; text-align: center;">
                <a href="رابط_ملفك.pdf" target="_blank" 
                   style="display: block; padding: 12px; background-color: #007bff; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                   📄 قراءة ملف الـ PDF
                </a>
            </div>
        `;
    }
});

