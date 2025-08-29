const express = require("express");
const router = express.Router();

const {
  mostrarPaginaDeLoginADM,
  processarLoginADM,
  mostrarPainelAdmin,
  encerrarSessaoADM,
  RegrasLoginADM
} = require("../controllers/admController");

const {
  verificarUsuAutenticado,
  verificarUsuAutorizado
} = require("../models/autenticador_adm_middleware");
const { verificarDuplicidade } = require("../models/usuariosModel");


// router.get("/adm-login", function (req, res) { //login do adm
//   res.render('adm-login', {retorno: null, valores: {email: "", password: ""}, listaErros: null});

// });

// router.get(
//   "/adm-home",
//   verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
//   async function (req, res) {
//     usuariosController.mostrarPerfil(req, res);
//   }
// );

// Mostrar página de login do administrador
router.get("/adm-login", function (req, res) { //login
  res.render('pages/login',  {retorno: null, valores: {email: "", password: ""}, errosLogin: null});

});

// Processar login do administrador
router.post("/adm-login", RegrasLoginADM, processarLoginADM);

// ADM / Home - Painel do Administrador
router.get(
  "/adm-home",
  verificarUsuAutenticado,    // checa se existe sessão
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"), // checa se é admin
  mostrarPainelAdmin
);

// Logout do administrador
router.get("/adm-logout", encerrarSessaoADM);

module.exports = router;
