let avisoAtuais = [];
// Função para abrir o modal de criação de aviso (exemplo simples)
const avisosList = document.getElementById("avisosList");

// --- 1. FUNÇÃO PARA BUSCAR AVISOS (READ) ---
async function carregarAvisos() {
  try {
    const response = await fetch(`/api/avisos`); // Chama a rota GET do Express
    const avisos = await response.json();
    renderizarAvisos(avisos);
  } catch (err) {
    console.error("Erro ao carregar avisos:", err);
  }
}

// --- 2. FUNÇÃO PARA EXIBIR NA TELA ---
function renderizarAvisos(avisos) {
  avisoAtuais = avisos; // Atualiza a lista de avisos atuais
  avisosList.innerHTML = ""; // Limpa a lista antes de mostrar
  avisos.forEach((aviso) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <div class="container-aviso">
              <button type="button" class="btnOptions bg-transparent">
                <img src="icons/options.png">
              </button>
              <div class="dropdown-box">
                <a class="dropdown-item" onclick="atualizarAviso(${aviso.idaviso})" style="user-select: none;">Editar</a>
                <a class="dropdown-item" onclick="excluirAviso(${aviso.idaviso})" style="user-select: none;">Excluir</a>
              </div>
                  <h3>${aviso.titulo}</h3>
                  <h6>${aviso.date? new Date(aviso.date).toLocaleDateString() : 'sem data'} • Autor: ${aviso.usuario?.nome || "Anônimo"}</h6>
                  <p>${aviso.conteudo}</p>
            </div>
        `;
    avisosList.appendChild(li);
  });
}

// --- 3. LOGICA DO MODAL E CRIAÇÃO (CREATE) ---
function abrirModal(aviso = null) {
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
                <button type="submit" class="btn btn-success">
                    ${aviso ? "Atualizar" : "Publicar"}
                </button>

                <button
                    type="button"
                    onclick="fecharModal()"
                    class="btn">
                    Cancelar
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
        const novoAviso = {
            titulo: document.getElementById("titulo").value,
            conteudo: document.getElementById("conteudo").value,
            escopo: document.getElementById("escopo").value,
        };
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

            let htmlTabela = `
                <table class="tabela-modal">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Foto</th>
                            <th>Nome</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            dados.forEach(item => {
                const { idusuario, nome, foto } = item;

                htmlTabela += `
                    <tr>
                        <td>${idusuario}</td>
                        <td>${foto}</td>
                        <td>${nome}</td>
                    </tr>
                `;
            });

            htmlTabela += `
                    </tbody>
                </table>
            `;

            tabela.innerHTML = htmlTabela;

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
    const aviso = avisoAtuais.find(aviso => aviso.idaviso === id);
    if (!aviso) {
        alert("Aviso não encontrado.");
        return;
    }
    abrirModal(aviso);
}
async function excluirAviso(id) {
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

function abrirModalFoto() {
    if (document.getElementById("fotoModal")) return;

    let modalF = document.createElement("dialog");
    modalF.id = "fotoModal";
    modalF.className = "container-cms";

    Object.assign(modalF.style, {
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: "1000",
        height: "100%"
    });

    modalF.innerHTML = `
        <h2 class="text-center">Capture uma foto</h2>
        <button
            type="button"
            onclick="fecharFotoModal()"
            class="btn-close btn-danger position-absolute">
        </button>
        <div class="fotoSection">
            <div class="camera">
                <video autoplay playsinline id="webcam"></video>
            </div>
            
            <div class="cameraOptions">
                <button
                    type="button"
                    onclick="capturarFoto()"
                    class="btn btn-secondary">
                    Capturar Foto
                </button>

                <button
                    type="button"
                    onclick="confirmarFoto()"
                    class="btn btn-success">
                    Confirmar Foto
                </button>
            </div>
        </div>

        <h4 class="text-center">Veja uma prévia</h4>

        <div class="image mt-2">
            <img
                src=""
                alt="Foto Capturada"
                id="foto"
                style="max-width:100%;">
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

    document.getElementById("sidebar-placeholder").style.filter = "blur(1px)";

    const video = document.querySelector("#webcam");

    navigator.mediaDevices
        .getUserMedia({
            audio: false,
            video: {
                facingMode: "user"
            }
        })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch(() => {
            alert("Não foi possível iniciar a webcam.");
        });
}

function capturarFoto() {
    const video = document.querySelector("#webcam");

    if (!video.videoWidth) {
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

    document.querySelector("#foto").src =
        canvas.toDataURL("image/jpeg");

    canvas.toBlob(
        (blob) => {
            fotoBlob = blob;
        },
        "image/jpeg",
        0.9
    );
}

function limparFotoModal() {
    const modal = document.getElementById("fotoModal");
    const video = document.querySelector("#webcam");

    if (video && video.srcObject) {
        video.srcObject
            .getTracks()
            .forEach(track => track.stop());

        video.srcObject = null;
    }

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

    if (modal) {
        modal.close();
        modal.remove();
    }
}

function confirmarFoto() {
    if (!fotoBlob) {
        alert("Capture uma foto primeiro.");
        return;
    }

    limparFotoModal();

    alert("Foto selecionada.");
}

function fecharFotoModal() {
    limparFotoModal();
    fotoBlob = null;
}

function abrirModalDoc(documento = null) {
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
                    class="btn">
                    Cancelar
                </button>

                <button
                    type="button"
                    onclick="salvarDocumento(${documento ? documento.iddocumento : "null"})"
                    class="btn">
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

async function salvarDocumento(idDocumento = null){
    const titulo = document.getElementById("titulo").value.trim();
    const texto = document.getElementById("texto").value.trim();
    const arquivo = document.getElementById("arquivo")?.files[0];

    if(!titulo || !texto || (!arquivo && !idDocumento)){
        alert(idDocumento ? "Preencha título e descrição antes de salvar." : "Preencha todos os campos e selecione um arquivo");
        return;
    }

    const formData = new FormData();

    formData.append("titulo", titulo);
    formData.append("texto", texto);

    if (arquivo) {
        formData.append("arquivo", arquivo);
    }

    try{
        const response = await fetch(idDocumento ? `/api/doc/${idDocumento}` : "/api/doc", {
            method: idDocumento ? "PUT" : "POST",
            body: formData
        });

        const resultado = await response.json().catch(() => ({}));

        if(!response.ok) throw new Error(resultado.error || "Erro ao salvar documento");

        alert(idDocumento ? "Documento atualizado com sucesso" : "Documento criado com sucesso");

        fecharDocModal();

        carregarDocumentos();
    }catch(error){
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

