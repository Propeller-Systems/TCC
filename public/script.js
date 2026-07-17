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

// --- 2. FUNÇÃO PARA EXIBIR NA TELA USUARIOS ---

async function fetchUsuarios() {
  const response = await fetch("/api/usuarios");
  const usuarios = await response.json();

  const tbody = document.querySelector("#tabela-usuarios");

  tbody.innerHTML = ""; // Limpa a tabela antes de preencher

  usuarios.forEach((usuario) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${usuario.idusuario}</td>
      <td><img src="${usuario.foto}" alt="Foto" style="width: 50px; height: 50px;"></td>
      <td>${usuario.nome}</td>
      <td>${usuario.email}</td>
      <td>${usuario.usuariocol}</td>
      <td>${new Date(usuario.dataCriacao).toLocaleDateString("pt-BR")}</td>
    `;
    tbody.appendChild(row);
  });
}

fetchUsuarios();

// total de usuarios
async function carregarTotalUsuarios() {
  try {
    const res = await fetch("/totalUsuarios");
    const text = await res.text();
    console.log("RESPOSTA:", text);
    const data = JSON.parse(text);

    document.querySelector("#totalUsuarios").textContent = data.total;

  } catch (err) {
    console.error("ERRO:", err);
  }
}

carregarTotalUsuarios();
