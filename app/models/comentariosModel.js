

const pool = require('../../config/pool_conexoes'); // já deve exportar pool.promise()

const comentariosModel = {

  criarComentario: async (dadosForm) => {
    try {
      const [result] = await pool.query('INSERT INTO COMENTARIOS SET ?', [dadosForm]);
      console.log('Comentário criado:', result);
      return result.insertId;
    } catch (error) {
      console.log('Erro ao salvar comentário:', error);
      return null;
    }
  },

  excluirComentario: async (idComentario) => {
    try {
      const [result] = await pool.query(
        'DELETE FROM COMENTARIOS WHERE ID_COMENTARIO = ?', 
        [idComentario]
      );
      console.log('Comentário excluído:', result);
  
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      console.log('Erro ao excluir comentário:', error);
  
      return { success: false, error: error.sqlMessage || 'Erro ao excluir comentário' };
    }
  },
  
  listarComentarios: async (idPublicacao) => {
    try {
      const [resultado] = await pool.query(`
        SELECT
          c.ID_COMENTARIO,
          c.ID_USUARIO,
          c.ID_PUBLICACAO,
          c.CONTEUDO_COMENTARIO,
          c.DATA_COMENTARIO,
          u.NOME_USUARIO,
          u.FOTO_PERFIL_PASTA_USUARIO
        FROM COMENTARIOS c
        LEFT JOIN USUARIOS u ON c.ID_USUARIO = u.ID_USUARIO
        WHERE u.STATUS_USUARIO = 'ativo'
          AND c.ID_PUBLICACAO = ?
        ORDER BY c.DATA_COMENTARIO DESC
      `, [idPublicacao]);

      console.log('Comentários listados:', resultado);
      return resultado;

    } catch (error) {
      console.error('Erro ao listar comentários:', error);
      return null;
    }
  },

  pegarComentarioPorId: async (idComentario) => {
    try {
      const [resultado] = await pool.query('SELECT * FROM COMENTARIOS WHERE ID_COMENTARIO = ?', [idComentario]);
      return resultado[0] || null;
    } catch (error) {
      console.error('Erro ao buscar comentário:', error);
      return null;
    }
  }

};

module.exports = comentariosModel;
