var pool = require("../../config/pool_conexoes");

const listagensModel = {

  buscarProfissionaisComEspecializacao: async () => {
    try {
      const [linhas] = await pool.query(`
        SELECT 
          u.ID_USUARIO, 
          u.NOME_USUARIO, 
          u.FOTO_PERFIL_PASTA_USUARIO,
          u.IMG_BANNER_PASTA_USUARIO,
          u.DESCRICAO_PERFIL_USUARIO,
          up.ESPECIALIZACAO_DESIGNER
        FROM USUARIOS u
        LEFT JOIN USUARIO_PROFISSIONAL up ON u.ID_USUARIO = up.ID_USUARIO
        WHERE u.TIPO_USUARIO = 'profissional' 
          AND u.STATUS_USUARIO = 'ativo'
      `);
      return linhas;
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
      return [];
    }
  },

  findIdusuario: async (id) => {
    try {
      const [rows] = await pool.query('SELECT * FROM USUARIOS WHERE ID_USUARIO = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  findEspecializacaoByUserId: async (id) => {
    try {
      const [linhas] = await pool.query(
        'SELECT ESPECIALIZACAO_DESIGNER FROM USUARIO_PROFISSIONAL WHERE ID_USUARIO = ? LIMIT 1',
        [id]
      );
      return linhas.length > 0 ? linhas[0].ESPECIALIZACAO_DESIGNER : null;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  listarPublicacoes: async () => {
    try {
      const [publicacoes] = await pool.query(`
        SELECT 
          p.ID_PUBLICACAO,
          p.ID_USUARIO,
          p.NOME_PUBLICACAO,
          p.DESCRICAO_PUBLICACAO,
          p.CATEGORIA,
          u.NOME_USUARIO,
          u.FOTO_PERFIL_PASTA_USUARIO,
          GROUP_CONCAT(DISTINCT t.NOME_TAG) AS TAGS
        FROM PUBLICACOES_PROFISSIONAL p
        LEFT JOIN TAGS_PUBLICACOES tp ON p.ID_PUBLICACAO = tp.ID_PUBLICACAO
        LEFT JOIN TAGS t ON tp.ID_TAG = t.ID_TAG
        LEFT JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
        GROUP BY p.ID_PUBLICACAO
        ORDER BY p.ID_PUBLICACAO DESC
        LIMIT 50
      `);

      const ids = publicacoes.map(pub => pub.ID_PUBLICACAO);
      if(ids.length === 0) return [];

      const [imgs] = await pool.query(`
        SELECT ID_PUBLICACAO, IMG_PUBLICACAO
        FROM CONTEUDOS_PUBLICACAO_PROFISSIONAL
        WHERE ID_PUBLICACAO IN (?)
      `, [ids]);

      const imagensPorPublicacao = {};
      imgs.forEach(img => {
        if(!imagensPorPublicacao[img.ID_PUBLICACAO]) imagensPorPublicacao[img.ID_PUBLICACAO] = [];
        imagensPorPublicacao[img.ID_PUBLICACAO].push(img.IMG_PUBLICACAO);
      });

      publicacoes.forEach(pub => {
        pub.imagens = imagensPorPublicacao[pub.ID_PUBLICACAO] || [];
        pub.imagensUrls = pub.imagens.map(imgBuffer => "data:image/jpeg;base64," + imgBuffer.toString('base64'));
      });

      return publicacoes;

    } catch (error) {
      console.error("Erro ao tentar listar publicações:", error);
      return [];
    }
  },

  findIdPublicacao: async (id) => {
    try {
      const [pubRows] = await pool.query(`
        SELECT 
          p.ID_PUBLICACAO,
          p.ID_USUARIO,
          p.NOME_PUBLICACAO,
          p.DESCRICAO_PUBLICACAO,
          p.CATEGORIA,
          u.NOME_USUARIO,
          u.FOTO_PERFIL_PASTA_USUARIO,
          GROUP_CONCAT(DISTINCT t.NOME_TAG) AS TAGS
        FROM PUBLICACOES_PROFISSIONAL p
        LEFT JOIN TAGS_PUBLICACOES tp ON p.ID_PUBLICACAO = tp.ID_PUBLICACAO
        LEFT JOIN TAGS t ON tp.ID_TAG = t.ID_TAG
        LEFT JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
        WHERE p.ID_PUBLICACAO = ?
        GROUP BY p.ID_PUBLICACAO
      `, [id]);

      if(pubRows.length === 0) return null;

      const [imgsRows] = await pool.query(`
        SELECT IMG_PUBLICACAO 
        FROM CONTEUDOS_PUBLICACAO_PROFISSIONAL 
        WHERE ID_PUBLICACAO = ?
      `, [id]);

      const publicacao = pubRows[0];
      publicacao.imagens = imgsRows.map(row => row.IMG_PUBLICACAO);
      publicacao.imagensUrls = publicacao.imagens.map(buffer => "data:image/jpeg;base64," + buffer.toString('base64'));

      return publicacao;

    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  // NOVA FUNÇÃO PARA O CONTROLLER DE COMENTÁRIOS
  findIdPublicacaoComImagensBase64: async (id) => {
    try {
      return await listagensModel.findIdPublicacao(id);
    } catch (error) {
      console.error("Erro ao buscar publicação com imagens base64:", error);
      return null;
    }
  },

  listarPublicacoesPorUsuario: async (idUsuario) => {
    try {
      const [publicacoes] = await pool.query(`
        SELECT 
          p.ID_PUBLICACAO,
          p.ID_USUARIO,
          p.NOME_PUBLICACAO,
          p.DESCRICAO_PUBLICACAO,
          p.CATEGORIA,
          u.NOME_USUARIO,
          u.FOTO_PERFIL_PASTA_USUARIO,
          GROUP_CONCAT(DISTINCT t.NOME_TAG) AS TAGS
        FROM PUBLICACOES_PROFISSIONAL p
        LEFT JOIN TAGS_PUBLICACOES tp ON p.ID_PUBLICACAO = tp.ID_PUBLICACAO
        LEFT JOIN TAGS t ON tp.ID_TAG = t.ID_TAG
        LEFT JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
        WHERE p.ID_USUARIO = ?
        GROUP BY p.ID_PUBLICACAO
        ORDER BY p.ID_PUBLICACAO DESC
      `, [idUsuario]);

      const ids = publicacoes.map(pub => pub.ID_PUBLICACAO);
      if (ids.length === 0) return [];

      const [imgs] = await pool.query(`
        SELECT ID_PUBLICACAO, IMG_PUBLICACAO
        FROM CONTEUDOS_PUBLICACAO_PROFISSIONAL
        WHERE ID_PUBLICACAO IN (?)
      `, [ids]);

      const imagensPorPublicacao = {};
      imgs.forEach(img => {
        if (!imagensPorPublicacao[img.ID_PUBLICACAO]) imagensPorPublicacao[img.ID_PUBLICACAO] = [];
        imagensPorPublicacao[img.ID_PUBLICACAO].push(img.IMG_PUBLICACAO);
      });

      publicacoes.forEach(pub => {
        pub.imagens = imagensPorPublicacao[pub.ID_PUBLICACAO] || [];
      });

      return publicacoes;

    } catch (error) {
      console.error("Erro ao listar publicações do usuário:", error);
      return [];
    }
  },

  listarPublicacoesUsuarioLogado: async (idUsuario) => {
    try {
      const [publicacoes] = await pool.query(`
        SELECT 
          p.ID_PUBLICACAO,
          p.ID_USUARIO,
          p.NOME_PUBLICACAO,
          p.DESCRICAO_PUBLICACAO,
          p.CATEGORIA,
          u.NOME_USUARIO,
          u.FOTO_PERFIL_PASTA_USUARIO,
          GROUP_CONCAT(DISTINCT t.NOME_TAG) AS TAGS
        FROM PUBLICACOES_PROFISSIONAL p
        LEFT JOIN TAGS_PUBLICACOES tp ON p.ID_PUBLICACAO = tp.ID_PUBLICACAO
        LEFT JOIN TAGS t ON tp.ID_TAG = t.ID_TAG
        LEFT JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
        WHERE p.ID_USUARIO = ?
        GROUP BY p.ID_PUBLICACAO
        ORDER BY p.ID_PUBLICACAO DESC
      `, [idUsuario]);

      const ids = publicacoes.map(pub => pub.ID_PUBLICACAO);
      if (ids.length === 0) return [];

      const [imgs] = await pool.query(`
        SELECT ID_PUBLICACAO, IMG_PUBLICACAO
        FROM CONTEUDOS_PUBLICACAO_PROFISSIONAL
        WHERE ID_PUBLICACAO IN (?)
      `, [ids]);

      const imagensPorPublicacao = {};
      imgs.forEach(img => {
        if (!imagensPorPublicacao[img.ID_PUBLICACAO]) imagensPorPublicacao[img.ID_PUBLICACAO] = [];
        imagensPorPublicacao[img.ID_PUBLICACAO].push(img.IMG_PUBLICACAO);
      });

      publicacoes.forEach(pub => {
        pub.imagens = imagensPorPublicacao[pub.ID_PUBLICACAO] || [];
      });

      return publicacoes;

    } catch (error) {
      console.error("Erro ao listar publicações do usuário:", error);
      return [];
    }
  },

  listarPropostas: async () => {
    try {
      const [propostas] = await pool.query(`
        SELECT 
          p.ID_PROPOSTA,
          p.ID_USUARIO,
          p.TITULO_PROPOSTA,
          p.DESCRICAO_PROPOSTA,
          p.CATEGORIA_PROPOSTA,
          p.PREFERENCIA_PROPOSTA,
          p.PRAZO_ENTREGA,
          p.ORCAMENTO,
          p.DATA_PROPOSTA,
          u.NOME_USUARIO,
          u.FOTO_PERFIL_PASTA_USUARIO
        FROM PROPOSTA_PROJETO p
        LEFT JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
        ORDER BY p.DATA_PROPOSTA DESC
        LIMIT 50
      `);

      const mapaProfissional = {
        design_grafico: "Designer Gráfico",
        ilustracao: "Ilustrador(a)",
        uiux: "Designer UI/UX",
        arte_digital: "Artista Digital",
        arte_3d: "Artista 3D",
        animacao: "Animador(a)",
        branding: "Especialista em Branding",
        tipografia: "Tipógrafo(a)",
        modelagem_3d: "Modelador(a) 3D",
        design_de_produto: "Designer de Produto",
        design_editorial: "Designer Editorial",
        design_de_jogos: "Designer de Jogos",
        fotografia: "Fotógrafo(a)",
        outro: "Profissional Diverso"
      };

      propostas.forEach(p => {
        p.profissionalRequerido = mapaProfissional[p.CATEGORIA_PROPOSTA] || "Profissional Diverso";
      });

      return propostas;

    } catch (error) {
      console.error("Erro ao listar propostas de projeto:", error);
      return [];
    }
  },

};

module.exports = listagensModel;
