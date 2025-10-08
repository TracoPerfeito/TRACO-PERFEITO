const admModel = require("../models/admModel");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);
var pool = require("../../config/pool_conexoes");
const { listarUsuariosPaginados } = require("./admListagemController");

const { verificadorCelular, validarCPF } = require("../helpers/validacoes");

const admController = {
    regrasLoginADM: [
        body("emailADM")
            .isEmail().withMessage("Insira um email válido."),
        body("senhaADM")
            .notEmpty().withMessage("Insira sua senha.")
    ],



    regrasValidacaoContato: [
  
body("nome").isLength({ min: 3, max: 50 }).withMessage('O nome deve ter de 3 a 50 caracteres.')
      .custom(nome => {
        if (/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/.test(nome)) {
            throw new Error('O nome deve conter apenas letras.');
        }
        return true; 
      }),
    body("email")
            .isEmail().withMessage("Insira um email válido."),
         body('celular').isLength({ min: 10, max: 14 } ).withMessage('Número de celular inválido.')

       .custom(celular => verificadorCelular(celular)).withMessage('Número de celular inválido.'),
            body("mensagem")
        .notEmpty()
     .isLength({ min: 2, max: 700 })
    .withMessage("O nome deve ter no mínimo 2 e no máximo 70 caracteres."),
  
    ],

 logar: (req, res) => {
    const autenticado = req.session.autenticado;

    if (autenticado && autenticado.autenticado !== null) {
        console.log("Administrador encontrado. Login realizado com sucesso!");
            return res.redirect("/adm/adm-home");

    } else {
        console.log("❌ Administrador não autenticado. Erro no login.");
        return res.render("pages/adm-login", {
            valores: req.body,
            errosLogin: [],
            retorno: "E-mail ou senha inválidos."
        });
    }
},

mostrarhome: (req, res, dadosNotificacao) => {
    console.log("Chegou no adm mostrar home");
    res.render("pages/adm-home", { autenticado: req.session.autenticado, logado: req.session.logado, dadosNotificacao: {
        titulo: "temo ",
        mensagem: "af",
        tipo:  "success"
    } });
},

    listarDenunciasComentarios: async (req, res, dadosNotificacao) => {
        console.log("Chegou no listar denúncias de comentários");
        try {
        let DenunciasComentarios = await admModel.listarDenunciasComentarios();
        console.log({ DenunciasComentarios });
        res.render("pages/adm-lista-denuncias-comentarios", {
            autenticado: req.session.autenticado,
            logado: req.session.logado,
            denuncias: DenunciasComentarios || []
        });
        } catch (error) {
        console.error("Erro ao listar denúncias de comentários:", error);
        res.status(500).render("pages/erro-conexao", {
            mensagem:
            "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
        });
        }
    },

    //ORGANIZAR ISSO E O ROUTER


    //Listagem para apenas comuns
    listarUsuariosPorTipo: async (req, res) => {
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
    },

    //Listagem para apenas profissionais
        listarUsuariosPorTipo: async (req, res) => {
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
      },

        //Listagem paginação de usuários
      listarUsuariosPaginados:async (req, res) => {
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
      },

      //Contagem da quantidade de usuários no site
listarNumeroDePerfis: async (req, res) => {
  try {
    const dadosNotificacao = req.session ? req.session.dadosNotificacao || null : null;

    if (req.session) {
      req.session.dadosNotificacao = null;
    }

    const totalUsuarios = await admModel.contarUsuarios();
    const totalComuns = await admModel.contarUsuariosPorTipo('comum');
    const totalProfissionais = await admModel.contarUsuariosPorTipo('profissional');

    console.log({ totalUsuarios, totalComuns, totalProfissionais });

    res.render("pages/adm-home", {
      autenticado: req.session?.autenticado || false,
      logado: req.session?.logado || null,
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
},
    
    




 enviarMensagemQuemSomos: async (req, res) => {
    console.log("Chegou no enviar msg quem somos");
     
    try {

      
      console.log("Dados do formulário recebidos:", req.body);
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        console.log("Não passou pela validação!")
        req.session.dadosNotificacao = {
          titulo: "Erro ao enviar formulário!",
          mensagem: "Verifique os campos e tente novamente.",
          tipo: "error"
        };

        return res.redirect("/quemsomos");
      }

      const {nome, email, celular, mensagem} = req.body;
      
      const novoRegistro = {
        NOME_PESSOA: nome,       
        EMAIL_PESSOA: email,  
        CELULAR_PESSOA: celular,
        MENSAGEM: mensagem
        
      };

      const resultado = await admModel.salvarMsgQuemSomos(novoRegistro);
      

      if (!resultado) {
        req.session.dadosNotificacao = {
          titulo: "Erro",
          mensagem: "Não foi possível salvar sua mensagem. Tente novamente mais tarde.",
          tipo: "error"
        };
       
        return res.redirect("/quemsomos");
      } else{
        console.log("Deu certo!")
        console.log(resultado)
      

      req.session.dadosNotificacao = {
        titulo: "Mensagem salva!",
        mensagem: "Nossa equipe de suporte entrará em contato para responder suas dúvidas! Aguarde...",
        tipo: "success"
      };

     
        return res.redirect("/quemsomos");
    }

    } catch (erro) {
      console.error("Erro ao salvar mensagem: ", erro);
      req.session.dadosNotificacao = {
        titulo: "Erro interno!",
        mensagem: "Ocorreu um erro ao enviar o formulário. Tente novamente mais tarde. ",
        tipo: "error"
      };
      
        return res.redirect("/quemsomos");
    }
  },






};

module.exports = admController;
