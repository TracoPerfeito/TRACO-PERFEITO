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

// Listagem para apenas profissionais
router.get(
  "/adm-listagem-profissional",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  (req, res) => {
    admController.listarUsuariosPorTipo(req, res);
  }
);

// Listagem para apenas comuns
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

module.exports = router;
