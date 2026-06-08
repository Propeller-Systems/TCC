let toggleBtn;
let sidebar;

function toggleSidebar() {
  sidebar.classList.toggle("close");
  toggleBtn.classList.toggle("rotate");

  Array.from(sidebar.getElementsByClassName("show")).forEach((ul) => {
    ul.classList.remove("show");
    ul.previousElementSibling.classList.remove("rotate");
  });
}

function toggleSubmenu(button) {
  const subMenu = button.nextElementSibling;

  // Fechar outros submenus antes de abrir o atual (evita gaps no mobile)
  Array.from(sidebar.querySelectorAll(".sub-menu.show")).forEach((menu) => {
    if (menu !== subMenu) {
      menu.classList.remove("show");
      if (
        menu.previousElementSibling &&
        menu.previousElementSibling.classList.contains("rotate")
      ) {
        menu.previousElementSibling.classList.remove("rotate");
      }
    }
  });

  subMenu.classList.toggle("show");
  button.classList.toggle("rotate");

  if (sidebar.classList.contains("close")) {
    sidebar.classList.toggle("close");
    toggleBtn.classList.toggle("rotate");
  }
}

const sidebarPlaceholder = document.getElementById("sidebar-placeholder");
if (sidebarPlaceholder) {
fetch("sidebar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("sidebar-placeholder").innerHTML = data;

    toggleBtn = document.getElementById("toggle-btn");
    sidebar = document.getElementById("sidebar");

    // Highlight a página atual
    highlightCurrentPage();
  });
}
function highlightCurrentPage() {
  // Pega o nome do arquivo atual da URL
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // Itera por todos os links do sidebar
  const links = sidebar.querySelectorAll("a");
  links.forEach((link) => {
    const href = link.getAttribute("href");

    // Compara o URL do link com a página atual
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      // Adiciona a classe active no elemento pai (li)
      link.parentElement.classList.add("active");
    } else {
      // Remove a classe active se existir
      link.parentElement.classList.remove("active");
    }
  });
}

console.log(window.location.pathname.split("/"));

// Função para abrir o modal de criação de aviso (exemplo simples)
const avisosList = document.getElementById("avisosList");

const grupo = "admin"; // ou "funcionario" ou "geral", dependendo do grupo do usuário logado. Por enquanto é fixo, mas depois deve ser dinâmico com base no login do usuário.(so para teste, depois tem que ser dinamico com base no login do usuario)

// --- 1. FUNÇÃO PARA BUSCAR AVISOS (READ) ---
async function carregarAvisos() {
  try {
    const response = await fetch(`/api/avisos/${grupo}`); // Chama a rota GET do Express
    const avisos = await response.json();
    renderizarAvisos(avisos);
  } catch (err) {
    console.error("Erro ao carregar avisos:", err);
  }
}

// --- 2. FUNÇÃO PARA EXIBIR NA TELA ---
function renderizarAvisos(avisos) {
  avisosList.innerHTML = ""; // Limpa a lista antes de mostrar
  avisos.forEach((aviso) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <div class="container-aviso">
                <h3>${aviso.titulo}</h3>
                <h6>${aviso.data} • Autor: ${aviso.autor || "Anônimo"}</h6>
                <p>${aviso.conteudo}</p>
                <button onclick="deletarAviso(${aviso.idaviso})" class="btn-delete">Excluir</button>
            </div>
        `;
    avisosList.appendChild(li);
  });
}

// --- 3. LOGICA DO MODAL E CRIAÇÃO (CREATE) ---
function abrirModal() {
  if (document.getElementById("avisoModal")) return;

  let modal = document.createElement("dialog");

  modal.id = "avisoModal";
  modal.className = "container-cms";

  Object.assign(modal.style, {
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: "1000",
    height: "auto",
  });

  modal.innerHTML = `
        <h3>Criar Novo Aviso</h3>

        <form id="formAviso" class="flex flex-col gap-4">
            <label class="form-label" for="titulo">Título:</label>
            <input
                type="text"
                id="titulo"
                placeholder="Adicione um título para seu evento/aviso/notícia"
                required
                class="border p-2 form-control">

            <label class="form-label" for="conteudo">Conteúdo:</label>
            <textarea
                id="conteudo"
                placeholder="Adicione o conteúdo do seu evento/aviso/notícia"
                required
                class="border p-2 form-control"></textarea>

            <label class="form-label" for="escopo">Escopo:</label>
            <select id="escopo" class="border p-2 form-control">
                <option value="geral">Geral</option>
                <option value="funcionario">Funcionário</option>
                <option value="aluno">Func. Específico</option>
            </select>

            <div class="flex gap-2">
                <button type="submit" class="btn btn-success">
                    Publicar
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
    const response = await fetch("/api/avisos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(novoAviso),
    });

    if (response.ok) {
      fecharModal();
      carregarAvisos();
    }
  });
}

function fecharModal() {
  const modal = document.getElementById("avisoModal");
  const mainContent = document.getElementById("main-content") || document.querySelector("main");
  if (mainContent) mainContent.style.filter = "none";
  document.getElementById("sidebar-placeholder").style.filter = "none";
  if (modal) modal.remove();
}
async function deletarAviso(id) {
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
      height: "100%",
    });

    modalF.innerHTML = `
                <button type="button" onclick="fecharFotoModal()" class="btn-close position-absolute top-0 end-0"></button>
                <video autoplay="true" id="webcam"></video>
                <form action="" method="POST">
                
                <button type="button" onclick="foto()" class="btn">Capturar Foto</button>
                
                <div class="image">
                <img src="" alt="Foto Capturada" id="foto">
                </div>
                    <textarea name="image_base64" id="base64"></textarea>
                    <button type="submit" class="btn">Enviar Imagem</button>
                </form>
            </div>`;
    document.body.appendChild(modalF);
    modalF.showModal();
    const mainContent = document.getElementById("main-content") || document.querySelector("main");
    if (mainContent) mainContent.style.filter = "blur(1px)";
    document.getElementById("sidebar-placeholder").style.filter = "blur(1px)";

    //função de abrir a webcam
    let video = document.querySelector("#webcam");
         
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({audio: false, video: {facingMode: 'user'}})
        .then( function(stream) {
            video.srcObject = stream;
        })
        .catch(function(error) {
            alert("Não foi possível iniciar a webcam.");
        });
    }

    function foto(){
        let video = document.querySelector("#webcam");
         
        let canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        let ctx = canvas.getContext('2d');
         
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
         
        let dataURI = canvas.toDataURL('image/jpeg'); 
        document.querySelector("#foto").src = dataURI;
        document.querySelector("#base64").value = dataURI;
    }
}


function fecharFotoModal() {
  const modal = document.getElementById("fotoModal");
  const video = document.querySelector("#webcam");
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  }
  const mainContent = document.getElementById("main-content") || document.querySelector("main");
  if (mainContent) mainContent.style.filter = "none";
  document.getElementById("sidebar-placeholder").style.filter = "none";
  if (modal) {
    if (typeof modal.close === "function") modal.close();
    modal.remove();
  }
}

// --- 2. FUNÇÃO PARA EXIBIR NA TELA USUARIOS ---
// exemplo da função esta na linha 92 até 106 lá já está como estilizar o read


