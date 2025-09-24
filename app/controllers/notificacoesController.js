
const notificacoesModel = require("../models/notificacoesModel");

const listagensModel = require("../models/listagensModel");

const notificacoesController = {

 
  criar: async ({ idUsuario, titulo, conteudo, categoria }) => {
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


  listar: async (req, res) => {
    try {
        idUsuario = req.session.autenticado.id
      const notificacoes = await notificacoesModel.listarNotificacoesUserLogado(idUsuario);
      const total = notificacoes.length;

      return { notificacoes, total };
    } catch (erro) {
      console.error("Erro ao listar notificações:", erro);
      throw erro;
    }
  },

  // Exibir detalhes de uma notificação específica
  exibir: async (idNotificacao) => {
    try {
      const notificacao = await notificacoesModel.exibirNotificacao(idNotificacao);
     const notificacoes = await notificacoesModel.listarNotificacoesUserLogado(notificacao.ID_USUARIO);
      return { notificacao, notificacoes };
    } catch (erro) {
      console.error("Erro ao exibir notificação:", erro);
      throw erro;
    }
  },

  // Excluir notificação
  excluir: async (idNotificacao) => {
    try {
      const resultado = await notificacoesModel.excluirNotificacao(idNotificacao);
      return resultado;
    } catch (erro) {
      console.error("Erro ao excluir notificação:", erro);
      throw erro;
    }
  }



};

module.exports = notificacoesController;
