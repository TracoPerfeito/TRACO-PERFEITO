const pool = require('../../config/pool_conexoes');

const denunciasModel = {
<<<<<<< HEAD
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
=======
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
>>>>>>> 217bf9e44911458ebfdd85cf2dcd272e6b921950
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

<<<<<<< HEAD
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
=======
  async atualizarStatusDenunciaComentario(idDenuncia, novoStatus) {
    const sql = `
      UPDATE DENUNCIAS_COMENTARIOS
      SET STATUS = ?
      WHERE ID_DENUNCIA = ?
    `;
    await pool.query(sql, [novoStatus, idDenuncia]);
  },

  // -----------------------------
  // Denúncias de publicações
  // -----------------------------
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

  criarDenunciaUsuario: async ({ idUsuarioDenunciante, idUsuarioDenunciado, motivo }) => {
    const [result] = await pool.query(
      `INSERT INTO DENUNCIAS_USUARIOS
       (ID_USUARIO_DENUNCIANTE, ID_USUARIO_DENUNCIADO, MOTIVO, STATUS, DATA_DENUNCIA)
       VALUES (?, ?, ?, 'pendente', NOW())`,
      [idUsuarioDenunciante, idUsuarioDenunciado, motivo]
    );
    return result.insertId;
  },

  listarDenunciasUsuarios: async (status) => {
    let query = 'SELECT * FROM DENUNCIAS_USUARIOS';
    const params = [];
    if (status) {
      query += ' WHERE STATUS = ?';
      params.push(status);
    }
    const [rows] = await pool.query(query, params);
    return rows;
  },

  atualizarStatusDenunciaUsuario: async (idDenuncia, novoStatus) => {
    const [result] = await pool.query(
      'UPDATE DENUNCIAS_USUARIOS SET STATUS = ? WHERE ID_DENUNCIA = ?',
      [novoStatus, idDenuncia]
    );
    return result;
  },

   criarDenunciaProjeto: async ({ idProjeto, idUsuario, motivo }) => {
    const sql = `
      INSERT INTO DENUNCIAS_PROJETOS
      (ID_USUARIO_DENUNCIANTE, ID_PROJETO, MOTIVO, STATUS, DATA_DENUNCIA)
      VALUES (?, ?, ?, 'pendente', NOW())
    `;
    try {
      const [result] = await pool.query(sql, [idUsuario, idProjeto, motivo]);
      return { success: true, id: result.insertId };
    } catch (error) {
      console.error('Erro ao criar denúncia de projeto:', error);
      return { error: 'Erro ao criar denúncia.' };
    }
  },

  listarDenunciasProjetos: async (status = null) => {
   const sql = `
      SELECT 
        d.ID_DENUNCIA,
        d.MOTIVO,
        d.STATUS,
        d.DATA_DENUNCIA,
        u.NOME AS NOME_USUARIO,
        p.TITULO AS PROJETO
      FROM DENUNCIAS_PROJETOS d
      JOIN USUARIOS u ON d.ID_USUARIO_DENUNCIANTE = u.ID_USUARIO
      JOIN PROPOSTA_PROJETO p ON d.ID_PROJETO = p.ID_PROPOSTA
      ORDER BY d.DATA_DENUNCIA DESC
    `;
    try {
      const [rows] = await pool.query(sql);
      return rows;
    } catch (error) {
      console.error('Erro ao listar denúncias de projetos:', error);
      return [];
    }
  },

  atualizarStatusDenunciaProjeto: async (idDenuncia, novoStatus) => {
  try {
    const [result] = await pool.query(
      'UPDATE DENUNCIAS_PROJETOS SET STATUS = ? WHERE ID_DENUNCIA = ?',
      [novoStatus, idDenuncia]
    );
    return result;
  } catch (error) {
    console.error('Erro ao atualizar status da denúncia de projeto:', error);
    return null;
>>>>>>> 217bf9e44911458ebfdd85cf2dcd272e6b921950
  }
},

};


  
module.exports = denunciasModel;