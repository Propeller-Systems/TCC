document.addEventListener("click", (event) => {
    const button = event.target.closest(".btnOptions");

    if (!button) return;

    const dropdownBox = button.parentElement.querySelector(".dropdown-box");

    if (dropdownBox) {
        dropdownBox.classList.toggle("show");
    }
});


async function configurarAvisos() {
    await window.sessaoPronta;

    const btnAviso = document.getElementById("btnAviso");
    const aviso = document.getElementById("aviso");

    const admin = window.usuarioLogado?.usuariocol === "admin";

    if (!admin) {
        if (btnAviso) btnAviso.style.display = "none";
        if (aviso) aviso.style.display = "none";
        return;
    }

    if (btnAviso && aviso) {
        btnAviso.addEventListener("click", () => {
            aviso.style.display =
                aviso.style.display === "none" ? "block" : "none";
        });
    }
}

configurarAvisos();
