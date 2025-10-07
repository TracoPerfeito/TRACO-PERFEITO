const pool = require('../../config/pool_conexoes');


const notificacoesModel = {

  // Cria notificação e dispara via socket
  criarNotificacao: async ({ idUsuario, titulo, conteudo, categoria, preview}) => {
  console.log({titulo, conteudo, idUsuario, categoria, preview});

  try {
    const [result] = await pool.query(
      'INSERT INTO NOTIFICACOES (TITULO_NOTIFICACAO, CONTEUDO_NOTIFICACAO, ID_USUARIO, CATEGORIA_NOTIFICACAO, STATUS, PREVIEW_NOTIFICACAO) VALUES (?, ?, ?, ?, ?, ?)',
      [
        String(titulo),
        String(conteudo),
        Number(idUsuario),
        String(categoria),
        'NAO_LIDA',      // STATUS
        String(preview)  // PREVIEW
      ]
    );

    const idNotificacao = result.insertId;

 

    return idNotificacao;

  } catch (err) {
    console.error('Erro ao criar notificação:', err);
    throw err;
  }
},


  // Lista todas notificações de um usuário
  listarNotificacoesUserLogado: async (idUsuario) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM NOTIFICACOES WHERE ID_USUARIO = ? ORDER BY DATA_CRIACAO_NOTIFICACAO DESC',
        [idUsuario]
      );
      return rows;
    } catch (err) {
      console.error('Erro ao listar notificações:', err);
      throw err;
    }
  },

  // Exibe detalhes de uma notificação específica
  exibirNotificacao: async (idNotificacao) => {
    console.log("Exibindo notificação:", idNotificacao);
    try {
      const [rows] = await pool.query(
        'SELECT * FROM NOTIFICACOES WHERE ID_NOTIFICACAO = ?',
        [idNotificacao]
      );
      if (rows.length === 0) return null;

      // Marcar como lida
      await pool.query(
        'UPDATE NOTIFICACOES SET STATUS = ? WHERE ID_NOTIFICACAO = ?',
        ['LIDA', idNotificacao]
      );

      return rows[0];
    } catch (err) {
      console.error('Erro ao exibir notificação:', err);
      throw err;
    }
  },


    excluirNotificacao: async (idNotificacao) => {
    try {
      const [result] = await pool.query(
        'DELETE FROM NOTIFICACOES WHERE ID_NOTIFICACAO = ?',
        [idNotificacao]
      );
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Erro ao excluir notificação:', err);
      throw err;
    }
  },


  countNaoLidas: async (idUsuario) => {
    try {
     const [rows] = await pool.query(
  `SELECT COUNT(*) AS total 
   FROM NOTIFICACOES 
   WHERE ID_USUARIO = ? AND STATUS = 'NAO_LIDA'`,
  [idUsuario]
);

      return rows[0].total;
    } catch (err) {
      console.error("Erro ao contar notificações:", err);
      return 0;
    }
  },







};

module.exports = notificacoesModel;