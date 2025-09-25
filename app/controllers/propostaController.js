const pool = require('../../config/pool_conexoes');
const denunciasModel = require('../models/denunciasModel');

const propostaController = {
  // Editar proposta de projeto
  editarProposta: async (req, res) => {
    try {
      const { idProposta } = req.params;
      const { titulo, descricao, categoria, preferencia, prazoEntrega, orcamento, status } = req.body;
      const idUsuarioLogado = req.session.autenticado.id;

      // Verificar se o usuário é dono da proposta
      const [proposta] = await pool.query('SELECT ID_USUARIO FROM PROPOSTA_PROJETO WHERE ID_PROPOSTA = ?', [idProposta]);
      if (!proposta[0]) {
        req.session.dadosNotificacao = { titulo: 'Erro', mensagem: 'Proposta não encontrada', tipo: 'erro' };
        return res.redirect('/projetos');
      }
      if (proposta[0].ID_USUARIO !== idUsuarioLogado) {
        req.session.dadosNotificacao = { titulo: 'Erro', mensagem: 'Você não pode editar esta proposta', tipo: 'erro' };
        return res.redirect('/projetos');
      }

      // Atualizar proposta
      await pool.query(
        `UPDATE PROPOSTA_PROJETO 
         SET TITULO_PROPOSTA=?, DESCRICAO_PROPOSTA=?, CATEGORIA_PROPOSTA=?, PREFERENCIA_PROPOSTA=?, PRAZO_ENTREGA=?, ORCAMENTO=?, STATUS_PROPOSTA=? 
         WHERE ID_PROPOSTA=?`,
        [titulo, descricao, categoria, preferencia, prazoEntrega || null, orcamento || null, status, idProposta]
      );

      req.session.dadosNotificacao = { titulo: 'Sucesso', mensagem: 'Proposta atualizada!', tipo: 'sucesso' };
      res.redirect(`/projetos/${idProposta}`);
    } catch (error) {
      console.error('Erro ao editar proposta:', error);
      res.status(500).render('pages/erro-conexao', { mensagem: 'Não foi possível atualizar a proposta.' });
    }
  },

  // Excluir proposta de projeto
  excluirProposta: async (req, res) => {
    try {
      const { idProposta } = req.params;
      const idUsuarioLogado = req.session.autenticado.id;

      // Verificar se o usuário é dono da proposta
      const [proposta] = await pool.query('SELECT ID_USUARIO FROM PROPOSTA_PROJETO WHERE ID_PROPOSTA = ?', [idProposta]);
      if (!proposta[0]) {
        req.session.dadosNotificacao = { titulo: 'Erro', mensagem: 'Proposta não encontrada', tipo: 'erro' };
        return res.redirect('/projetos');
      }
      if (proposta[0].ID_USUARIO !== idUsuarioLogado) {
        req.session.dadosNotificacao = { titulo: 'Erro', mensagem: 'Você não pode excluir esta proposta', tipo: 'erro' };
        return res.redirect('/projetos');
      }

      await pool.query('DELETE FROM PROPOSTA_PROJETO WHERE ID_PROPOSTA = ?', [idProposta]);

      req.session.dadosNotificacao = { titulo: 'Sucesso', mensagem: 'Proposta excluída!', tipo: 'sucesso' };
      res.redirect('/projetos');
    } catch (error) {
      console.error('Erro ao excluir proposta:', error);
      res.status(500).render('pages/erro-conexao', { mensagem: 'Não foi possível excluir a proposta.' });
    }
  },

  // Denunciar proposta de projeto
  denunciarProposta: async (req, res) => {
    try {
      const { idProposta, motivo } = req.body;
      const idUsuario = req.session.autenticado.id;

      if (!idProposta || !motivo) {
        req.session.dadosNotificacao = { titulo: 'Erro', mensagem: 'Parâmetros inválidos', tipo: 'erro' };
        return res.redirect('/projetos');
      }

      await denunciasModel.criarDenunciaProjeto({ idProjeto: idProposta, idUsuario, motivo });

      req.session.dadosNotificacao = { titulo: 'Sucesso', mensagem: 'Denúncia enviada com sucesso!', tipo: 'sucesso' };
      res.redirect('/projetos');
    } catch (error) {
      console.error('Erro ao denunciar proposta:', error);
      res.status(500).render('pages/erro-conexao', { mensagem: 'Não foi possível denunciar a proposta.' });
    }
  },

  // Buscar proposta pelo ID (para exibir detalhes ou formulário de edição)
  buscarPropostaPorId: async (req, res) => {
    try {
      const { idProposta } = req.params;
      const [proposta] = await pool.query('SELECT * FROM PROPOSTA_PROJETO WHERE ID_PROPOSTA = ?', [idProposta]);

      if (!proposta[0]) {
        req.session.dadosNotificacao = { titulo: 'Erro', mensagem: 'Proposta não encontrada', tipo: 'erro' };
        return res.redirect('/projetos');
      }

      res.render('pages/editar-proposta', { proposta: proposta[0] });
    } catch (error) {
      console.error('Erro ao buscar proposta:', error);
      res.status(500).render('pages/erro-conexao', { mensagem: 'Não foi possível acessar a proposta.' });
    }
  }
};

module.exports = propostaController;
