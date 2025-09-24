const pool = require('../../config/pool_conexoes');

const denunciasModel = {
  // Denunciar comentário
  async criarDenunciaComentario({ idComentario, idUsuario, motivo }) {
    const sql = `
      INSERT INTO DENUNCIAS_COMENTARIOS 
      (ID_USUARIO_DENUNCIANTE, ID_COMENTARIO, MOTIVO, STATUS, DATA_DENUNCIA)
      VALUES (?, ?, ?, 'pendente', NOW())
    `;
    const [result] = await pool.query(sql, [idUsuario, idComentario, motivo]);
    return result.insertId;
  },

  // Denunciar publicação
  async criarDenunciaPublicacao({ idPublicacao, idUsuario, motivo }) {
    const sql = `
      INSERT INTO DENUNCIAS_PUBLICACOES 
      (ID_USUARIO_DENUNCIANTE, ID_PUBLICACAO, MOTIVO, STATUS, DATA_DENUNCIA)
      VALUES (?, ?, ?, 'pendente', NOW())
    `;
    const [result] = await pool.query(sql, [idUsuario, idPublicacao, motivo]);
    return result.insertId;
  },

  // Denunciar usuário
  async criarDenunciaUsuario({ idUsuarioDenunciante, idUsuarioDenunciado, motivo }) {
    const sql = `
      INSERT INTO DENUNCIAS_USUARIOS
      (ID_USUARIO_DENUNCIANTE, ID_USUARIO_DENUNCIADO, MOTIVO, STATUS, DATA_DENUNCIA)
      VALUES (?, ?, ?, 'pendente', NOW())
    `;
    const [result] = await pool.query(sql, [idUsuarioDenunciante, idUsuarioDenunciado, motivo]);
    return result.insertId;
  },

  // Listar denúncias de comentários
  async listarDenunciasComentarios(status = null) {
    let sql = `
      SELECT D.*, U.NOME_USUARIO, C.CONTEUDO_COMENTARIO
      FROM DENUNCIAS_COMENTARIOS D
      JOIN USUARIOS U ON D.ID_USUARIO_DENUNCIANTE = U.ID_USUARIO
      JOIN COMENTARIOS C ON D.ID_COMENTARIO = C.ID_COMENTARIO
    `;
    if (status) sql += ` WHERE D.STATUS = ?`;
    sql += ` ORDER BY D.DATA_DENUNCIA DESC`;
    const [rows] = status ? await pool.query(sql, [status]) : await pool.query(sql);
    return rows;
  },

  // Listar denúncias de publicações
  async listarDenunciasPublicacoes(status = null) {
    let sql = `
      SELECT D.*, U.NOME_USUARIO, P.CONTEUDO_PUBLICACAO
      FROM DENUNCIAS_PUBLICACOES D
      JOIN USUARIOS U ON D.ID_USUARIO_DENUNCIANTE = U.ID_USUARIO
      JOIN PUBLICACOES P ON D.ID_PUBLICACAO = P.ID_PUBLICACAO
    `;
    if (status) sql += ` WHERE D.STATUS = ?`;
    sql += ` ORDER BY D.DATA_DENUNCIA DESC`;
    const [rows] = status ? await pool.query(sql, [status]) : await pool.query(sql);
    return rows;
  },

  // Listar denúncias de usuários
  async listarDenunciasUsuarios(status = null) {
    let sql = `
      SELECT D.*, U1.NOME_USUARIO AS denunciante, U2.NOME_USUARIO AS denunciado
      FROM DENUNCIAS_USUARIOS D
      JOIN USUARIOS U1 ON D.ID_USUARIO_DENUNCIANTE = U1.ID_USUARIO
      JOIN USUARIOS U2 ON D.ID_USUARIO_DENUNCIADO = U2.ID_USUARIO
    `;
    if (status) sql += ` WHERE D.STATUS = ?`;
    sql += ` ORDER BY D.DATA_DENUNCIA DESC`;
    const [rows] = status ? await pool.query(sql, [status]) : await pool.query(sql);
    return rows;
  }
};

module.exports = denunciasModel;
