const pool = require('../../config/pool_conexoes');

const denunciasModel = {
  async criarDenuncia({ idComentario, idUsuario, motivo }) {
    const sql = `
      INSERT INTO DENUNCIAS_COMENTARIOS 
      (ID_USUARIO_DENUNCIANTE, ID_COMENTARIO, MOTIVO, STATUS, DATA_DENUNCIA)
      VALUES (?, ?, ?, 'pendente', NOW())
    `;
    await pool.query(sql, [idUsuario, idComentario, motivo]);
    return true;
  },

  async listarDenuncias() {
    const [rows] = await pool.query(`
      SELECT D.*, U.NOME_USUARIO, C.CONTEUDO_COMENTARIO
      FROM DENUNCIAS_COMENTARIOS D
      JOIN USUARIOS U ON D.ID_USUARIO_DENUNCIANTE = U.ID_USUARIO
      JOIN COMENTARIOS C ON D.ID_COMENTARIO = C.ID_COMENTARIO
      ORDER BY D.DATA_DENUNCIA DESC
    `);
    return rows;
  }
};

module.exports = denunciasModel;
