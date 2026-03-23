const toggleBtn = document.getElementById("toggle-btn");
const sidebar = document.getElementById("sidebar");

function toggleSiderbar(){
    sidebar.classList.toggle("close");
    toggleBtn.classList.toggle("rotate");

    Array.from(sidebar.getElementsByClassName("show")).forEach(ul => {
        ul.classList.remove("show");
        ul.previousElementSibling.classList.remove("rotate");
    });
}

function toggleSubmenu(button){
    const subMenu = button.nextElementSibling;
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
});

