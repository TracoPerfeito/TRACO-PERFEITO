
const notificacoesModel = require("../models/notificacoesModel");

const listagensModel = require("../models/listagensModel");

const notificacoesController = {

 
  criarNotificacao: async ({ idUsuario, titulo, conteudo, categoria }) => {
    try {
      if (!idUsuario || !titulo || !conteudo || !categoria) {
        throw new Error("Parâmetros insuficientes");
      }

      const idNotificacao = await criarNotificacao({ idUsuario, titulo, conteudo, categoria });
      console.log("Notificação criada com ID:", idNotificacao);

      return idNotificacao;
    } catch (erro) {
      console.error("Erro ao criar notificação:", erro);
      throw erro;
    }
  },


listar: async (req, res, dadosNotificacao) => {
  try {
    console.log("Listando notificações para usuário:");
    const idUsuario = req.session.autenticado.id;
    const notificacoes = await notificacoesModel.listarNotificacoesUserLogado(idUsuario);


    const total = notificacoes.filter(n => n.STATUS === "NAO_LIDA").length;

    res.render("pages/notificacoes", { notificacoes, total, dadosNotificacao }); 
  } catch (erro) {
    console.error("Erro ao listar notificações:", erro);
    throw erro;
  }
},


  // Exibir detalhes de uma notificação específica
  exibir: async (req, res) => {
    try {

        const idNotificacao = req.params.id;  
    console.log("Abrindo notificação:", idNotificacao);
      const notificacao = await notificacoesModel.exibirNotificacao(idNotificacao);
     const notificacoes = await notificacoesModel.listarNotificacoesUserLogado(notificacao.ID_USUARIO);
      return res.render("pages/notificacao", { idNotificacao, notificacoes });
    } catch (erro) {
      console.error("Erro ao exibir notificação:", erro);
      throw erro;
    }
  },

 excluirNotificacoes: async (req, res) => {
  console.log("Chegou no Excluir notificações.");
  const { ids } = req.body;
  console.log(req.body);

  try {
    if (!ids) {
      req.session.dadosNotificacao = {
        titulo: "Ocorreu um erro.",
        mensagem: "Não foi possível apagar as notificações.",
        tipo: "error"
      };
      return await notificacoesController.listar(req, res);
    }

    if (ids.length === 0) {
      req.session.dadosNotificacao = {
        titulo: "Nenhuma notificação selecionada.",
        mensagem: "",
        tipo: "info"
      };
      return await notificacoesController.listar(req, res);
    }

    // Transformar em array se necessário
    let idsArray = typeof ids === "string"
      ? ids.split(",").map(id => parseInt(id))
      : ids;

    // Excluir no banco
    for (const id of idsArray) {
      await notificacoesModel.excluirNotificacao(id);
    }

    console.log("Deu tudo certo. Notificações excluídas");

    req.session.dadosNotificacao = {
      titulo: "Notificações apagadas com sucesso!",
      mensagem: "",
      tipo: "success"
    };

    return res.redirect("/notificacoes");

  } catch (erro) {
    console.error("Erro ao excluir notificação:", erro);

    req.session.dadosNotificacao = {
      titulo: 'Ocorreu um erro.',
      mensagem: "Não foi possível apagar as notificações",
      tipo: "error"
    };
    return res.redirect("/notificacoes");
  }
},








countNaoLidas: async (req, res) => {
    if (!req.session.autenticado?.autenticado) {
      return res.json({ naoLidas: 0 });
    }

    try {
      const total = await notificacoesModel.countNaoLidas(req.session.autenticado.id);
      res.json({ naoLidas: total });
    } catch (err) {
      console.error("Erro ao buscar notificações não lidas:", err);
      res.status(500).json({ naoLidas: 0 });
    }
  },

  
};







module.exports = notificacoesController;
