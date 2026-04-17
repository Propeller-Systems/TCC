let toggleBtn;
let sidebar;

function toggleSidebar(){
    sidebar.classList.toggle("close");
    toggleBtn.classList.toggle("rotate");

    Array.from(sidebar.getElementsByClassName("show")).forEach(ul => {
        ul.classList.remove("show");
        ul.previousElementSibling.classList.remove("rotate");
    });
}

function toggleSubmenu(button){
    const subMenu = button.nextElementSibling;

    // Fechar outros submenus antes de abrir o atual (evita gaps no mobile)
    Array.from(sidebar.querySelectorAll('.sub-menu.show')).forEach(menu => {
        if (menu !== subMenu) {
            menu.classList.remove('show');
            if (menu.previousElementSibling && menu.previousElementSibling.classList.contains('rotate')) {
                menu.previousElementSibling.classList.remove('rotate');
            }
        }
    });

    subMenu.classList.toggle("show");
    button.classList.toggle("rotate");

    if(sidebar.classList.contains("close")){
        sidebar.classList.toggle("close");
        toggleBtn.classList.toggle("rotate");
    }
}

fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
    document.getElementById('sidebar-placeholder').innerHTML = data;

    toggleBtn = document.getElementById("toggle-btn");
    sidebar = document.getElementById("sidebar");

    // Highlight a página atual
    highlightCurrentPage();
});

function highlightCurrentPage(){
    // Pega o nome do arquivo atual da URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Itera por todos os links do sidebar
    const links = sidebar.querySelectorAll('a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        
        // Compara o URL do link com a página atual
        if(href === currentPage || (currentPage === '' && href === 'index.html')){
            // Adiciona a classe active no elemento pai (li)
            link.parentElement.classList.add('active');
        } else {
            // Remove a classe active se existir
            link.parentElement.classList.remove('active');
        }
    });
}

console.log(window.location.pathname.split('/'));


// Função para abrir o modal de criação de aviso (exemplo simples)
const btnAviso = document.getElementById('btnAviso')

function abrirModal(){
    let modal = document.createElement('dialog');
    modal.id = 'avisoModal';
    modal.className = 'container-cms';
    console.log(modal);
    modal.style.display = 'block';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.zIndex = '1000'; // Garante que o modal fique acima de outros elementos
    
    modal.innerHTML = `<h3>Criar Novo Aviso</h3>
            <form id="formAviso" class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <label for="titulo">Título do Aviso</label>
                    <input type="text" id="titulo" name="titulo" class="border border-border input-group rounded-lg p-2">
                </div>
                <div class="flex flex-col gap-2">
                    <label for="data">Data de Publicação</label>
                    <input type="date" id="data" name="data" class="border border-border rounded-lg p-2">
                </div>
                <div class="flex flex-col gap-2">
                    <label for="escopo">Escopo de Pessoas</label>
                    <select id="escopo" name="escopo" class="border border-border rounded-lg p-2">
                        <option value="">Selecione o escopo</option>
                        <option value="alunos">Alunos</option>
                        <option value="professores">Professores</option>
                        <option value="todos">Todos</option>
                    </select>
                </div>
                <div class="flex flex-col gap-2">
                    <label for="conteudo">Conteúdo do Aviso</label>
                    <textarea id="conteudo" name="conteudo" rows="4" class="border border-border rounded-lg p-2"></textarea>
                </div>
                <button type="submit" class="btn btn-success">Publicar Aviso</button>`;
    
    console.log(modal);
    document.body.style.filter = 'blur(1px)'; // Aplica blur ao fundo
    document.body.style.overflow = 'hidden'; // Impede rolagem do fundo
    
    document.body.appendChild(modal);
    modal.showModal(); // Abre o modal

}
