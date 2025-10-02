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
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  async (req, res) => { // async é obrigatório aqui
    try {
      const dadosNotificacao = req.session.dadosNotificacao || null;
      req.session.dadosNotificacao = null;

      // Chama funções do ADM MODEL, não usuariosModel
      const totalUsuarios = await admModel.contarUsuarios();
      const totalComuns = await admModel.contarUsuariosPorTipo('comum');
      const totalProfissionais = await admModel.contarUsuariosPorTipo('profissional');

      // DEBUG: verifica se os números chegaram
      console.log({ totalUsuarios, totalComuns, totalProfissionais });

      res.render("pages/adm-home", { 
        autenticado: req.session.autenticado,
        logado: req.session.logado,
        dadosNotificacao,
        totalUsuarios,
        totalComuns,
        totalProfissionais
      });

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      res.status(500).render('pages/erro-conexao', {
      mensagem: "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
    });
    }
  }
);



router.get(
  "/adm-lista-usuarios",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  admListagemController.listarUsuariosPaginados,

  async (req, res) => {
    try {
    

      const listarUsuarios = await admModel.listarUsuarios();
      console.log({listarUsuarios});

      res.render("pages/adm-lista-usuarios", {
        autenticado: req.session.autenticado,
        logado: req.session.logado,
        usuarios: listarUsuarios || []
      });

    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      res.status(500).render('pages/erro-conexao', {
      mensagem: "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
    });
    }
  }
);

//Listagem para apenas profissionais
router.get(
  "/adm-listagem-profissional",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),

  async (req, res) => {
    try {
      const usuariosProfissionais = await admModel.listarUsuariosPorTipo('profissional');
      console.log({usuariosProfissionais});

      res.render("pages/adm-listagem-profissional", {
        autenticado: req.session.autenticado,
        logado: req.session.logado,
        usuarios: usuariosProfissionais
      });
    } catch (error) {
      console.error("Erro ao listar usuários profissionais:", error);
      res.status(500).render('pages/erro-conexao', {
      mensagem: "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
    });
    }
  }
)

//Listagem para apenas comuns

router.get(
  "/adm-listagem-comum",
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),

  async (req, res) => {
    try {
      const usuariosComuns = await admModel.listarUsuariosPorTipo('comum');
      console.log({usuariosComuns});

      res.render("pages/adm-listagem-comum", {
        autenticado: req.session.autenticado,
        logado: req.session.logado,
        usuarios: usuariosComuns
      });
    } catch (error) {
      console.error("Erro ao listar usuários comuns:", error);
      res.status(500).render('pages/erro-conexao', {
      mensagem: "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
    });
    }
  }
);


//Listagem de denúncias de comentários

router.get(
  "/adm-lista-denuncias-comentarios",  function(req, res) {
  verificarUsuAutenticado,
  verificarUsuAutorizado(["administrador"], "pages/acesso-negado"),
  admController.listarDenunciasComentarios(req, res)}

);














module.exports = router;
