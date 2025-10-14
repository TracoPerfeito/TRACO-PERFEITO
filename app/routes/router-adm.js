const express = require("express");
const router = express.Router();

const admController = require("../controllers/admController");
const admModel = require("../models/admModel");
const admListagemController = require("../controllers/admListagemController");

const {
  verificarUsuAutenticado,
  limparSessao,
  gravarUsuAutenticado,
  verificarUsuAutorizado,
} = require("../models/autenticador_adm_middleware");

const { verificarDuplicidade } = require("../models/usuariosModel");

// Mostrar página de login do administrador
router.get("/", function (req, res) { //login
  res.render('pages/adm-login',  {retorno: null, valores: {email: "", password: ""}, errosLogin: null});
console.log("Chegou no get adm-login");
});


router.post( //validações login
    "/logar-como-adm",
   admController.regrasLoginADM, 
   gravarUsuAutenticado, 
   function (req, res) {
    admController.logar(req, res);
   }
);

router.get(
  "/adm-home",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.listarNumeroDePerfis(req, res);
  }
);

// Listagem dos usuários geral
router.get(
  "/adm-lista-usuarios",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admListagemController.listarUsuariosPaginados(req, res);
  }
);

// Listagem para apenas usuários profissionais
router.get(
  "/adm-listagem-profissional",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.listarUsuariosPorTipo(req, res);
  }
);

// Listagem para apenas usuários comuns
router.get(
  "/adm-listagem-comum",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.listarUsuariosPorTipo(req, res);
  }
);

router.get(
  "/assinantes",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admListagemController.listarUsuariosAssinantesPaginados(req, res);
  }
);


// Listagem de denúncias de comentários
router.get(
  "/adm-lista-denuncias-comentarios",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.listarDenunciasComentarios(req, res);
  }
);

router.get(
  "/adm-lista-denuncias-publicacoes",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.listarDenunciasPublicacoes(req, res);
  }
);

router.get(
  "/adm-lista-denuncias-proposta",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.listarDenunciasProposta(req, res);
  }
);


// Desativar usuário (inativar)
router.put(
  "/desativar-usuario/:id",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.desativarUsuario(req, res);
  }
);

router.put(
  "/ativar-usuario/:id",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.ativarUsuario(req, res);
  }
);

// Alterar status da denúncia (comentário)
// Penalidades - aplicar penalidade
router.get(
  "/penalidades",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.listarPenalidades(req, res);
  }
);
router.post(
  "/alterar-status-denuncia",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.alterarStatusDenuncia(req, res);
  }
);

// Listagem de denúncias de perfis
router.get(
  "/adm-lista-denuncias-usuarios",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.listarDenunciasUsuarios(req, res);
  }
);

// Alterar status da denúncia (perfil)
router.post(
  "/alterar-status-denuncia-usuario",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.alterarStatusDenunciaUsuario(req, res);
  }
);

// Logout do administrador
router.get("/adm-logout", limparSessao, function (req, res) {
  res.redirect("/router-adm");
});








module.exports = router;
