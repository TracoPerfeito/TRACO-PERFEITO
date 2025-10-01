const admModel = require("../models/admModel");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);
var pool = require("../../config/pool_conexoes");

const admController = {
    regrasLoginADM: [
        body("emailADM")
            .isEmail().withMessage("Insira um email válido."),
        body("senhaADM")
            .notEmpty().withMessage("Insira sua senha.")
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
}

//ORGANIZAR ISSO E O ROUTER




};

module.exports = admController;
