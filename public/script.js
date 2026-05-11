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

fetch("sidebar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("sidebar-placeholder").innerHTML = data;

    toggleBtn = document.getElementById("toggle-btn");
    sidebar = document.getElementById("sidebar");

    // Highlight a página atual
    highlightCurrentPage();
  });

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
                <option value="funcionario">Professores</option>
                <option value="aluno">Alunos</option>
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
  document.getElementById("formAviso").addEventListener("submit", async (e) => {
    e.preventDefault();
    const novoAviso = {
      titulo: document.getElementById("titulo").value,
      conteudo: document.getElementById("conteudo").value,
      escopo: document.getElementById("escopo").value,
      // temporário até existir login
      idusuario: 1,
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
carregarAvisos();