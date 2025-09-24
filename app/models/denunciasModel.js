const pool = require('../../config/pool_conexoes');

const denunciasModel = {
  // Denunciar comentário
  async criarDenunciaComentario({ idComentario, idUsuario, motivo }) {
    try {
      const sql = `
        INSERT INTO DENUNCIAS_COMENTARIOS 
        (ID_USUARIO_DENUNCIANTE, ID_COMENTARIO, MOTIVO, STATUS, DATA_DENUNCIA)
        VALUES (?, ?, ?, 'pendente', NOW())
      `;
      await pool.query(sql, [idUsuario, idComentario, motivo]);
      return true;
    } catch (error) {
      console.error('Erro no criarDenunciaComentario:', error);
      throw error;
    }
  },

  // Denunciar publicação
  async criarDenunciaPublicacao({ idPublicacao, idUsuario, motivo }) {
    try {
      const sql = `
        INSERT INTO DENUNCIAS_PUBLICACOES 
        (ID_USUARIO_DENUNCIANTE, ID_PUBLICACAO, MOTIVO, STATUS, DATA_DENUNCIA)
        VALUES (?, ?, ?, 'pendente', NOW())
      `;
      await pool.query(sql, [idUsuario, idPublicacao, motivo]);
      return true;
    } catch (error) {
      console.error('Erro no criarDenunciaPublicacao:', error);
      throw error;
    }
  },

  // Listar denúncias de comentários
  async listarDenunciasComentarios() {
    const [rows] = await pool.query(`
      SELECT D.*, U.NOME_USUARIO, C.CONTEUDO_COMENTARIO
      FROM DENUNCIAS_COMENTARIOS D
      JOIN USUARIOS U ON D.ID_USUARIO_DENUNCIANTE = U.ID_USUARIO
      JOIN COMENTARIOS C ON D.ID_COMENTARIO = C.ID_COMENTARIO
      ORDER BY D.DATA_DENUNCIA DESC
    `);
    return rows;
  },

  // Listar denúncias de publicações
  async listarDenunciasPublicacoes() {
    const [rows] = await pool.query(`
      SELECT D.*, U.NOME_USUARIO, P.CONTEUDO_PUBLICACAO
      FROM DENUNCIAS_PUBLICACOES D
      JOIN USUARIOS U ON D.ID_USUARIO_DENUNCIANTE = U.ID_USUARIO
      JOIN PUBLICACOES P ON D.ID_PUBLICACAO = P.ID_PUBLICACAO
      ORDER BY D.DATA_DENUNCIA DESC
    `);
    return rows;
  }
};

module.exports = denunciasModel;
