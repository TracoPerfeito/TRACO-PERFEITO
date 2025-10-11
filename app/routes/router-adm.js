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

// Listagem de denúncias de comentários
router.get(
  "/adm-lista-denuncias-comentarios",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.listarDenunciasComentarios(req, res);
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

// Alterar status da denúncia (comentário)
router.get(
  "/adm/penalidades",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.getPenalidades(req, res);
  }
);
router.post(
  "/adm/alterar-status-denuncia",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.alterarStatusDenuncia(req, res);
  }
);

module.exports = router;
