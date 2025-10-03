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

});


router.post( //validações login
    "/logar-como-adm",
   admController.regrasLoginADM, 
   gravarUsuAutenticado, function (req, res) {
    admController.logar(req, res);
   }
);

router.get( // listar numeros de Perfis
  "/adm-home",
  verificarUsuAutenticado, function(req, res){
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  admController.listarNumeroDePerfis(res, res)}
);


// Listagem dos usuários geral
router.get(
  "/adm-lista-usuarios",
  verificarUsuAutenticado, function(req, res, next) {
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  admListagemController.listarUsuariosPaginados,
  admController.listarUsuariosPaginados(req, res)}

);

//Listagem para apenas profissionais
router.get(
  "/adm-listagem-profissional", function(req, res) {
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  admController.listarUsuariosPorTipo(req, res)}
);

//Listagem para apenas comuns
router.get(
  "/adm-listagem-comum", function(req, res){
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  admController.listarUsuariosPorTipo(req, res)}
);


//Listagem de denúncias de comentários
router.get(
  "/adm-lista-denuncias-comentarios",  function(req, res) {
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  admController.listarDenunciasComentarios(req, res)}
);














module.exports = router;
