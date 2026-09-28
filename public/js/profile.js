const express = require("express");
const router = express.router();
const auth = require("../middleware/auth")
let perfilExibir = document.getElementById('profile-div')

// router.get("/", auth, (req, res)=>{
//     const usuariop = req.session.usuario;
// });

async function carregarPerfil() {
  try{
  const response = await fetch("/api/usuarios");
  const perfil = await response.json();
  renderizarPerfil(perfil);
  }catch(err){
    console.log("Erro ao carregar avisos", err);
  }
}

function renderizarPerfil(perfil){
    perfilAtual = perfil;
    perfilExibir.innerHTML = "";

    perfil.forEach((perfil) => {
        const div = document.getElementById('perfil');
        div.innerHTML = `
        <img class="picture-profile" src="/image/${usuarios.foto}">
        <label class="name">${usuarios.name}</label>
        <h2>Mensagens:</h2>
        <p>"AQUI VAI RECEBER ALGUMA MENSAGEM ENVIADA A ELE"</p>
        `;
        perfilExibir.appendChild(div);
    });
}

carregarPerfil();
