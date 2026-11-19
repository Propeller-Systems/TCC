const perfilExibir = document.getElementById("profile-div");

async function carregarPerfil() {
    try {
        const response = await fetch("/api/usuarios/perfil");

        if (!response.ok) {
            throw new Error("Erro ao buscar perfil");
        }

        const perfil = await response.json();
        renderizarPerfil(perfil);
    } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        perfilExibir.innerHTML = `
            <p class="profile-error" role="alert">
                Não foi possível carregar as informações do perfil. Atualize a página para tentar novamente.
            </p>
        `;
    }
}

function renderizarPerfil(perfil) {
    const nome = perfil.nome || "Usuário";
    const tipoUsuario = perfil.usuariocol === "admin" ? "Administrador" : "Colaborador";

    const identidade = document.createElement("div");
    identidade.className = "profile-identity";

    if (perfil.foto) {
        const avatar = document.createElement("div");
        avatar.className = "profile-avatar";

        const foto = document.createElement("img");
        foto.src = `/uploads/img/${encodeURIComponent(perfil.foto)}`;
        foto.alt = `Foto de perfil de ${nome}`;
        foto.addEventListener("error", () => {
            avatar.remove();
        }, { once: true });

        avatar.appendChild(foto);
        identidade.appendChild(avatar);
    }

    const dadosIdentidade = document.createElement("div");
    dadosIdentidade.className = "profile-identity-copy";

    const nomeUsuario = document.createElement("h2");
    nomeUsuario.textContent = nome;

    const funcao = document.createElement("span");
    funcao.className = "profile-role";
    funcao.textContent = tipoUsuario;

    dadosIdentidade.append(nomeUsuario, funcao);
    identidade.appendChild(dadosIdentidade);

    const detalhes = document.createElement("div");
    detalhes.className = "profile-details";

    const email = document.createElement("div");
    email.className = "profile-detail";
    const emailLabel = document.createElement("span");
    emailLabel.textContent = "E-mail";
    const emailValor = document.createElement("p");
    emailValor.textContent = perfil.email || "Não informado";
    email.append(emailLabel, emailValor);

    const acesso = document.createElement("div");
    acesso.className = "profile-detail";
    const acessoLabel = document.createElement("span");
    acessoLabel.textContent = "Tipo de acesso";
    const acessoValor = document.createElement("p");
    acessoValor.textContent = tipoUsuario;
    acesso.append(acessoLabel, acessoValor);

    detalhes.append(email, acesso);
    perfilExibir.replaceChildren(identidade, detalhes);
}

carregarPerfil();