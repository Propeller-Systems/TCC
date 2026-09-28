const slider = document.getElementById("slider");
const documentosContainer = document.getElementById("documentos-container");
const btnDoc = document.getElementById("btnDoc");

if (slider && documentosContainer && btnDoc) {
    slider.addEventListener("change", function() {
        const isChecked = this.checked;
        const documentos = documentosContainer.querySelectorAll(".documento");
        
        if (!isChecked){
            btnDoc.classList.add("active");
        } else{
            btnDoc.classList.remove("active")
        }
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

async function carregarDocumentos() {
    const container = document.getElementById("documentos-container");

    if (!container) return;
    container.innerHTML = `<p>Carregando documentos...</p>`;

    try {
        const response = await fetch("/api/doc");

        if (!response.ok) {
            throw new Error("Erro ao buscar documentos");
        }

        const documentos = await response.json();
        if (documentos.length === 0) {
            container.innerHTML = `<p>Nenhum documento encontrado.</p>`;
            return;
        }
        container.innerHTML = "";
        documentos.forEach(documento => {
            const elemento = criarDocumentoHTML(documento);
            container.appendChild(elemento);

        });

    } catch (error) {
        console.error("Erro ao carregar documentos:", error);
        container.innerHTML = `<p>Erro ao carregar documentos.</p>`;
    }
}


function criarDocumentoHTML(documento) {
    const div = document.createElement("div");
    div.className = "documento enviado active";

    div.innerHTML = `
        <div class="doc-icon">
            <img src="icons/pdf-icon.png">
        </div>

        <div>
            <h3>${documento.titulo}</h3>

            <p>${documento.texto}</p>
        </div>

        <button 
            type="button"
            class="btnOptions btn btn-secondary"
            onclick="abrirOpcaoDocumentos(${documento.iddocumento})">

            <img 
                src="icons/options.png"
                alt="opções">
        </button>`
        ;
    return div;
}

carregarDocumentos();