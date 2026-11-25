let usuarios = [];
let usuariosEditando = null;
let toggleBtn;
let sidebar;
let usuarioLogado = null;

async function carregarSessao() {
  try {
    const response = await fetch("/api/sessao");

    if (!response.ok) {
      throw new Error("Erro ao consultar sessão.");
    }
    usuarioLogado = await response.json();
    window.usuarioLogado = usuarioLogado;
    return usuarioLogado;
  } catch (error) {
    console.error("Erro ao carregar sessão:", error);

    usuarioLogado = null;
    window.usuarioLogado = null;
    return null;
  }
}
console.log("Sessão carregada:", usuarioLogado);
window.sessaoPronta = carregarSessao();
console.log("Sessão pronta:", window.sessaoPronta);

const daltonismFilters = {
  none: null,
  protanopia: "color-filter-protanopia",
  deuteranopia: "color-filter-deuteranopia",
  tritanopia: "color-filter-tritanopia",
  achromatopsia: "color-filter-achromatopsia",
};

function initializeDaltonismFilter() {
  if (!document.body || document.getElementById("daltonism-widget")) {
    return;
  }

  const definitions = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  definitions.id = "color-filter-definitions";
  definitions.setAttribute("aria-hidden", "true");
  definitions.innerHTML = `
    <defs>
      <filter id="color-filter-protanopia" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"/>
      </filter>
      <filter id="color-filter-deuteranopia" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"/>
      </filter>
      <filter id="color-filter-tritanopia" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0"/>
      </filter>
      <filter id="color-filter-achromatopsia" color-interpolation-filters="sRGB">
        <feColorMatrix type="saturate" values="0"/>
      </filter>
    </defs>
  `;
  document.body.appendChild(definitions);

  const widget = document.createElement("aside");
  widget.id = "daltonism-widget";
  widget.innerHTML = `
    <section id="daltonism-panel" aria-labelledby="daltonism-title" hidden>
      <div class="daltonism-panel-header">
        <h2 id="daltonism-title">Filtro de daltonismo</h2>
        <button type="button" id="daltonism-close" aria-label="Fechar opções de filtro">&times;</button>
      </div>
      <label for="daltonism-select">Tipo de daltonismo</label>
      <select id="daltonism-select">
        <option value="none">Sem filtro</option>
        <option value="protanopia">Protanopia (vermelho)</option>
        <option value="deuteranopia">Deuteranopia (verde)</option>
        <option value="tritanopia">Tritanopia (azul)</option>
        <option value="achromatopsia">Acromatopsia (tons de cinza)</option>
      </select>
      <p>O filtro de simulação é aplicado ao conteúdo do site.</p>
    </section>
    <button type="button" id="daltonism-toggle" aria-expanded="false" aria-controls="daltonism-panel">
      Filtro
    </button>
  `;
  document.body.appendChild(widget);

  const panel = widget.querySelector("#daltonism-panel");
  const toggle = widget.querySelector("#daltonism-toggle");
  const close = widget.querySelector("#daltonism-close");
  const select = widget.querySelector("#daltonism-select");

  function applyFilter(filter) {
    if (filter) {
      document.documentElement.dataset.colorFilter = filter;
    } else {
      delete document.documentElement.dataset.colorFilter;
    }
  }

  const savedFilter = localStorage.getItem("daltonism-filter");
  const initialFilter = Object.prototype.hasOwnProperty.call(daltonismFilters, savedFilter)
    ? savedFilter
    : "none";
  select.value = initialFilter;
  applyFilter(daltonismFilters[initialFilter]);

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    panel.hidden = isOpen;
    toggle.setAttribute("aria-expanded", String(!isOpen));
  });

  close.addEventListener("click", () => {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  });

  select.addEventListener("change", () => {
    const selectedFilter = select.value;
    if (!Object.prototype.hasOwnProperty.call(daltonismFilters, selectedFilter)) {
      return;
    }

    applyFilter(daltonismFilters[selectedFilter]);
    localStorage.setItem("daltonism-filter", selectedFilter);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });
}

initializeDaltonismFilter();

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

async function carregarSidebar() {
  if (!sidebarPlaceholder) return;

  try {
    // Aguarda a identificação do usuário
    await window.sessaoPronta;

    const response = await fetch("sidebar.html");
    if (!response.ok) {
      throw new Error("Erro ao carregar sidebar.");
    }
    const data = await response.text();
    sidebarPlaceholder.innerHTML = data;
    toggleBtn = document.getElementById("toggle-btn");
    sidebar = document.getElementById("sidebar");

    // Restringe os links conforme o cargo
    if (usuarioLogado?.usuariocol === "funcionario") {

      const linksRestritos = [
        "usuarios.html"
      ];
      sidebar.querySelectorAll("a").forEach(link => {
        const href = link.getAttribute("href");

        if (linksRestritos.includes(href)) {
          link.closest("li")?.remove();
        }
      });
    }

    highlightCurrentPage();

  } catch (error) {
    console.error("Erro ao carregar sidebar:", error);
  }
}

carregarSidebar();
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
  try {
    const response = await fetch("/api/usuarios");
    if (!response.ok) {
      throw new Error("Erro ao buscar usuários.");
    }
    usuarios = await response.json();
    const tbody = document.querySelector("#tabela-usuarios");
    if (!tbody) return;
    tbody.innerHTML = "";

    // Mantenha aqui o restante do seu código atual

    usuarios.forEach((usuario) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${usuario.idusuario}</td>
      <td><img src="/uploads/img/${usuario.foto}" alt="Foto" class="fotoIcon"></td>
      <td>${usuario.nome}</td>
      <td>${usuario.email}</td>
      <td>${usuario.usuariocol}</td>
      <td>${new Date(usuario.dataCriacao).toLocaleDateString("pt-BR")}</td>
      <td>
        <button type="button" class="btn btn-warning" onclick="editarUsuario(${usuario.idusuario})">Editar</button>
        <button type="button" class="btn btn-danger" onclick="excluirUsuario(${usuario.idusuario})">Excluir</button>
      </td>
    `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
  }
}
async function editarUsuario(id) {
  const usuario = usuarios.find(u => u.idusuario === id);
  if (!usuario) {
    alert("Usuário não encontrado.");
    return;
  }
  usuarioEditando = id;
  document.getElementById("nome-user").value = usuario.nome;
  document.getElementById("nome-email").value = usuario.email;
  document.getElementById("escopo-user").value = usuario.usuariocol;
}

async function excluirUsuario(id) {
  if (confirm("Deseja mesmo excluir este usuário?")) {
    await fetch(`/api/usuarios/${id}`, {
      method: "DELETE",
    });
    fetchUsuarios();
  }
}
if (document.getElementById("tabela-usuarios")) {
  fetchUsuarios();
}