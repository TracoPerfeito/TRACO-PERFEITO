//MODIFICAR, PQ ISSO É SÓ O COPIA E COLA DO OUTRO AUTENTICADOR MIDDLEWARE, FAZER PRA USUARIO ADM

const { validationResult } = require("express-validator");
const admModel = require("./admModel"); 
const bcrypt = require("bcryptjs");


// Verifica se o usuário está autenticado na sessão
const verificarUsuAutenticado = (req, res, next) => {
    if (req.session.autenticado) {
        var autenticado = req.session.autenticado;
        req.session.logado = (req.session.logado || 0) + 1;
    } else {
        req.session.autenticado = { autenticado: null, id: null, tipo:null};
        req.session.logado = 0; 
    }
    req.session.autenticado = autenticado;
    next();
};




// Limpa a sessão (logout)
const limparSessao = (req, res, next) => {
  req.session.destroy(() => {
      next();
  });
};

// Faz login do administrador
// Faz login do administrador
const gravarUsuAutenticado = async (req, res, next) => {
    console.log("➡️ Iniciando login do administrador");

    const erros = validationResult(req);
    console.log("Erros de validação:", erros.array());

    if (!erros.isEmpty()) {
        console.log("❌ Erros de validação. Retornando para login.");
        return res.render("pages/adm-login", {
            valores: req.body,
            errosLogin: erros.array(),
            retorno: "Erro na validação dos dados informados."
        });
    }

    // Dados do formulário (nomes corrigidos)
    const dadosForm = {
        email: req.body.emailADM,
        senha_usuario: req.body.senhaADM,
    };
    console.log("Dados recebidos do formulário:", dadosForm);

    try {
        // Buscar usuário no banco de dados
        const results = await admModel.findUserEmail(dadosForm);
        console.log("Resultado da busca no banco:", results);

        // 1) Usuário não encontrado
        if (results.length === 0) {
            console.log("❌ Usuário não encontrado");
            return res.render("pages/adm-login", {
                valores: {
                    emailADM: req.body.emailADM,
                    senhaADM: req.body.senhaADM
                },
                errosLogin: [],
                retorno: "Usuário não encontrado."
            });
        }

        const usuarioEncontrado = results[0];
        console.log("Usuário encontrado:", usuarioEncontrado);

        // 2) Usuário existe, mas não é administrador
        if (usuarioEncontrado.TIPO_USUARIO !== "administrador") {
            console.log("❌ Usuário não autorizado:", usuarioEncontrado.TIPO_USUARIO);
            return res.render("pages/adm-login", {
                valores: {
                    emailADM: req.body.emailADM,
                    senhaADM: req.body.senhaADM
                },
                errosLogin: [],
                retorno: "Usuário não autorizado. Acesso restrito a administradores."
            });
        }

        // 3) Usuário está inativo
        if (usuarioEncontrado.STATUS_USUARIO === "inativo") {
            console.log("❌ Usuário inativo");
            return res.render("pages/adm-login", {
                valores: {
                    emailADM: req.body.emailADM,
                    senhaADM: req.body.senhaADM
                },
                errosLogin: [],
                retorno: "Sua conta está inativa. Por favor, entre em contato com o suporte."
            });
        }

        // 4) Verificar senha
        const senhaCorreta = bcrypt.compareSync(
            dadosForm.senha_usuario,
            usuarioEncontrado.SENHA_USUARIO
        );
        console.log("Senha correta?", senhaCorreta);

        if (!senhaCorreta) {
            console.log("❌ Senha incorreta");
            return res.render("pages/adm-login", {
                valores: {
                    emailADM: req.body.emailADM,
                    senhaADM: req.body.senhaADM
                },
                errosLogin: [],
                retorno: "Senha incorreta."
            });
        }

        // 5) Cria sessão
        req.session.autenticado = {
            nome: usuarioEncontrado.NOME_USUARIO,
            user: usuarioEncontrado.USER_USUARIO,
            id: usuarioEncontrado.ID_USUARIO,
            email: usuarioEncontrado.EMAIL_USUARIO,
            tipo: usuarioEncontrado.TIPO_USUARIO,
            img_perfil_pasta: usuarioEncontrado.FOTO_PERFIL_PASTA_USUARIO,
            img_capa_pasta: usuarioEncontrado.IMG_BANNER_PASTA_USUARIO,
        };
      


        console.log("✅ Login do Administrador realizado com sucesso!", req.session.autenticado);
        next();
    } catch (err) {
        console.error("❌ Erro no login:", err);
        return res.render("pages/adm-login", {
            valores: {
                emailADM: req.body.emailADM,
                senhaADM: req.body.senhaADM
            },
            errosLogin: [],
            retorno: "Ocorreu um erro ao tentar logar. Tente novamente."
        });
    }
};




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
        if (req.session.autenticado && tipoPermitido.includes(req.session.autenticado.tipo)) {
            return next();
        }
        // Não passa o objeto da sessão inteiro!
        return res.render(destinoFalha, { 
            autenticado: req.session.autenticado ? { nome: req.session.autenticado.nome, tipo: req.session.autenticado.tipo } : null,
            erro: "Acesso restrito"
        });
    };
};




module.exports = {
  verificarUsuAutenticado,
  limparSessao,
  gravarUsuAutenticado,
  verificarUsuAutorizado,
};
