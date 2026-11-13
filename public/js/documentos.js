const slider = document.getElementById("slider");
const documentosContainer = document.getElementById("documentos-container");
const btnDoc = document.getElementById("btnDoc");
let documentosCarregados = [];

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
    if (!documentosContainer) return;

    documentosContainer.innerHTML = "<p>Carregando documentos...</p>";

    try {
        const response = await fetch("/api/doc");

        if (!response.ok) {
            throw new Error("Erro ao buscar documentos");
        }

        documentosCarregados = await response.json();

        if (documentosCarregados.length === 0) {
            documentosContainer.innerHTML =
                "<p>Nenhum documento encontrado.</p>";
            return;
        }

        documentosContainer.innerHTML = "";

        documentosCarregados.forEach(documento => {
            const elemento = criarDocumentoHTML(documento);

            elemento.dataset.id = documento.iddocumento;
            elemento.style.cursor = "pointer";

            documentosContainer.appendChild(elemento);
        });

    } catch (error) {
        console.error("Erro ao carregar documentos:", error);
        documentosContainer.innerHTML =
            "<p>Erro ao carregar documentos.</p>";
    }
}

function fecharMenusDocumentos() {
    document.querySelectorAll(".documento .dropdown-box").forEach(menu => {
        menu.classList.remove("show");
    });
}

function criarDocumentoHTML(documento) {
    const div = document.createElement("div");
    div.className = "documento enviado active";
    div.dataset.id = documento.iddocumento;

    div.innerHTML = `
        <div class="doc-icon">
            <img src="icons/pdf-icon.png" alt="Documento">
        </div>

        <div>
            <h3>${documento.titulo}</h3>
            <p>${documento.texto}</p>
        </div>

        <div class="doc-actions">
            <button
                type="button"
                class="btnOptions btn btn-secondary"
                aria-label="Opções do documento"
                data-id="${documento.iddocumento}">
                <img src="icons/options.png" alt="opções">
            </button>

            <div class="dropdown-box" role="menu" aria-label="Menu de opções do documento">
                <button type="button" class="dropdown-item" data-action="editar" data-id="${documento.iddocumento}">Editar</button>
                <button type="button" class="dropdown-item danger" data-action="excluir" data-id="${documento.iddocumento}">Excluir</button>
            </div>
        </div>`;

    return div;
}

function abrirOpcaoDocumentos(id) {
    const item = document.querySelector(`.documento[data-id="${id}"]`);

    if (!item) return;

    const menu = item.querySelector(".dropdown-box");

    if (!menu) return;

    const abrir = !menu.classList.contains("show");
    fecharMenusDocumentos();

    if (abrir) {
        menu.classList.add("show");
    }
}

async function excluirDocumento(id) {
    const documento = documentosCarregados.find(doc => doc.iddocumento === id);

    if (!documento) return;

    const confirmou = confirm(`Deseja excluir "${documento.titulo}"?`);

    if (!confirmou) return;

    try {
        const response = await fetch(`/api/doc/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const erro = await response.json().catch(() => ({}));
            throw new Error(erro.error || "Erro ao excluir documento");
        }

        documentosCarregados = documentosCarregados.filter(doc => doc.iddocumento !== id);

        const item = document.querySelector(`.documento[data-id="${id}"]`);
        if (item) item.remove();

        fecharMenusDocumentos();
    } catch (error) {
        console.error("Erro ao excluir documento:", error);
        alert("Não foi possível excluir o documento.");
    }
}

function editarDocumento(id) {
    const documento = documentosCarregados.find(doc => doc.iddocumento === id);

    if (!documento) return;

    abrirModalDoc(documento);
}

documentosContainer.addEventListener("click", (event) => {
    const botaoOpcao = event.target.closest(".btnOptions");

    if (botaoOpcao) {
        event.stopPropagation();
        const id = Number(botaoOpcao.dataset.id);
        abrirOpcaoDocumentos(id);
        return;
    }

    const itemMenu = event.target.closest(".dropdown-item");

    if (itemMenu) {
        event.stopPropagation();
        const id = Number(itemMenu.dataset.id);
        const acao = itemMenu.dataset.action;

        if (acao === "editar") {
            editarDocumento(id);
        }

        if (acao === "excluir") {
            excluirDocumento(id);
        }

        fecharMenusDocumentos();
        return;
    }

    const elemento = event.target.closest("[data-id]");

    if (!elemento || !documentosContainer.contains(elemento)) {
        return;
    }

    if (event.target.closest("button, a")) {
        return;
    }

    const id = Number(elemento.dataset.id);

    const documento = documentosCarregados.find(
        doc => doc.iddocumento === id
    );

    if (documento) {
        abrirModalVisualizacao(documento);
    }
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".btnOptions") && !event.target.closest(".dropdown-item")) {
        fecharMenusDocumentos();
    }
});

carregarDocumentos();