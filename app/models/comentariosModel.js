const pool = require('../../config/pool_conexoes');

const comentariosModel = {

  criarComentario: async (dadosForm) => {
    try {
      const [result] = await pool.query('INSERT INTO COMENTARIOS SET ?', [dadosForm]);
      return result.insertId;
    } catch (error) {
      console.log('Erro ao salvar comentário:', error);
      return null;
    }
  },

  excluirComentario: async (idComentario) => {
    try {
<<<<<<< HEAD
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
  
=======
      const [result] = await pool.query('DELETE FROM COMENTARIOS WHERE ID_COMENTARIO = ?', [idComentario]);

      if (result.affectedRows === 0) {
        return { error: 'Comentário não encontrado ou já excluído.' };
      }

      return { success: true };
    } catch (error) {
      console.log('Erro ao excluir comentário:', error);
      return { error: 'Erro ao excluir comentário.' };
    }
  },

  // listarComentarios: async (idPublicacao) => {
  //   try {
  //     const [resultado] = await pool.query(`
  //       SELECT
  //         c.ID_COMENTARIO,
  //         c.ID_USUARIO,
  //         c.ID_PUBLICACAO,
  //         c.CONTEUDO_COMENTARIO,
  //         c.DATA_COMENTARIO,
  //         u.NOME_USUARIO,
  //         u.FOTO_PERFIL_BANCO_USUARIO
  //       FROM COMENTARIOS c
  //       LEFT JOIN USUARIOS u ON c.ID_USUARIO = u.ID_USUARIO
  //       WHERE u.STATUS_USUARIO = 'ativo'
  //         AND c.ID_PUBLICACAO = ?
  //       ORDER BY c.DATA_COMENTARIO DESC
  //     `, [idPublicacao]);

  //     console.log('Comentários listados:', resultado);
  //     return resultado;

  //   } catch (error) {
  //     console.error('Erro ao listar comentários:', error);
  //     return null;
  //   }
  // },

>>>>>>> 217bf9e44911458ebfdd85cf2dcd272e6b921950
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
        u.FOTO_PERFIL_BANCO_USUARIO
      FROM COMENTARIOS c
      LEFT JOIN USUARIOS u ON c.ID_USUARIO = u.ID_USUARIO
      WHERE u.STATUS_USUARIO = 'ativo'
        AND c.ID_PUBLICACAO = ?
      ORDER BY c.DATA_COMENTARIO DESC
    `, [idPublicacao]);

    // Converter imagens de perfil
    resultado.forEach(comentario => {
      if (comentario.FOTO_PERFIL_BANCO_USUARIO) {
        const buffer = Buffer.isBuffer(comentario.FOTO_PERFIL_BANCO_USUARIO)
          ? comentario.FOTO_PERFIL_BANCO_USUARIO
          : Buffer.from(comentario.FOTO_PERFIL_BANCO_USUARIO);
        comentario.FOTO_PERFIL_BANCO_USUARIO = "data:image/png;base64," + buffer.toString('base64');
      } else {
        comentario.FOTO_PERFIL_BANCO_USUARIO = null; // ou usar imagem padrão
      }
    });

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
