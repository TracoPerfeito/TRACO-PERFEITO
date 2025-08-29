//MODIFICAR, PQ ISSO É SÓ O COPIA E COLA DO OUTRO AUTENTICADOR MIDDLEWARE, FAZER PRA USUARIO ADM

const { validationResult } = require("express-validator");
const usuario = require("./admModel"); 
const bcrypt = require("bcryptjs");


// Verifica se o usuário está autenticado na sessão
const verificarUsuAutenticado = (req, res, next) => {
    if (req.session.autenticado) {
        req.session.logado = (req.session.logado || 0) + 1; // Incrementa o contador de logins
    } else {
        req.session.autenticado = { autenticado: null, id: null, tipo:null};
        req.session.logado = 0; 
    }
    next();
};




// Limpa a sessão (logout)
const limparSessao = (req, res, next) => {
  req.session.destroy(() => {
      next();
  });
};

// Faz login do administrador
const gravarUsuAutenticado = async (req, res, next) => {
    const erros = validationResult(req);

    if (!erros.isEmpty()) {
        return res.render("adm-login", {
            valores: req.body,
            errosLogin: erros.array(),
            retorno: "Erro na validação dos dados informados."
        });
    }

// Dados do formulário
const dadosForm = {
    email: req.body.email,
    senha_usuario: req.body.password,
};


// Buscar usuário no banco de dados
const results = await usuario.findUserEmail(dadosForm);

if (results.lenght === 0) {
    return res.render("adm-login", {
        valores: req.body,
        errosLogin: [],
        retorno: "Email não encontrado ou não é um administrador."
    });
}

const usuarioEncontrado = results[0];

if (usuarioEncontrado.STATUS_USUARIO === "inativo") {
    return res.render("adm-login", {
        valores: req.body,
        errosLogin: [],
        retorno: "Sua conta está inativa. Por favor, entre em contato com o suporte."
    });
}


// Verificar a senha
const senhaCorreta = bcrypt.compareSync(
    dadosForm.senha_usuario,
    usuarioEncontrado.SENHA_USUARIO
);

if (!senhaCorreta) {
    return res.render("adm-login", {
        valores: req.body,
        errosLogin: [],
        retorno: "Senha Incorreta."
    });
}


req.session.autenticado = {
    autenticado: usuarioEncontrado.NOME_USUARIO, // nome para exibição
    nome: usuarioEncontrado.NOME_USUARIO,
    user: usuarioEncontrado.USER_USUARIO,
    id: usuarioEncontrado.ID_USUARIO,
    email: usuarioEncontrado.EMAIL_USUARIO,
    tipo: usuarioEncontrado.TIPO_USUARIO
}

req.session.logado = 0;
next();
}


// Middleware de autorização -> garante que seja administrador
// const verificarUsuAutorizado = (req, res, next) => {
//     if (
//         req.session.autenticado &&
//         req.session.autenticado.tipo === "administrador"
//     ) {
//         return next();
//     } else {
//         return res.render("pages/adm-login", {
//             valores: {},
//             errosLogin: [],
//             retorno: "Acesso restrito a administradores."
//         });
//     }
// };

const verificarUsuAutorizado = (tipoPermitido, destinoFalha) => {
    return (req, res, next) => {
        if (
            req.session.autenticado &&                 // garante que a sessão existe
            req.session.autenticado.autenticado != null &&
            tipoPermitido.includes(req.session.autenticado.tipo)
        ) {
            next();
        } else {
            res.render(destinoFalha, req.session.autenticado || {});
        }
    };
};



module.exports = {
  verificarUsuAutenticado,
  limparSessao,
  gravarUsuAutenticado,
  verificarUsuAutorizado,
};
