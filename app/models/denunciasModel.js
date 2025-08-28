const pool = require('../../config/pool_conexoes');

const denunciasModel = {
  async criarDenuncia({ idComentario, idUsuario, motivo }) {
    const sql = `INSERT INTO DENUNCIAS (ID_COMENTARIO, ID_USUARIO, STATUS, DATA_DENUNCIA) VALUES (?, ?, 'pendente', NOW())`;
    await pool.query(sql, [idComentario, idUsuario]);
    // Se quiser salvar o motivo, adicione uma coluna na tabela e inclua aqui
    return true;
  },
  async listarDenuncias() {
    const [rows] = await pool.query(`
      SELECT D.*, U.NOME_USUARIO, C.CONTEUDO_COMENTARIO
      FROM DENUNCIAS D
      JOIN USUARIOS U ON D.ID_USUARIO = U.ID_USUARIO
      JOIN COMENTARIOS C ON D.ID_COMENTARIO = C.ID_COMENTARIO
      ORDER BY D.DATA_DENUNCIA DESC
    `);
    return rows;
  }
};

module.exports = denunciasModel;
