const pool = require('../../config/pool_conexoes');

const denunciasModel = {
  async criarDenunciaComentario({ idComentario, idUsuario, motivo }) {
    const sql = `
      INSERT INTO DENUNCIAS_COMENTARIOS 
      (ID_USUARIO_DENUNCIANTE, ID_COMENTARIO, MOTIVO, STATUS, DATA_DENUNCIA)
      VALUES (?, ?, ?, 'pendente', NOW())
    `;
    const [resultado] = await pool.query(sql, [idUsuario, idComentario, motivo]);
    return resultado.insertId;
  },

  async listarDenunciasComentarios(status) {
    const [rows] = await pool.query(`
      SELECT D.*, U.NOME_USUARIO, C.CONTEUDO_COMENTARIO
      FROM DENUNCIAS_COMENTARIOS D
      JOIN USUARIOS U ON D.ID_USUARIO_DENUNCIANTE = U.ID_USUARIO
      JOIN COMENTARIOS C ON D.ID_COMENTARIO = C.ID_COMENTARIO
      ${status ? 'WHERE D.STATUS = ?' : ''}
      ORDER BY D.DATA_DENUNCIA DESC
    `, status ? [status] : []);
    return rows;
  },

  async atualizarStatusDenunciaComentario(idDenuncia, novoStatus) {
    const sql = `
      UPDATE DENUNCIAS_COMENTARIOS
      SET STATUS = ?
      WHERE ID_DENUNCIA_COMENTARIO = ?
    `;
    await pool.query(sql, [novoStatus, idDenuncia]);
  },

  // Denúncias de publicações
  async criarDenunciaPublicacao({ idUsuario, idPublicacao, motivo }) {
    try {
      const sql = `
        INSERT INTO DENUNCIAS_PUBLICACOES
          (ID_USUARIO_DENUNCIANTE, ID_PUBLICACAO, MOTIVO, STATUS, DATA_DENUNCIA)
        VALUES (?, ?, ?, 'pendente', NOW())
      `;
      const [result] = await pool.query(sql, [idUsuario, idPublicacao, motivo]);
      return result.insertId;
    } catch (error) {
      console.error('Erro no criarDenunciaPublicacao:', error);
      throw error;
    }
  },

  // Listar denúncias de publicações
  async listarDenunciasPublicacoes(status = null) {
    try {
      let sql = `
        SELECT D.*, U.NOME_USUARIO, P.TITULO_PUBLICACAO
        FROM DENUNCIAS_PUBLICACOES D
        JOIN USUARIOS U ON D.ID_USUARIO_DENUNCIANTE = U.ID_USUARIO
        JOIN PUBLICACOES P ON D.ID_PUBLICACAO = P.ID_PUBLICACAO
      `;
      const params = [];

      if (status) {
        sql += " WHERE D.STATUS = ?";
        params.push(status);
      }

      sql += " ORDER BY D.DATA_DENUNCIA DESC";

      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (error) {
      console.error('Erro no listarDenunciasPublicacoes:', error);
      throw error;
    }
  },

  // Atualizar status de denúncia de publicação
  async atualizarStatusDenunciaPublicacao(idDenuncia, novoStatus) {
    try {
      const sql = `
        UPDATE DENUNCIAS_PUBLICACOES
        SET STATUS = ?
        WHERE ID_DENUNCIA = ?
      `;
      await pool.query(sql, [novoStatus, idDenuncia]);
    } catch (error) {
      console.error('Erro no atualizarStatusDenunciaPublicacao:', error);
      throw error;
    }
  },
};
  
module.exports = denunciasModel;