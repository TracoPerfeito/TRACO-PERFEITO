const pool = require("../../config/pool_conexoes");

const publicacoesModel = {
  // 🔍 Buscar publicação por ID
  findIdPublicacao: async (idPublicacao) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM PUBLICACOES_PROFISSIONAL WHERE ID_PUBLICACAO = ?',
        [idPublicacao]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar publicação por ID:', error);
      return null;
    }
  },

  buscarPublicacaoPorId: async (idPublicacao) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM PUBLICACOES_PROFISSIONAL WHERE ID_PUBLICACAO = ?',
        [idPublicacao]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar publicação:', error);
      return null;
    }
  },

  // 📤 Criar publicação
criarPublicacao: async (dados) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO PUBLICACOES_PROFISSIONAL 
       (ID_USUARIO, NOME_PUBLICACAO, DESCRICAO_PUBLICACAO, CATEGORIA, DATA_PUBLICACAO) 
       VALUES (?, ?, ?, ?, NOW())`,
      [dados.ID_USUARIO, dados.NOME_PUBLICACAO, dados.DESCRICAO_PUBLICACAO, dados.CATEGORIA]
    );
    return result.insertId;
  } catch (error) {
    console.error('Erro ao criar publicação:', error);
    return null;
  }
},


  // ✏️ Editar/atualizar publicação
  atualizarPublicacao: async ({ ID_PUBLICACAO, NOME_PUBLICACAO, DESCRICAO_PUBLICACAO, CATEGORIA }) => {
    try {
      await pool.query(
        `UPDATE PUBLICACOES_PROFISSIONAL 
         SET NOME_PUBLICACAO = ?, DESCRICAO_PUBLICACAO = ?, CATEGORIA = ? 
         WHERE ID_PUBLICACAO = ?`,
        [NOME_PUBLICACAO, DESCRICAO_PUBLICACAO, CATEGORIA, ID_PUBLICACAO]
      );
      return true;
    } catch (error) {
      console.error("Erro ao atualizar publicação:", error);
      return false;
    }
  },

  // 🗑️ Excluir publicação (com dados relacionados)
  excluirPublicacao: async (idPublicacao) => {
    try {
      await pool.query('DELETE FROM FAVORITOS WHERE ID_PUBLICACAO = ?', [idPublicacao]);
      await pool.query('DELETE FROM TAGS_PUBLICACOES WHERE ID_PUBLICACAO = ?', [idPublicacao]);
      await pool.query('DELETE FROM CONTEUDOS_PUBLICACAO_PROFISSIONAL WHERE ID_PUBLICACAO = ?', [idPublicacao]);
      await pool.query('DELETE FROM PUBLICACAO_PORTFOLIO WHERE ID_PUBLICACAO = ?', [idPublicacao]);
      await pool.query('DELETE FROM PUBLICACOES_PROFISSIONAL WHERE ID_PUBLICACAO = ?', [idPublicacao]);

      console.log("Publicação e dados relacionados excluídos com sucesso.");
      return true;
    } catch (error) {
      console.error('Erro ao excluir publicação e dados relacionados:', error);
      return false;
    }
  },

  // 🖼️ Conteúdo da publicação
  inserirConteudo: async (idPublicacao, imgBuffer) => {
    try {
      const [result] = await pool.query(
        'INSERT INTO CONTEUDOS_PUBLICACAO_PROFISSIONAL (ID_PUBLICACAO, IMG_PUBLICACAO) VALUES (?, ?)',
        [idPublicacao, imgBuffer]
      );
      return result;
    } catch (error) {
      console.error('Erro ao inserir imagem:', error);
      return null;
    }
  },

  // 🏷️ Tags
  buscarTagPorNome: async (nomeTag) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM TAGS WHERE NOME_TAG = ?',
        [nomeTag]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar tag:', error);
      return null;
    }
  },

  criarTag: async (nomeTag) => {
    try {
      const [result] = await pool.query(
        'INSERT INTO TAGS (NOME_TAG) VALUES (?)',
        [nomeTag]
      );
      return result.insertId;
    } catch (error) {
      console.error('Erro ao criar tag:', error);
      return null;
    }
  },

  associarTagPublicacao: async (idTag, idPublicacao) => {
    try {
      await pool.query(
        'INSERT INTO TAGS_PUBLICACOES (ID_TAG, ID_PUBLICACAO) VALUES (?, ?)',
        [idTag, idPublicacao]
      );
    } catch (error) {
      console.error('Erro ao associar tag com publicação:', error);
    }
  },

  removerTagsDaPublicacao: async (idPublicacao) => {
    try {
      await pool.query('DELETE FROM TAGS_PUBLICACOES WHERE ID_PUBLICACAO = ?', [idPublicacao]);
    } catch (error) {
      console.error('Erro ao remover tags da publicação:', error);
    }
  },

  // 📁 Portfólios
  criarPortfolio: async (dados) => {
    try {
      const [result] = await pool.query(
        'INSERT INTO PORTFOLIOS (ID_USUARIO, NOME_PORTFOLIO, DESCRICAO_PORTFOLIO) VALUES (?, ?, ?)',
        [dados.ID_USUARIO, dados.NOME_PORTFOLIO, dados.DESCRICAO_PORTFOLIO]
      );
      return result.insertId;
    } catch (error) {
      console.error('Erro ao criar portfólio:', error);
      return null;
    }
  },

  editarPortfolio: async (dados) => {
    try {
      const [result] = await pool.query(
        'UPDATE PORTFOLIOS SET NOME_PORTFOLIO = ?, DESCRICAO_PORTFOLIO = ? WHERE ID_PORTFOLIO = ?',
        [dados.NOME_PORTFOLIO, dados.DESCRICAO_PORTFOLIO, dados.ID_PORTFOLIO]
      );
      return result.affectedRows;
    } catch (error) {
      console.error('Erro ao editar portfólio:', error);
      return null;
    }
  },

  inserirPublisPortfolio: async (idPublicacao, idPortfolio) => {
    try {
      await pool.query(
        'INSERT INTO PUBLICACAO_PORTFOLIO (ID_PUBLICACAO, ID_PORTFOLIO) VALUES (?, ?)',
        [idPublicacao, idPortfolio]
      );
      console.log(`Publicação ${idPublicacao} associada ao portfólio ${idPortfolio}`);
    } catch (error) {
      console.error('Erro ao associar publicação com portfólio:', error);
    }
  },

  removerPublisDoPortfolio: async (idPublicacao, idPortfolio) => {
    try {
      await pool.query(
        'DELETE FROM PUBLICACAO_PORTFOLIO WHERE ID_PUBLICACAO = ? AND ID_PORTFOLIO = ?',
        [idPublicacao, idPortfolio]
      );
      return true;
    } catch (error) {
      console.error('Erro ao retirar publicação do portfolio:', error);
      return null;
    }
  },

  verificarPublisNoPortfolio: async (idPublicacao, idPortfolio) => {
    const [rows] = await pool.query(
      'SELECT 1 FROM PUBLICACAO_PORTFOLIO WHERE ID_PUBLICACAO = ? AND ID_PORTFOLIO = ?',
      [idPublicacao, idPortfolio]
    );
    return rows.length > 0;
  },

  associarTagPortfolio: async (idTag, idPortfolio) => {
    try {
      await pool.query(
        'INSERT INTO TAGS_PORTFOLIOS (ID_TAG, ID_PORTFOLIO) VALUES (?, ?)',
        [idTag, idPortfolio]
      );
      return true;
    } catch (error) {
      console.error('Erro ao associar tag com portfólio:', error);
    }
  },

  removerTagsDoPortfolio: async (idPortfolio) => {
    try {
      await pool.query('DELETE FROM TAGS_PORTFOLIOS WHERE ID_PORTFOLIO = ?', [idPortfolio]);
      return true;
    } catch (error) {
      console.error('Erro ao remover tags do portfólio:', error);
      return false;
    }
  },


   excluirPortfolio: async (idPortfolio) => {
    try {
      
      
      await pool.query('DELETE FROM TAGS_PORTFOLIOS WHERE ID_PORTFOLIO = ?', [idPortfolio]);
   
      await pool.query('DELETE FROM PUBLICACAO_PORTFOLIO WHERE ID_PORTFOLIO = ?', [idPortfolio]);
     
      await pool.query('DELETE FROM PORTFOLIOS WHERE ID_PORTFOLIO = ?', [idPortfolio]);

      console.log("Portfólio excluído com sucesso.");
      return true;
    } catch (error) {
      console.error('Erro ao excluir portfólio e dados relacionados:', error);
      return false;
    }
  },


  // 📝 Propostas de projeto
  criarPropostadeProjeto: async (dados) => {
    try {
      const [result] = await pool.query(
        `INSERT INTO PROPOSTA_PROJETO 
        (ID_USUARIO, DATA_PROPOSTA, TITULO_PROPOSTA, DESCRICAO_PROPOSTA, CATEGORIA_PROPOSTA, PREFERENCIA_PROPOSTA, PRAZO_ENTREGA, ORCAMENTO) 
        VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)`,
        [
          dados.ID_USUARIO,
          dados.TITULO_PROPOSTA,
          dados.DESCRICAO_PROPOSTA,
          dados.CATEGORIA_PROPOSTA,
          dados.PREFERENCIA_PROPOSTA,
          dados.PRAZO_ENTREGA,
          dados.ORCAMENTO
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Erro ao criar proposta de projeto:', error);
      return null;
    }
  },









registrarVisualizacao: async (idPublicacao, idUsuario = null, tokenSessao = null) => {
  try {
    // Usuário logado: 1 visualização a cada 30 min
    if (idUsuario) {
      const [rows] = await pool.query(
        `SELECT 1 FROM VISUALIZACOES_PUBLICACAO
         WHERE ID_PUBLICACAO = ? AND ID_USUARIO = ? AND DATA_VISUALIZACAO >= NOW() - INTERVAL 30 MINUTE
         LIMIT 1`,
        [idPublicacao, idUsuario]
      );
      if (rows.length) return { inserted: false, reason: 'recent_user' };
    }

    // Visitante: 1 visualização a cada 30 min pelo token
    if (!idUsuario && tokenSessao) {
      const [rows] = await pool.query(
        `SELECT 1 FROM VISUALIZACOES_PUBLICACAO
         WHERE ID_PUBLICACAO = ? AND TOKEN_SESSAO = ? AND DATA_VISUALIZACAO >= NOW() - INTERVAL 30 MINUTE
         LIMIT 1`,
        [idPublicacao, tokenSessao]
      );
      if (rows.length) return { inserted: false, reason: 'recent_token' };
    }

    // Inserir visualização
    const [result] = await pool.query(
      `INSERT INTO VISUALIZACOES_PUBLICACAO (ID_PUBLICACAO, ID_USUARIO, TOKEN_SESSAO)
       VALUES (?, ?, ?)`,
      [idPublicacao, idUsuario, tokenSessao]
    );

    return { inserted: true, insertId: result.insertId };
  } catch (err) {
    console.error('Erro registrarVisualizacao ->', err);
    return { inserted: false, error: err.message || err };
  }
},


contarNumComentarios: async (idPublicacao) => {
  try {
    const [quantComentarios] = await pool.query(
      `SELECT COUNT(*) as total FROM COMENTARIOS WHERE ID_PUBLICACAO = ?`,
      [idPublicacao]
    );
    return quantComentarios[0].total;
  } catch (error) {
    console.error('Erro ao contar comentários:', error);
    return 0;
  }
},



contarNumVisualizacoes: async (idPublicacao) => {
  try {
    const [quantVisualizacoes] = await pool.query(
      `SELECT COUNT(*) as total FROM VISUALIZACOES_PUBLICACAO WHERE ID_PUBLICACAO = ?`,
      [idPublicacao]
    );
    return quantVisualizacoes[0].total;
  } catch (error) {
    console.error('Erro ao contar visualizações:', error);
    return 0;
  }
},








atualizarPublicacao: async ({ ID_PUBLICACAO, NOME_PUBLICACAO, DESCRICAO_PUBLICACAO, CATEGORIA }) => {
  try {
    await pool.query(
      `UPDATE PUBLICACOES_PROFISSIONAL 
       SET NOME_PUBLICACAO = ?, DESCRICAO_PUBLICACAO = ?, CATEGORIA = ? 
       WHERE ID_PUBLICACAO = ?`,
      [NOME_PUBLICACAO, DESCRICAO_PUBLICACAO, CATEGORIA, ID_PUBLICACAO]
    );
    return true;
  } catch (error) {
    console.error("Erro ao atualizar publicação:", error);
    return false;
  }
},

// 🗑️ Excluir proposta de projeto
excluirProposta: async (idProposta) => {
  try {
    await pool.query('DELETE FROM PROPOSTAS_PROJETO WHERE ID_PROPOSTA = ?', [idProposta]);

    console.log("Proposta de projeto esxcluída com sucesso.");
    return true;
  } catch (error) {
    console.error('Erro ao excluir proposta: ', error);
    return false;
  }
},



};

module.exports = publicacoesModel;
