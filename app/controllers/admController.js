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

};

module.exports = admController;
