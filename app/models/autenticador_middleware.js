const { validationResult } = require("express-validator");
const usuario = require("./usuariosModel");
const bcrypt = require("bcryptjs");

verificarUsuAutenticado = (req, res, next) => {
    if (req.session.autenticado) {
        var autenticado = req.session.autenticado;
        req.session.logado = req.session.logado + 1;
    } else {
        var autenticado = { autenticado: null, id: null, tipo: null };
        req.session.logado = 0;
    }
    req.session.autenticado = autenticado;
    next();
};

limparSessao = (req, res, next) => {
  req.session.destroy();
  next();
};

gravarUsuAutenticado = async (req, res, next) => {
    const erros = validationResult(req);
     console.log("req.body:", req.body);

    if (!erros.isEmpty()) {
        console.log("⚠️ Erros de validação:", erros.array());
        return res.render("pages/login", {
            valores: req.body,
            errosLogin: erros.array(),
            retorno: "Erro de validação nos dados informados.",
             dadosNotificacao: null
        });
    }

    const dadosForm = {
        email: req.body.email,
        senha_usuario: req.body.password,
    };

    const results = await usuario.findUserEmail(dadosForm);

    if (results.length === 0) {
        console.log("❌ Email não encontrado:", dadosForm.email);
        return res.render("pages/login", {
            valores: req.body,
            errosLogin: [],
            retorno: "Email não encontrado.",
            dadosNotificacao: null
        });
    }

    const usuarioEncontrado = results[0];
    console.log("🧾 usuarioEncontrado:", usuarioEncontrado);

    if(!usuarioEncontrado){
        console.error('Erro no banco de dadios. Conexão interrompida:', error);
        res.status(500).render('pages/erro-conexao', {
       mensagem: "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
     });
    }

    if (usuarioEncontrado.STATUS_USUARIO === 'inativo') {
    console.log("🚫 Usuário inativo tentou fazer login:", usuarioEncontrado.EMAIL_USUARIO);
    return res.render("pages/login", {
        valores: req.body,
        errosLogin: [],
        retorno: "Sua conta está inativa. Entre em contato com o suporte.",
        dadosNotificacao: null
    });
}

    console.log("🔐 senha digitada:", req.body.password);
    console.log("🔐 senha do banco:", usuarioEncontrado.SENHA_USUARIO);

    const senhaCorreta = bcrypt.compareSync(req.body.password, usuarioEncontrado.SENHA_USUARIO);

    if (!senhaCorreta) {
        console.log("❌ Senha incorreta para o email:", dadosForm.email);
        return res.render("pages/login", {
            valores: req.body,
            errosLogin: [],
            retorno: "Senha incorreta.",
            dadosNotificacao: null
        });
    }


   // Se chegou aqui, está tudo certo
    req.session.autenticado = {
        autenticado: usuarioEncontrado.NOME_USUARIO,
        nome: usuarioEncontrado.NOME_USUARIO,
        user: usuarioEncontrado.USER_USUARIO,
        id: usuarioEncontrado.ID_USUARIO,
        tipo: usuarioEncontrado.TIPO_USUARIO,
        status: usuarioEncontrado.STATUS_USUARIO,
       img_perfil_banco: usuarioEncontrado.FOTO_PERFIL_BANCO_USUARIO
        ? `data:image/png;base64,${usuarioEncontrado.FOTO_PERFIL_BANCO_USUARIO.toString('base64')}`
        : null,
    img_capa_banco: usuarioEncontrado.IMG_BANNER_BANCO_USUARIO
        ? `data:image/png;base64,${usuarioEncontrado.IMG_BANNER_BANCO_USUARIO.toString('base64')}`
        : null,
        descricao_perfil: usuarioEncontrado.DESCRICAO_PERFIL_USUARIO
    };
    console.log("✅ Login realizado com sucesso:", req.session.autenticado);
   

    req.session.logado = 0;
    next();
};


verificarUsuAutorizado = (tipoPermitido, destinoFalha) => {
    return (req, res, next) => {
        if (req.session.autenticado.autenticado != null &&
            tipoPermitido.find(function (element) { return element == req.session.autenticado.tipo }) != undefined) {
            next();
        } else {
            res.render(destinoFalha, req.session.autenticado);
        }
    };
};

verificarDonoPortfolio = (db, destinoFalha) => {
    return async (req, res, next) => {
        try {
            // se não tiver sessão -> manda pro destinoFalha
            if (!req.session.autenticado || !req.session.autenticado.id) {
                return res.render(destinoFalha, { msg: "Você precisa estar logado." });
            }

            const portfolioId = req.params.id; 
            const usuarioId = req.session.autenticado.id; 

            const [rows] = await db.query("SELECT ID_USUARIO FROM PORTFOLIOS WHERE ID_PORTFOLIO = ?", [portfolioId]);

            if (rows.length === 0) {
                return res.render(destinoFalha, { msg: "Portfólio não encontrado." });
            }

            const donoId = rows[0].id_usuario;

            if (donoId !== usuarioId) {
                return res.render(destinoFalha, { msg: "Você não tem permissão para editar este portfólio." });
            }

            // se passar em tudo -> segue
            next();
        } catch (err) {
            console.error(err);
            res.render(destinoFalha, { msg: "Erro no servidor." });
        }
    };
};


module.exports = {
  verificarUsuAutenticado,
  limparSessao,
  gravarUsuAutenticado,
  verificarUsuAutorizado,
  verificarDonoPortfolio
};
