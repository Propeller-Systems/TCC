const slider = document.getElementById("slider");
const documentosContainer = document.getElementById("documentos-container");

if (slider && documentosContainer) {
    slider.addEventListener("change", function() {
        const isChecked = this.checked;
        const documentos = documentosContainer.querySelectorAll(".documento");
        
        documentos.forEach(doc => {
            if (isChecked) {
                // Mostrar atestados, esconder enviados
                if (doc.classList.contains("atestado")) {
                    doc.classList.add("active");
                } else if (doc.classList.contains("enviado")) {
                    doc.classList.remove("active");
                }
            } else {
                // Mostrar enviados, esconder atestados
                if (doc.classList.contains("enviado")) {
                    doc.classList.add("active");
                } else if (doc.classList.contains("atestado")) {
                    doc.classList.remove("active");
                }
            }
        });
    });
}