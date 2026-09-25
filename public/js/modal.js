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

// Função para abrir o modal de foto
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
        <button
            type="button"
            onclick="fecharFotoModal()"
            class="btn-close position-absolute top-0 end-0">
        </button>

        <video autoplay playsinline id="webcam"></video>

        <div class="mt-2">
            <button
                type="button"
                onclick="capturarFoto()"
                class="btn">
                Capturar Foto
            </button>

            <button
                type="button"
                onclick="confirmarFoto()"
                class="btn">
                Confirmar Foto
            </button>
        </div>

        <div class="image mt-3">
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

    // Apenas preview
    document.querySelector("#foto").src =
        canvas.toDataURL("image/jpeg");

    // JPG real para upload
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

    // Para a câmera
    if (video && video.srcObject) {
        video.srcObject
            .getTracks()
            .forEach(track => track.stop());

        video.srcObject = null;
    }

    // Remove o filtro do conteúdo
    const mainContent =
        document.getElementById("main-content") ||
        document.querySelector("main");

    if (mainContent) {
        mainContent.style.filter = "none";
    }

    // Remove o filtro da sidebar
    const sidebar = document.getElementById("sidebar-placeholder");

    if (sidebar) {
        sidebar.style.filter = "none";
    }

    // Fecha e remove o modal
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
