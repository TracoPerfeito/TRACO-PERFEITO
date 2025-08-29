const admModel = require("../models/admModel");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);
var pool = require("../../config/pool_conexoes");


    const RegrasLoginADM = [
        body('emailDigitadoADM')
            .trim()
            .isEmail().withMessage("Informe um e-mail válido.")
            .normalizeEmail(),
        body('senhaDigitadaADM')
            .isLength({min: 8}).withMessage("A senha precisa ter no mínimo 8 caracteres.")
            .matches(/[A-Z]/).withMessage('A senha precisa de pelo menos 1 letra maiúscula.')
            .matches(/[a-z]/).withMessage('A senha precisa de pelo menos 1 letra minúscula.')
            .matches(/[0-9]/).withMessage('A senha precisa de pelo menos 1 número.')
            .matches(/[@$!%*?&]/).withMessage('A senha precisa de pelo menos 1 caractere especial (@$!%*?&).')
    ]





    async function processarLoginADM(req, res) {
            //1) Checar validações de formato/força
            const resultadoValidacao = validationResult(req);
            if (!resultadoValidacao.isEmpty()) {
                return res.status(400).render('pages/adm-login', {
                    listaDeErros: resultadoValidacao.array(),
                    valoresAntigos: {emailDigitadoADM: req.body.emailDigitadoADM || ''}
                })
            }        
        

        const emailInformadoADM = req.body.emailDigitadoADM;
        const senhaInformada = req.body.senhaDigitadaADM;


        //2) Buscar admin pelo e-mail
        const [registrosEncontrados] = await pool.query(
            "SELECT * FROM USUARIOS WHERE EMAIL_USUARIO = ? AND TIPO_USUARIO = 'administrador' LIMIT 1",
            [emailInformadoADM]
        );

        if (registrosEncontrados.length === 0) {
            return res.status(401).render('pages/adm-login', {
                listaDeErros: [{ msg: 'Administrador não encontrado.' }],
                valoresAntigos: { emailDigitadoADM: emailInformadoADM }
            });
        }

        const registroAdministrador = registrosEncontrados[0];

        //3) Verificar senha com o hash 
        const senhaCorreta = bcrypt.compareSync(senhaInformada, registroAdministrador.SENHA_USUARIO);
        if (!senhaCorreta) {
            return res.status(401).render('pages/adm-login', {
                listaDeErros: [{ msg: 'Senha incorreta.' }],
                valoresAntigos: { emailDigitadoADM: emailInformadoADM }
            });
        }

        //4) Criar sessão com dados que vamos usar no HTML
        req.session.dadosDoAdministradorLogado = {
            id: registroAdministrador.ID_USUARIO,
            nome: registroAdministrador.NOME_USUARIO,
            email: registroAdministrador.EMAIL_USUARIO,
            img_perfil_banco: registroAdministrador.FOTO_PERFIL_BANCO_USUARIO,  
            //não vamos guardar a senha por segurança
        };

        return res.redirect('/adm-home'); // Redirecionar para o dashboard do administrador
    }


// module.exports = admController;
module.exports = {
    RegrasLoginADM,
    processarLoginADM
};


