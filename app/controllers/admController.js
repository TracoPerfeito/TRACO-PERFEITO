const usuariosModel = require("../models/usuariosModel");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);
var pool = require("../../config/pool_conexoes");


//const { verificadorCelular, validarCPF } = require("../helpers/validacoes");//

const admController = {

// regrasValidacaoLogin: [
//         body("email")
//             .isEmail()
//             .withMessage("Insira um email válido"),
//         body("password")
//             .isStrongPassword()
//             .withMessage("A senha deve ter no mínimo 8 caracteres (mínimo 1 letra maiúscula, 1 caractere especial e 1 número)")
//     ],





//  logar: (req, res) => {
//     const autenticado = req.session.autenticado;

//     if (autenticado && autenticado.autenticado !== null) {
   
//         if (autenticado.tipo === "administrador") {
//             console.log("🔄 Redirecionando para o painel do Administrador.");
//             return res.redirect("/adm/");
//         } else {
//             console.log("⚠️ Tipo de usuário desconhecido.");
//             return res.redirect("/");
//         }
        
//     } else {
//         console.log("❌ Usuário não autenticado. Erro no login.");
//         return res.render("pages/login", {
//             valores: req.body,
//             errosLogin: [],
//             retorno: "E-mail ou senha inválidos."
//         });
//     }
// }


// }

     RegrasLoginADM : [
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
    ],



     mostrarPaginaDeLoginADM: async (req, res) =>{
        return res.render('adm-login', {
            listaDeErros: [],
            valoresAntigos: {emailDigitadoADM: ''}
        });
    },

     processarLoginADM: async(req, res)  =>{
            //1) Checar validações de formato/força
            const resultadoValidacao = validationResult(req);
            if (!resultadoValidacao.isEmpty()) {
                return res.status(400).render('adm-login', {
                    listaDeErros: resultadoValidacao.array(),
                    valoresAntigos: {emailDigitadoADM: req.body.emailDigitadoADM || ''}
                })
            }        
        

        const emailInformadoADM = req.body.emailDigitadoADM;
        const senhaInformada = req.body.senhaDigitada;


        //2) Buscar admin pelo e-mail
        //VER COMO COLOQUEI O NOME DOS CAMPOS, PELO AMOR DE DEUS
        const [registrosEncontrados] = await pool.query(
            'SELECT ID_ADM, NOME_ADM, EMAIL_ADM, SENHA_ADM FROM USUARIO_ADM WHERE EMAIL_ADM = ? LIMIT 1',
            [emailInformadoADM]
        );

        if (registrosEncontrados.length === 0) {
            return res.status(401).render('adm-login', {
                listaDeErros: [{ msg: 'Administrador não encontrado.' }],
                valoresAntigos: { emailDigitadoADM: emailInformadoADM }
            });
        }

        const registroAdministrador = registrosEncontrados[0];

        //3) Verificar senha com o hash 
        const senhaCorreta = bcrypt.compareSync(req.body.password, usuarioEncontrado.SENHA_USUARIO);

        if (!senhaCorreta) {
            return res.status(401).render('adm-login', {
                listaDeErros: [{ msg: 'Senha incorreta.' }],
                valoresAntigos: { emailDigitadoADM: emailInformadoADM }
            });
        }

        //4) Criar sessão com dados que vamos usar no HTML
        req.session.dadosDoAdministradorLogado = {
            id: registroAdministrador.ID_ADM,
            nome: registroAdministrador.NOME_ADM,
            email: registroAdministrador.EMAIL_ADM,
            tipo: 'administrador' //ver se bate com o nome no banco AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
            //não vamos guardar a senha por segurança
        };

        return res.redirect('/dashboard'); // Redirecionar para o dashboard do administrador
    },

     mostrarPainelAdmin: async (req, res) => {
        return res.render('adm-home', {
            adminLogado: req.session.dadosDoAdministradorLogado
        });     
    },

     encerrarSessaoADM: async (req, res) =>{
        req.session.destroy(() => {
            res.redirect('/');
        });
    }

}


module.exports = admController;
           

