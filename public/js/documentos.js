const slider = document.getElementById("slider");
const documentosContainer = document.getElementById("documentos-container");
const btnDoc = document.getElementById("btnDoc");

let documentosCarregados = [];
let atestadosCarregados = [];

let tipoVisualizacao = "documentos";

async function carregarDocumentos() {
    if (!documentosContainer) return;

    try {
        await window.sessaoPronta;

        const admin = window.usuarioLogado?.usuariocol === "admin";
        const btnAtestado = document.getElementById("btnAtestado");

        slider.disabled = false;
        function atualizarBotoes() {
            const mostrandoAtestados = slider.checked;

            btnDoc.style.display =
                admin && !mostrandoAtestados ? "block" : "none";

            btnAtestado.style.display =
                !admin && mostrandoAtestados ? "block" : "none";
        }

        atualizarBotoes();

        slider.addEventListener("change", async () => {
            atualizarBotoes();
            if (slider.checked) {
                // Visualização de atestados
                if (admin) {
                    await carregarAtestados();
                } else {
                    documentosContainer.innerHTML = "";
                }
            } else {
                // Visualização de documentos
                renderizarDocumentos();
            }
        });

        documentosContainer.innerHTML = "<p>Carregando documentos...</p>";

        const response = await fetch("/api/doc");

        if (!response.ok) {
            throw new Error("Erro ao buscar documentos.");
        }

        documentosCarregados = await response.json();

        if (admin && slider?.checked) {
            await carregarAtestados();
        } else {
            tipoVisualizacao = "documentos";
            renderizarDocumentos();
        }

    } catch (error) {
        console.error("Erro ao carregar documentos:", error);

        documentosContainer.innerHTML =
            "<p>Erro ao carregar documentos.</p>";
    }
}

if (slider && documentosContainer) {
    slider.addEventListener("change", async function () {
        const admin = window.usuarioLogado?.usuariocol === "admin";

        if (!admin) return;

        if (this.checked) {
            await carregarAtestados();
        } else {
            tipoVisualizacao = "documentos";
            renderizarDocumentos();
        }
    });
}

function renderizarDocumentos() {
    tipoVisualizacao = "documentos";

    if (!documentosContainer) return;

    if (documentosCarregados.length === 0) {
        documentosContainer.innerHTML =
            "<p>Nenhum documento encontrado.</p>";
        return;
    }

    documentosContainer.innerHTML = "";

    documentosCarregados.forEach(documento => {
        const elemento = criarDocumentoHTML(documento);
        documentosContainer.appendChild(elemento);
    });
}

function criarDocumentoHTML(documento) {
    const div = document.createElement("div");

    div.className = "documento enviado active";
    div.dataset.id = documento.iddocumento;
    div.dataset.tipo = "documento";

    const admin = window.usuarioLogado?.usuariocol === "admin";

    const icone = document.createElement("div");
    icone.className = "doc-icon";

    const imagem = document.createElement("img");
    imagem.src = "icons/pdf-icon.png";
    imagem.alt = "Documento";

    icone.appendChild(imagem);

    const informacoes = document.createElement("div");

    const titulo = document.createElement("h3");
    titulo.textContent = documento.titulo;

    const texto = document.createElement("p");
    texto.textContent = documento.texto || "";

    informacoes.append(titulo, texto);

    div.append(icone, informacoes);

    if (admin) {
        const acoes = document.createElement("div");
        acoes.className = "doc-actions";

        acoes.innerHTML = `
            <button
                type="button"
                class="btnOptions btn btn-secondary"
                aria-label="Opções do documento"
                data-id="${documento.iddocumento}">
                <img src="icons/options.png" alt="Opções">
            </button>

            <div class="dropdown-box" role="menu">
                <button
                    type="button"
                    class="dropdown-item"
                    data-action="editar"
                    data-id="${documento.iddocumento}">
                    Editar
                </button>

                <button
                    type="button"
                    class="dropdown-item danger"
                    data-action="excluir"
                    data-id="${documento.iddocumento}">
                    Excluir
                </button>
            </div>
        `;

        div.appendChild(acoes);
    }

    return div;
}

async function carregarAtestados() {
    if (!documentosContainer) return;

    if (window.usuarioLogado?.usuariocol !== "admin") {
        return;
    }

    tipoVisualizacao = "atestados";

    documentosContainer.innerHTML =
        "<p>Carregando atestados...</p>";

    try {
        const response = await fetch("/api/atestados");

        if (!response.ok) {
            throw new Error("Erro ao buscar atestados.");
        }

        atestadosCarregados = await response.json();

        renderizarAtestados();

    } catch (error) {
        console.error("Erro ao carregar atestados:", error);

        documentosContainer.innerHTML =
            "<p>Erro ao carregar os atestados.</p>";
    }
}

function renderizarAtestados() {
    if (!documentosContainer) return;

    tipoVisualizacao = "atestados";

    if (atestadosCarregados.length === 0) {
        documentosContainer.innerHTML =
            "<p>Nenhum atestado recebido.</p>";
        return;
    }

    documentosContainer.innerHTML = "";

    atestadosCarregados.forEach(atestado => {
        const elemento = criarAtestadoHTML(atestado);

        documentosContainer.appendChild(elemento);
    });
}

function criarAtestadoHTML(atestado) {
    const div = document.createElement("div");

    div.className = "documento atestado active";

    div.dataset.id = atestado.idatestado;
    div.dataset.tipo = "atestado";

    const informacoes = document.createElement("div");

    const titulo = document.createElement("h3");

    titulo.textContent =
        atestado.usuario?.nome || "Funcionário não identificado";

    const data = document.createElement("p");

    data.textContent = atestado.dtEnvio
        ? `Enviado em: ${new Date(atestado.dtEnvio).toLocaleString("pt-BR")}`
        : "Data não disponível";

    const identificacao = document.createElement("small");

    identificacao.textContent =
        `ID do atestado: ${atestado.idatestado}`;

    informacoes.append(titulo, data, identificacao);

    const visualizar = document.createElement("button");

    visualizar.type = "button";
    visualizar.className = "btn btn-primary";
    visualizar.textContent = "Visualizar imagem";

    visualizar.addEventListener("click", (event) => {
        event.stopPropagation();
        abrirModalAtestado(atestado);
    });

    div.append(informacoes, visualizar);

    return div;
}

function abrirModalAtestado(atestado) {
    if (window.usuarioLogado?.usuariocol !== "admin") {
        return;
    }

    const existente = document.getElementById("modalAtestado");

    if (existente) existente.remove();

    const modal = document.createElement("dialog");

    modal.id = "modalAtestado";
    modal.className = "container-cms";

    Object.assign(modal.style, {
        width: "90%",
        maxWidth: "900px",
        maxHeight: "90vh",
        padding: "20px"
    });

    const titulo = document.createElement("h2");

    titulo.textContent =
        `Atestado - ${atestado.usuario?.nome || "Funcionário"}`;

    const data = document.createElement("p");

    data.textContent = atestado.dtEnvio
        ? new Date(atestado.dtEnvio).toLocaleString("pt-BR")
        : "Data não disponível";

    const imagem = document.createElement("img");

    imagem.src = `/api/atestados/${atestado.idatestado}/arquivo`;
    imagem.alt = "Imagem do atestado";

    Object.assign(imagem.style, {
        display: "block",
        maxWidth: "100%",
        maxHeight: "65vh",
        margin: "20px auto",
        objectFit: "contain"
    });

    const fechar = document.createElement("button");

    fechar.type = "button";
    fechar.className = "btn btn-danger";
    fechar.textContent = "Fechar";

    fechar.addEventListener("click", () => {
        modal.close();
        modal.remove();
    });

    imagem.addEventListener("error", () => {
        imagem.alt = "Não foi possível carregar a imagem.";
    });

    modal.append(titulo, data, imagem, fechar);

    document.body.appendChild(modal);

    modal.showModal();

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.close();
            modal.remove();
        }
    });
}

function fecharMenusDocumentos() {
    document.querySelectorAll(".documento .dropdown-box").forEach(menu => {
        menu.classList.remove("show");
    });
}

function abrirOpcaoDocumentos(id) {
    const item = document.querySelector(
        `.documento[data-id="${id}"][data-tipo="documento"]`
    );

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
    if (window.usuarioLogado?.usuariocol !== "admin") return;

    const documento = documentosCarregados.find(
        doc => doc.iddocumento === id
    );

    if (!documento) return;

    const confirmou = confirm(
        `Deseja excluir "${documento.titulo}"?`
    );

    if (!confirmou) return;

    try {
        const response = await fetch(`/api/doc/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const erro = await response.json().catch(() => ({}));

            throw new Error(erro.error || "Erro ao excluir documento.");
        }

        documentosCarregados = documentosCarregados.filter(
            doc => doc.iddocumento !== id
        );

        renderizarDocumentos();

    } catch (error) {
        console.error("Erro ao excluir documento:", error);

        alert("Não foi possível excluir o documento.");
    }
}

function editarDocumento(id) {
    if (window.usuarioLogado?.usuariocol !== "admin") return;

    const documento = documentosCarregados.find(
        doc => doc.iddocumento === id
    );

    if (!documento) return;

    abrirModalDoc(documento);
}

if (documentosContainer) {
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

        const elemento = event.target.closest(".documento");

        if (!elemento || !documentosContainer.contains(elemento)) {
            return;
        }

        if (elemento.dataset.tipo === "atestado") {
            if (window.usuarioLogado?.usuariocol !== "admin") return;

            const id = Number(elemento.dataset.id);

            const atestado = atestadosCarregados.find(
                item => item.idatestado === id
            );

            if (atestado) {
                abrirModalAtestado(atestado);
            }

            return;
        }

        if (elemento.dataset.tipo === "documento") {
            if (event.target.closest("button, a")) return;

            const id = Number(elemento.dataset.id);

            const documento = documentosCarregados.find(
                doc => doc.iddocumento === id
            );

            if (documento) {
                abrirModalVisualizacao(documento);
            }
        }
    });
}

// Fecha menus ao clicar fora deles
document.addEventListener("click", (event) => {
    if (
        !event.target.closest(".btnOptions") &&
        !event.target.closest(".dropdown-box")
    ) {
        fecharMenusDocumentos();
    }
});

carregarDocumentos();
