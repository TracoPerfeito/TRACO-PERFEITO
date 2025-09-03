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

    // processarLoginADM: async (req, res) => {
    //     // 1) Checar validações
    //     const resultadoValidacao = validationResult(req);
    //     if (!resultadoValidacao.isEmpty()) {
    //         return res.status(400).render("pages/adm-login", {
    //             listaDeErros: resultadoValidacao.array(),
    //             valoresAntigos: { emailDigitadoADM: req.body.emailDigitadoADM || "" }
    //         });
    //     }

    //     const emailInformadoADM = req.body.emailDigitadoADM;
    //     const senhaInformada = req.body.senhaDigitadaADM;

    //     // 2) Buscar admin no banco
    //     const [registrosEncontrados] = await pool.query(
    //         "SELECT * FROM USUARIOS WHERE EMAIL_USUARIO = ? AND TIPO_USUARIO = 'administrador' LIMIT 1",
    //         [emailInformadoADM]
    //     );

    //     if (registrosEncontrados.length === 0) {
    //         return res.status(401).render("pages/adm-login", {
    //             listaDeErros: [{ msg: "Administrador não encontrado." }],
    //             valoresAntigos: { emailDigitadoADM: emailInformadoADM }
    //         });
    //     }

    //     const registroAdministrador = registrosEncontrados[0];

    //     // 3) Verificar senha
    //     const senhaCorreta = await bcrypt.compare(senhaInformada, registroAdministrador.SENHA_USUARIO);
    //     if (!senhaCorreta) {
    //         return res.status(401).render("pages/adm-login", {
    //             listaDeErros: [{ msg: "Senha incorreta." }],
    //             valoresAntigos: { emailDigitadoADM: emailInformadoADM }
    //         });
    //     }

    //     // 4) Criar sessão
    //     req.session.dadosDoAdministradorLogado = {
    //         id: registroAdministrador.ID_USUARIO,
    //         nome: registroAdministrador.NOME_USUARIO,
    //         email: registroAdministrador.EMAIL_USUARIO,
    //         img_perfil_banco: registroAdministrador.FOTO_PERFIL_BANCO_USUARIO
    //     };

    //     return res.redirect("/adm-home");
    // }
};

module.exports = admController;
