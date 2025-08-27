const express = require("express");
const router = express.Router();
const admController = require("../controllers/admController");
const roteadorAutenticacao = express.Router();


// router.get("/", verificarUsuAutorizado(["administrador"], "pages/acesso-negado"), function (req, res) { 
//     res.render('pages/adm-inicial', req.session.autenticado)
 
// });


// router.get("/adm-login", function (req, res) { //login
//     res.render('pages/adm-login',  {retorno: null, valores: {email: "", password: ""}, errosLogin: null});

 
// });



// router.post( //validações login
//     "/adm-login",
//     function (req, res, next) {
//       console.log("POST /adm-login recebido");
//       next();
//     },
//     admController.regrasValidacaoLogin, 
//     gravarUsuAutenticado,
//     function (req, res) {
//       admController.logar(req, res);
//     }
// );




router.get("/adm-login", function (req, res) { //login do adm
  res.render('pages/adm-login', {retorno: null, valores: {email: "", password: ""}, listaErros: null});

});

router.get(
  "/adm-home",
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  async function (req, res) {
    usuariosController.mostrarPerfil(req, res);
  }
);



const {mostrarPaginaDeLoginADM, processarLoginADM, mostrarPainelAdmin, encerrarSessaoADM} = 
  require('../controllers/admController');

const {RegrasLoginADM} = require('../controllers/admController');
const {garantirAutenticacao} = require('../models/autenticador_middleware');

// GET: página de Login
roteadorAutenticacao.get('/', mostrarPaginaDeLoginADM);

// POST: processar Login
roteadorAutenticacao.post('/login-adm', RegrasLoginADM, processarLoginADM);

// GET: painel do administrador (Dashboard protegido)
roteadorAutenticacao.get('/dashboard', verificarUsuAutenticado, mostrarPainelAdmin);

// GET: encerrar sessão do administrador
roteadorAutenticacao.get('/logout', encerrarSessaoADM);



module.exports = router;
