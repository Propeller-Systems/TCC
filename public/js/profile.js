const perfilExibir = document.getElementById("profile-div");

async function carregarPerfil() {
    try {
        const response = await fetch("/api/usuarios/perfil");

        if (!response.ok) throw new Error("Erro ao buscar perfil");

        const perfil = await response.json();

        renderizarPerfil(perfil);

    } catch (err) {
        console.error("Erro ao carregar perfil:", err);
    }
}

function renderizarPerfil(perfil) {

    perfilExibir.innerHTML = `
        <img 
            class="picture-profile" 
            src="/uploads/img/${perfil.foto}"
        >
        <label class="name">
            ${perfil.nome}
        </label>
        <h2>Mensagens:</h2>
        <p>
            AQUI VAI RECEBER ALGUMA MENSAGEM ENVIADA A ELE
        </p>
    `;
}

carregarPerfil();