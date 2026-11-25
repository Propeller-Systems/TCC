let avisoAtuais = [];
// Função para abrir o modal de criação de aviso (exemplo simples)
const avisosList = document.getElementById("avisosList");

// --- 1. FUNÇÃO PARA BUSCAR AVISOS (READ) ---
async function carregarAvisos() {
    try {
        await window.sessaoPronta;
        const response = await fetch(`/api/avisos`); // Chama a rota GET do Express
        const avisos = await response.json();
        renderizarAvisos(avisos);
    } catch (err) {
        console.error("Erro ao carregar avisos:", err);
    }
}

// --- 2. FUNÇÃO PARA EXIBIR NA TELA ---

function renderizarAvisos(avisos) {
    avisoAtuais = avisos;
    avisosList.innerHTML = "";
    const Admin = window.usuarioLogado?.usuariocol === "admin";
    avisos.forEach((aviso) => {
        const li = document.createElement("li");

        li.innerHTML = `
            <div class="container-aviso">
                ${Admin ? `
                    <button type="button" class="btnOptions bg-transparent">
                        <img src="icons/options.png" alt="Opções">
                    </button>
                    <div class="dropdown-box">
                        <a class="dropdown-item"
                           onclick="atualizarAviso(${aviso.idaviso})">
                            Editar
                        </a>
                        <a class="dropdown-item"
                           onclick="excluirAviso(${aviso.idaviso})">
                            Excluir
                        </a>
                    </div>
                ` : ""}

                <h3>${aviso.titulo}</h3>
                <h6>
                    ${aviso.date ? new Date(aviso.date).toLocaleDateString() : 'sem data'}
                    • Autor: ${aviso.usuario?.nome || "Anônimo"}
                </h6>
                <p>${aviso.conteudo}</p>
            </div>
        `;

        avisosList.appendChild(li);
    });
}


// --- 3. LOGICA DO MODAL E CRIAÇÃO (CREATE) ---
function abrirModal(aviso = null) {
    if (window.usuarioLogado?.usuariocol !== "admin") return;
    if (document.getElementById("avisoModal")) return;

    let modal = document.createElement("dialog");

    modal.id = "avisoModal";
    modal.className = "container-cms";

    Object.assign(modal.style, {
        display: "flex",
        opacity: "1",
        flexDirection: "column",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: "1000",
        height: "auto",
    });

    modal.innerHTML = `
        <h3>${aviso ? "Editar Aviso" : "Criar Novo Aviso"}</h3>

        <form id="formAviso" class="flex flex-col gap-4">
            <label class="form-label" for="titulo">Título:</label>
            <input
                type="text"
                id="titulo"
                placeholder="Adicione um título para seu evento/aviso/notícia"
                required
                class="border p-2 form-control"
                value="${aviso ? aviso.titulo : ""}">

            <label class="form-label" for="conteudo">Conteúdo:</label>
            <textarea
                id="conteudo"
                placeholder="Adicione o conteúdo do seu evento/aviso/notícia"
                required
                class="border p-2 form-control">${aviso ? aviso.conteudo : ""}</textarea>

            <label class="form-label" for="escopo">Escopo:</label>
            <select id="escopo" class="border p-2 form-control" onchange="abrirTabela()">
                <option value="geral" ${aviso && aviso.escopo === "geral" ? "selected" : ""}>Geral</option>
                <option value="funcionario" ${aviso && aviso.escopo === "funcionario" ? "selected" : ""}>Funcionário</option>
                <!-- <option value="aluno" ${aviso && aviso.escopo === "aluno" ? "selected" : ""}>Func. Específico</option> -->
            </select>

            <div id="exibirTabela"></div>

            <div class="flex gap-2">
                <button class="btn btn-danger"
                    type="button"
                    onclick="fecharModal()"
                    class="btn">
                    Cancelar
                </button>
                <button type="submit" class="btn btn-success">
                    ${aviso ? "Atualizar" : "Publicar"}
                </button>

            </div>
        </form>
    `;
    document.body.appendChild(modal);
    const mainContent = document.getElementById("main-content") || document.querySelector("main");
    if (mainContent) mainContent.style.filter = "blur(1px)";
    document.getElementById("sidebar-placeholder").style.filter = "blur(1px)";
    document.getElementById("formAviso").addEventListener("submit", async (e) => {
        e.preventDefault();
        const escopo = document.getElementById("escopo").value;

        const destinatarios = escopo === "funcionario"
            ? [...document.querySelectorAll(
                'input[name="funcionariosSelecionados"]:checked'
            )].map(input => Number(input.value))
            : [];

        const novoAviso = {
            titulo: document.getElementById("titulo").value,
            conteudo: document.getElementById("conteudo").value,
            escopo,
            destinatarios
        };

        console.log("Aviso enviado:", novoAviso);
        let response;
        if (aviso) {
            // Atualizar aviso existente
            response = await fetch(`/api/avisos/${aviso.idaviso}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(novoAviso),
            });
        } else {
            // Criar novo aviso
            response = await fetch("/api/avisos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(novoAviso),
            });
        }

        if (response.ok) {
            fecharModal();
            carregarAvisos();
        } else {
            let err;
            try {
                err = await response.json();
            } catch (e) {
                err = { error: 'Erro desconhecido ao comunicar com o servidor' };
            }
            alert(err.error || err.erro || JSON.stringify(err));
        }
    });
}

function abrirTabela() {
    const select = document.getElementById("escopo");
    const tabela = document.getElementById("exibirTabela");

    async function carregarTabela() {
        tabela.style.display = 'block';
        tabela.innerHTML = '<p>Carregando dados...</p>';

        try {
            const response = await fetch('/api/usuarios');

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const dados = await response.json();
            const funcionarios = dados.filter(usuario => usuario.usuariocol === "funcionario");

            let htmlTabela = `
                <div class="tabela-modal-container">
                    <table class="tabela-modal">
                        <thead>
                            <tr>
                                <th scope="col">Selecionar</th>
                                <th>ID</th>
                                <th>Foto</th>
                                <th>Nome</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            funcionarios.forEach(item => {
                const { idusuario, nome, foto } = item;

                htmlTabela += `
                    <tr>
                        <td class="tabela-modal-selecao">
                            <input type="checkbox" name="funcionariosSelecionados" value="${idusuario}" aria-label="Selecionar funcionário ID ${idusuario}">
                        </td>
                        <td class="tabela-modal-id">${idusuario}</td>
                        <td><img src="/uploads/img/${encodeURIComponent(foto)}" alt="Foto do funcionário" class="foto-funcionario"></td>
                        <td class="tabela-modal-nome">${nome}</td>
                    </tr>
                `;
            });

            htmlTabela += `
                        </tbody>
                    </table>
                </div>
            `;

            tabela.innerHTML = htmlTabela;
            tabela.querySelectorAll('input[name="funcionariosSelecionados"]').forEach(selecao => {
                selecao.addEventListener("change", () => {
                    selecao.closest("tr").classList.toggle("funcionario-selecionado", selecao.checked);
                });
            });

        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            tabela.innerHTML = '<p>Erro ao carregar a tabela.</p>';
        }
    }

    function verificarSelecao() {
        if (select.value === "funcionario") {
            carregarTabela();
        } else {
            tabela.style.display = 'none';
            tabela.innerHTML = '';
        }
    }

    select.addEventListener('change', verificarSelecao);
    verificarSelecao();
}

function fecharModal() {
    const modal = document.getElementById("avisoModal");
    const mainContent = document.getElementById("main-content") || document.querySelector("main");
    if (mainContent) mainContent.style.filter = "none";
    document.getElementById("sidebar-placeholder").style.filter = "none";
    if (modal) modal.remove();
}

function atualizarAviso(id) {
    if (window.usuarioLogado?.usuariocol !== "admin") return;
    const aviso = avisoAtuais.find(aviso => aviso.idaviso === id);
    if (!aviso) {
        alert("Aviso não encontrado.");
        return;
    }
    abrirModal(aviso);
}
async function excluirAviso(id) {
    if (window.usuarioLogado?.usuariocol !== "admin") return;
    if (confirm("Deseja mesmo excluir?")) {
        await fetch(`/api/avisos/${id}`, {
            method: "DELETE",
        });
        carregarAvisos();
    }
}
if (avisosList) {
    carregarAvisos();
}


let fotoBlob = null;

let finalidadeFotoAtual = null;
let cameraFotoStream = null;

// Abre o mesmo modal para atestado ou foto de usuário.
async function abrirModalFoto(finalidade = "atestado") {
    await window.sessaoPronta;

    const usuario = window.usuarioLogado?.usuariocol;

    if (finalidade === "atestado" && usuario !== "funcionario") {
        alert("Apenas funcionários podem enviar atestados.");
        return;
    }

    if (finalidade === "usuario" && usuario !== "admin") {
        alert("Apenas administradores podem cadastrar usuários.");
        return;
    }

    if (document.getElementById("fotoModal")) return;

    finalidadeFotoAtual = finalidade;
    fotoBlob = null;

    const isAtestado = finalidade === "atestado";

    const modal = document.createElement("dialog");

    modal.id = "fotoModal";
    modal.className = "container-cms";

    Object.assign(modal.style, {
        width: "90%",
        maxWidth: "600px",
        height: "auto"
    });

    modal.innerHTML = `
        <h2 class="text-center">
            ${isAtestado ? "Enviar atestado" : "Foto do funcionário"}
        </h2>

        ${
            isAtestado
                ? `
                    <div class="mb-3">
                        <label for="arquivoAtestado" class="form-label">
                            Escolher imagem do dispositivo ou tirar uma foto:
                        </label>

                        <input
                            type="file"
                            id="arquivoAtestado"
                            class="form-control"
                            accept="image/*"
                            capture="environment">
                    </div>
                `
                : ""
        }

        <div class="fotoSection">
            <h4>Câmera</h4>

            <video
                id="webcamFoto"
                autoplay
                playsinline
                style="width: 100%; max-height: 300px;">
            </video>

            <button
                type="button"
                onclick="capturarFoto()"
                class="btn btn-secondary">
                Capturar foto
            </button>
        </div>

        <h4 class="text-center mt-3">Pré-visualização</h4>

        <img
            id="fotoPreview"
            alt="Pré-visualização da imagem"
            style="max-width: 100%; max-height: 300px; object-fit: contain;">

        <div class="mt-3">
            <button
                type="button"
                onclick="fecharFotoModal(true)"
                class="btn btn-danger">
                Cancelar
            </button>

            <button
                type="button"
                onclick="confirmarFoto()"
                class="btn btn-success">
                ${isAtestado ? "Enviar atestado" : "Confirmar foto"}
            </button>
        </div>
    `;

    document.body.appendChild(modal);
    modal.showModal();

    const mainContent =
        document.getElementById("main-content") ||
        document.querySelector("main");

    if (mainContent) {
        mainContent.style.filter = "blur(1px)";
    }

    const sidebar = document.getElementById("sidebar-placeholder");

    if (sidebar) {
        sidebar.style.filter = "blur(1px)";
    }

    // Seleção de imagem do dispositivo (somente atestados).
    const input = document.getElementById("arquivoAtestado");

    if (input) {
        input.addEventListener("change", (event) => {
            const arquivo = event.target.files[0];

            if (!arquivo) return;

            if (!arquivo.type.startsWith("image/")) {
                alert("Selecione uma imagem válida.");
                event.target.value = "";
                return;
            }

            fotoBlob = arquivo;
            atualizarPreviewFoto(arquivo);
        });
    }

    // Inicialização da câmera.
    try {
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("Câmera não disponível neste navegador.");
        }

        cameraFotoStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: isAtestado ? "environment" : "user"
            }
        });

        const video = document.getElementById("webcamFoto");

        if (!video || !document.getElementById("fotoModal")) {
            cameraFotoStream.getTracks().forEach(track => track.stop());
            cameraFotoStream = null;
            return;
        }

        video.srcObject = cameraFotoStream;

    } catch (error) {
        console.error("Erro ao acessar câmera:", error);
        alert("Não foi possível acessar a câmera. Você ainda pode cancelar o modal.");
    }
}


// Atualiza a imagem de pré-visualização.
function atualizarPreviewFoto(imagem) {
    const preview = document.getElementById("fotoPreview");

    if (!preview) return;

    if (preview.src.startsWith("blob:")) {
        URL.revokeObjectURL(preview.src);
    }

    preview.src = URL.createObjectURL(imagem);
}


// Captura uma imagem usando a câmera.
function capturarFoto() {
    const video = document.getElementById("webcamFoto");

    if (!video || !video.videoWidth) {
        alert("A câmera ainda não está pronta.");
        return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    canvas.toBlob((blob) => {
        if (!blob) {
            alert("Não foi possível capturar a imagem.");
            return;
        }

        fotoBlob = blob;

        atualizarPreviewFoto(blob);

        // Se for atestado, remove a imagem anteriormente selecionada.
        const input = document.getElementById("arquivoAtestado");

        if (input) {
            input.value = "";
        }

    }, "image/jpeg", 0.9);
}


// Confirma a imagem de acordo com a finalidade do modal.
async function confirmarFoto() {
    if (!fotoBlob) {
        alert("Selecione uma imagem ou capture uma foto primeiro.");
        return;
    }

    // Foto de usuário: mantém o Blob para o formulário de cadastro.
    if (finalidadeFotoAtual === "usuario") {
        fecharFotoModal(false);
        alert("Foto selecionada com sucesso!");
        return;
    }

    // Atestado: envia a imagem para o backend.
    if (finalidadeFotoAtual === "atestado") {
        if (window.usuarioLogado?.usuariocol !== "funcionario") {
            return;
        }

        const formData = new FormData();

        formData.append("arquivo", fotoBlob, "atestado.jpg");

        try {
            const response = await fetch("/api/atestados", {
                method: "POST",
                body: formData
            });

            const resultado = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(resultado.error || "Erro ao enviar atestado.");
            }

            alert("Atestado enviado com sucesso!");

            fecharFotoModal(true);

        } catch (error) {
            console.error("Erro ao enviar atestado:", error);
            alert(error.message);
        }
    }
}


// Fecha o modal, desliga a câmera e libera a pré-visualização.
// descartar = true limpa a imagem selecionada.
function fecharFotoModal(descartar = false) {
    const modal = document.getElementById("fotoModal");

    // Desliga a câmera.
    if (cameraFotoStream) {
        cameraFotoStream.getTracks().forEach(track => track.stop());
        cameraFotoStream = null;
    }

    // Libera a URL temporária da pré-visualização.
    const preview = document.getElementById("fotoPreview");

    if (preview?.src.startsWith("blob:")) {
        URL.revokeObjectURL(preview.src);
    }

    // Remove o modal.
    if (modal) {
        modal.close();
        modal.remove();
    }

    // Remove o efeito de desfoque.
    const mainContent =
        document.getElementById("main-content") ||
        document.querySelector("main");

    if (mainContent) {
        mainContent.style.filter = "none";
    }

    const sidebar = document.getElementById("sidebar-placeholder");

    if (sidebar) {
        sidebar.style.filter = "none";
    }

    // Só descarta a imagem quando solicitado.
    if (descartar) {
        fotoBlob = null;
    }

    finalidadeFotoAtual = null;
}



function abrirModalDoc(documento = null) {
    if (window.usuarioLogado?.usuariocol !== "admin") return;
    if (document.getElementById("docModal")) return;

    const modoEdicao = Boolean(documento);

    let modalF = document.createElement("dialog");
    modalF.id = "docModal";
    modalF.className = "container-cms";

    Object.assign(modalF.style, {
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: "1000",
        width: "80%",
        maxWidth: "900px",
        height: "80%"
    });

    modalF.innerHTML = `
        <button
            type="button"
            onclick="fecharDocModal()"
            class="btn-close position-absolute top-0 end-0">
        </button>

        <div class="p-3">

            <h2 class="mb-4">
                ${modoEdicao ? "Editar Documento" : "Novo Documento"}
            </h2>

            <div class="mb-3">
                <label
                    for="tituloDocumento"
                    class="form-label">
                    Título
                </label>

                <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    class="form-control"
                    placeholder="Digite o título do documento"
                    value="${documento ? documento.titulo.replace(/"/g, '&quot;') : ''}">
            </div>

            <div class="mb-3">
                <label
                    for="texto"
                    class="form-label">
                    Sobre o documento
                </label>

                <textarea
                    id="texto"
                    name="texto"
                    class="form-control"
                    rows="8"
                    placeholder="Digite uma descrição ou informações sobre o documento...">${documento ? documento.texto : ''}</textarea>
            </div>

            <div class="mb-3">
                <label
                    for="arquivo"
                    class="form-label">
                    ${modoEdicao ? "Trocar arquivo (opcional)" : "Arquivo"}
                </label>

                <input
                    type="file"
                    id="arquivo"
                    name="arquivo"
                    class="form-control"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    ${modoEdicao ? "" : "required"}>
                
                <small class="text-muted">
                    Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX e TXT.
                </small>
            </div>

            <div class="mt-4">
                <button
                    type="button"
                    onclick="fecharDocModal()"
                    class="btn btn-danger">
                    Cancelar
                </button>

                <button
                    type="button"
                    onclick="salvarDocumento(${documento ? documento.iddocumento : "null"})"
                    class="btn btn-success">
                    ${modoEdicao ? "Salvar Alterações" : "Salvar Documento"}
                </button>
            </div>

        </div>
    `;

    document.body.appendChild(modalF);
    modalF.showModal();

    const mainContent =
        document.getElementById("main-content") ||
        document.querySelector("main");

    if (mainContent) {
        mainContent.style.filter = "blur(1px)";
    }

    const sidebar = document.getElementById("sidebar-placeholder");

    if (sidebar) {
        sidebar.style.filter = "blur(1px)";
    }
}

async function salvarDocumento(idDocumento = null) {
    if (window.usuarioLogado?.usuariocol !== "admin") return;
    const titulo = document.getElementById("titulo").value.trim();
    const texto = document.getElementById("texto").value.trim();
    const arquivo = document.getElementById("arquivo")?.files[0];

    if (!titulo || !texto || (!arquivo && !idDocumento)) {
        alert(idDocumento ? "Preencha título e descrição antes de salvar." : "Preencha todos os campos e selecione um arquivo");
        return;
    }

    const formData = new FormData();

    formData.append("titulo", titulo);
    formData.append("texto", texto);

    if (arquivo) {
        formData.append("arquivo", arquivo);
    }

    try {
        const response = await fetch(idDocumento ? `/api/doc/${idDocumento}` : "/api/doc", {
            method: idDocumento ? "PUT" : "POST",
            body: formData
        });

        const resultado = await response.json().catch(() => ({}));

        if (!response.ok) throw new Error(resultado.error || "Erro ao salvar documento");

        alert(idDocumento ? "Documento atualizado com sucesso" : "Documento criado com sucesso");

        fecharDocModal();

        carregarDocumentos();
    } catch (error) {
        console.error("Erro ao salvar documento", error);
        alert("Não foi possivel salvar o documento");
    }
}

function fecharDocModal() {
    const modal = document.getElementById("docModal");

    if (!modal) return;

    modal.close();
    modal.remove();

    const mainContent =
        document.getElementById("main-content") ||
        document.querySelector("main");

    if (mainContent) {
        mainContent.style.filter = "none";
    }

    const sidebar = document.getElementById("sidebar-placeholder");

    if (sidebar) {
        sidebar.style.filter = "none";
    }
}

// visualizar documentos
function abrirModalVisualizacao(documento) {
    let modal = document.getElementById("modalVisualizacaoDoc");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modalVisualizacaoDoc";

        Object.assign(modal.style, {
            position: "fixed",
            inset: "0",
            background: "rgba(0, 0, 0, 0.7)",
            zIndex: "9999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
        });

        document.body.appendChild(modal);

        modal.addEventListener("click", event => {
            if (event.target === modal) modal.style.display = "none";
        });
    }

    modal.innerHTML = "";

    const conteudo = document.createElement("div");

    Object.assign(conteudo.style, {
        background: "#fff",
        color: "#222",
        width: "90%",
        maxWidth: "1000px",
        height: "85vh",
        padding: "20px",
        overflow: "auto",
        borderRadius: "8px",
        position: "relative"
    });

    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.textContent = "Fechar";

    Object.assign(fechar.style, {
        float: "right",
        cursor: "pointer"
    });

    fechar.addEventListener("click", () => {
        modal.style.display = "none";
    });

    const titulo = document.createElement("h2");
    titulo.textContent = documento.titulo;

    const texto = document.createElement("p");
    texto.textContent = documento.texto || "Sem descrição.";

    const visualizador = document.createElement("iframe");
    visualizador.title = documento.titulo;
    visualizador.src =
        `/uploads/doc/${encodeURIComponent(documento.caminho)}`;

    Object.assign(visualizador.style, {
        width: "100%",
        height: "70%",
        border: "none"
    });

    conteudo.append(fechar, titulo, texto, visualizador);
    modal.appendChild(conteudo);
    modal.style.display = "flex";
}

