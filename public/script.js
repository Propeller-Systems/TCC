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
});



