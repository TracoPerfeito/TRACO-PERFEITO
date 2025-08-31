const express = require("express");
const router = express.Router();

const admController = require("../controllers/admController");

const {
  verificarUsuAutenticado,
  limparSessao,
  gravarUsuAutenticado,
  verificarUsuAutorizado,
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
router.get("/", function (req, res) { //login
  res.render('pages/adm-login',  {retorno: null, valores: {email: "", password: ""}, errosLogin: null});

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
    verificarUsuAutenticado, // primeiro garante que está logado
    verificarUsuAutorizado(["administrador"], "pages/acesso-negado"), // depois verifica se é admin
    (req, res) => {
        // pega notificação que veio da sessão
        const dadosNotificacao = req.session.dadosNotificacao || null;
        req.session.dadosNotificacao = null;

        res.render("pages/adm-home", { 
            autenticado: req.session.autenticado,
            logado: req.session.logado,
            dadosNotificacao 
        });

        console.log(req.session.logado);
    }
);





module.exports = router;
