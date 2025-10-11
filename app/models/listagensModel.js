var pool = require("../../config/pool_conexoes");

const listagensModel = {

  // buscarProfissionaisComEspecializacao: async () => {
  //   try {
  //     const [linhas] = await pool.query(`
  //       SELECT 
  //         u.ID_USUARIO, 
  //         u.NOME_USUARIO, 
  //         u.FOTO_PERFIL_BANCO_USUARIO,
  //         u.IMG_BANNER_BANCO_USUARIO,
  //         u.DESCRICAO_PERFIL_USUARIO,
  //         up.ESPECIALIZACAO_DESIGNER
  //       FROM USUARIOS u
  //       LEFT JOIN USUARIO_PROFISSIONAL up ON u.ID_USUARIO = up.ID_USUARIO
  //       WHERE u.TIPO_USUARIO = 'profissional' 
  //         AND u.STATUS_USUARIO = 'ativo'
  //     `);
  //     return linhas;
  //   } catch (error) {
  //     console.error("Erro ao buscar profissionais:", error);
  //     return [];
  //   }
  // },

buscarProfissionaisComContagem: async (idUsuarioLogado = null) => {
  try {
    const [linhas] = await pool.query(`
      SELECT 
        u.ID_USUARIO,
        u.NOME_USUARIO,
        u.FOTO_PERFIL_BANCO_USUARIO,
        u.IMG_BANNER_BANCO_USUARIO,
        u.DESCRICAO_PERFIL_USUARIO,
        u.DATA_CADASTRO,
        up.ESPECIALIZACAO_DESIGNER,
        IFNULL(s.QUANT_SEGUIDORES, 0) AS QUANT_SEGUIDORES,
        IFNULL(p.QUANT_PUBLICACOES, 0) AS QUANT_PUBLICACOES,
        IFNULL(a.MEDIA_NOTA, 0) AS MEDIA_NOTA,
        IFNULL(a.QTD_AVALIACOES, 0) AS QTD_AVALIACOES,
        IFNULL(c.CONTRATOS_FINALIZADOS, 0) AS CONTRATOS_FINALIZADOS,
        IF(f.ID_SEGUIDO IS NOT NULL AND f.STATUS_SEGUINDO = 1, 'seguindo', 'seguir') AS SEGUIDO
      FROM USUARIOS u
      LEFT JOIN USUARIO_PROFISSIONAL up ON up.ID_USUARIO = u.ID_USUARIO
      LEFT JOIN (
          SELECT ID_SEGUIDO, COUNT(*) AS QUANT_SEGUIDORES
          FROM SEGUINDO
          WHERE STATUS_SEGUINDO = 1
          GROUP BY ID_SEGUIDO
      ) s ON s.ID_SEGUIDO = u.ID_USUARIO
      LEFT JOIN (
          SELECT ID_USUARIO, COUNT(*) AS QUANT_PUBLICACOES
          FROM PUBLICACOES_PROFISSIONAL
          GROUP BY ID_USUARIO
      ) p ON p.ID_USUARIO = u.ID_USUARIO
    LEFT JOIN (
    SELECT 
        ID_PROFISSIONAL, 
        ROUND(AVG(NOTA), 1) AS MEDIA_NOTA,  
        COUNT(*) AS QTD_AVALIACOES
    FROM AVALIACOES_PROFISSIONAL
    GROUP BY ID_PROFISSIONAL
) a ON a.ID_PROFISSIONAL = u.ID_USUARIO
      LEFT JOIN (
          SELECT ID_PROFISSIONAL, COUNT(*) AS CONTRATOS_FINALIZADOS
          FROM CONTRATACOES
          WHERE STATUS = 'FINALIZADA'
          GROUP BY ID_PROFISSIONAL
      ) c ON c.ID_PROFISSIONAL = u.ID_USUARIO
      LEFT JOIN SEGUINDO f 
          ON f.ID_SEGUIDO = u.ID_USUARIO 
          AND f.ID_USUARIO = ?
      WHERE u.TIPO_USUARIO = 'profissional'
        AND u.STATUS_USUARIO = 'ativo';
    `, [idUsuarioLogado]);

    return linhas.map(p => ({
      ...p,
      FOTO_PERFIL_BANCO_USUARIO: p.FOTO_PERFIL_BANCO_USUARIO
        ? `data:image/png;base64,${p.FOTO_PERFIL_BANCO_USUARIO.toString('base64')}`
        : null,
      IMG_BANNER_BANCO_USUARIO: p.IMG_BANNER_BANCO_USUARIO
        ? `data:image/png;base64,${p.IMG_BANNER_BANCO_USUARIO.toString('base64')}`
        : null
    }));

  } catch (error) {
    console.error("Erro ao buscar profissionais com contagem:", error);
    return [];
  }
},


  // findIdusuario: async (id) => {
  //   try {
  //     const [rows] = await pool.query('SELECT * FROM USUARIOS WHERE ID_USUARIO = ?', [id]);
  //     return rows.length > 0 ? rows[0] : null;
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // },


//   findIdusuario: async (id) => {
//   try {
//     const [rows] = await pool.query('SELECT * FROM USUARIOS WHERE ID_USUARIO = ?', [id]);
//     if (rows.length === 0) return null;

//     const usuario = rows[0];

//     if (usuario.FOTO_PERFIL_BANCO_USUARIO) {
//       usuario.FOTO_PERFIL_BANCO_USUARIO = `data:image/png;base64,${usuario.FOTO_PERFIL_BANCO_USUARIO.toString('base64')}`;
//     } else {
//       usuario.FOTO_PERFIL_BANCO_USUARIO = null; 
//     }

//     if (usuario.IMG_BANNER_BANCO_USUARIO) {
//       usuario.IMG_BANNER_BANCO_USUARIO = `data:image/png;base64,${usuario.IMG_BANNER_BANCO_USUARIO.toString('base64')}`;
//     } else {
//       usuario.IMG_BANNER_BANCO_USUARIO = null; 
//     }

//     return usuario;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// },


findIdusuario: async (idUsuarioPerfil, idLogado = null) => {
  try {
      const [linhas] = await pool.query(`
        SELECT 
          u.ID_USUARIO,
          u.NOME_USUARIO,
          u.USER_USUARIO,
               u.TIPO_USUARIO,
          u.FOTO_PERFIL_BANCO_USUARIO,
          u.IMG_BANNER_BANCO_USUARIO,
          u.DESCRICAO_PERFIL_USUARIO,
          u.DATA_CADASTRO,
          up.ESPECIALIZACAO_DESIGNER,
          IFNULL(s.QUANT_SEGUIDORES, 0) AS QTD_SEGUIDORES,
          IFNULL(p.QUANT_PUBLICACOES, 0) AS QTD_PUBLICACOES,
          IFNULL(port.QTD_PORTFOLIOS, 0) AS QTD_PORTFOLIOS,
          IFNULL(a.MEDIA_NOTA, 0) AS MEDIA_NOTA,
          IFNULL(a.QTD_AVALIACOES, 0) AS QTD_AVALIACOES,
          IFNULL(c.CONTRATOS_FINALIZADOS, 0) AS CONTRATOS_FINALIZADOS,
          IF(f.ID_SEGUIDO IS NOT NULL AND f.STATUS_SEGUINDO = 1, 'seguindo', 'seguir') AS SEGUIDO
        FROM USUARIOS u
        LEFT JOIN USUARIO_PROFISSIONAL up ON up.ID_USUARIO = u.ID_USUARIO
        LEFT JOIN (
            SELECT ID_SEGUIDO, COUNT(*) AS QUANT_SEGUIDORES
            FROM SEGUINDO
            WHERE STATUS_SEGUINDO = 1
            GROUP BY ID_SEGUIDO
        ) s ON s.ID_SEGUIDO = u.ID_USUARIO
        LEFT JOIN (
            SELECT ID_USUARIO, COUNT(*) AS QUANT_PUBLICACOES
            FROM PUBLICACOES_PROFISSIONAL
            GROUP BY ID_USUARIO
        ) p ON p.ID_USUARIO = u.ID_USUARIO
        LEFT JOIN (
            SELECT ID_USUARIO, COUNT(*) AS QTD_PORTFOLIOS
            FROM PORTFOLIOS
            GROUP BY ID_USUARIO
        ) port ON port.ID_USUARIO = u.ID_USUARIO
        LEFT JOIN (
            SELECT 
                ID_PROFISSIONAL, 
                ROUND(AVG(NOTA), 1) AS MEDIA_NOTA,  
                COUNT(*) AS QTD_AVALIACOES
            FROM AVALIACOES_PROFISSIONAL
            GROUP BY ID_PROFISSIONAL
        ) a ON a.ID_PROFISSIONAL = u.ID_USUARIO
        LEFT JOIN (
            SELECT ID_PROFISSIONAL, COUNT(*) AS CONTRATOS_FINALIZADOS
            FROM CONTRATACOES
            WHERE STATUS = 'FINALIZADA'
            GROUP BY ID_PROFISSIONAL
        ) c ON c.ID_PROFISSIONAL = u.ID_USUARIO
        LEFT JOIN SEGUINDO f 
            ON f.ID_SEGUIDO = u.ID_USUARIO 
            AND f.ID_USUARIO = ?
        WHERE u.ID_USUARIO = ?
      `, [idLogado, idUsuarioPerfil]);

      if (linhas.length === 0) return null;

      const usuario = linhas[0];

      // imagens
      usuario.FOTO_PERFIL_BANCO_USUARIO = usuario.FOTO_PERFIL_BANCO_USUARIO
        ? `data:image/png;base64,${usuario.FOTO_PERFIL_BANCO_USUARIO.toString('base64')}`
        : null;
      usuario.IMG_BANNER_BANCO_USUARIO = usuario.IMG_BANNER_BANCO_USUARIO
        ? `data:image/png;base64,${usuario.IMG_BANNER_BANCO_USUARIO.toString('base64')}`
        : null;

      return usuario;

  } catch (error) {
      console.log(error);
      throw error;
  }
},

listarAvaliacoes: async (idProfissional) => {
  console.log("Chegou no listar avaliações");
  try {
    const [linhas] = await pool.query(`
      SELECT 
        a.ID_AVALIACAO,
        a.ID_PROFISSIONAL,
        a.ID_AVALIADOR,
        a.COMENTARIO,
        a.NOTA,
        a.DATA_CRIACAO,
        u.NOME_USUARIO AS NOME_AVALIADOR,
        u.FOTO_PERFIL_BANCO_USUARIO AS FOTO_AVALIADOR
      FROM AVALIACOES_PROFISSIONAL a
      JOIN USUARIOS u ON u.ID_USUARIO = a.ID_AVALIADOR
      WHERE a.ID_PROFISSIONAL = ?
      ORDER BY a.DATA_CRIACAO DESC
    `, [idProfissional]);

  
    const avaliacoes = linhas.map(av => ({
      ...av,
      FOTO_AVALIADOR: av.FOTO_AVALIADOR
        ? `data:image/png;base64,${av.FOTO_AVALIADOR.toString('base64')}`
        : null
    }));

    return avaliacoes;

  } catch (error) {
    console.error("Erro ao listar avaliações:", error);
    throw error;
  }
},



contarSeguidores: async (id) => {
  try {
      const [quantseguidores] = await pool.query(
        'SELECT COUNT(*) AS total FROM SEGUINDO WHERE ID_SEGUIDO = ? AND STATUS_SEGUINDO = 1',
      [id]
      );
      return quantseguidores[0].total;
    } catch (error) {
      console.log(error);
      throw error;
    }

},



contarPublicacoes: async (id) => {
  try {
      const [quantPublicacoes] = await pool.query(
        'SELECT COUNT(*) AS total FROM PUBLICACOES_PROFISSIONAL WHERE ID_USUARIO = ?',
        [id]
      );
      return quantPublicacoes[0].total;
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




  contarPortfoliosUsuario: async(id) => {
    try {
      const [resultado] = await pool.query(
        'SELECT COUNT(*) AS total FROM PORTFOLIOS WHERE ID_USUARIO = ?',
        [id]
      );
      return resultado[0].total;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },


listarPublicacoes: async (idUsuario = null) => {
  try {
    const [publicacoes] = await pool.query(`
      SELECT 
        p.ID_PUBLICACAO,
        p.ID_USUARIO,
        p.NOME_PUBLICACAO,
        p.DESCRICAO_PUBLICACAO,
        p.CATEGORIA,
        p.DATA_PUBLICACAO,
        u.NOME_USUARIO,
        u.FOTO_PERFIL_BANCO_USUARIO,
        GROUP_CONCAT(DISTINCT t.NOME_TAG) AS TAGS,
        IF(f.ID_PUBLICACAO IS NOT NULL, 'favorito', 'favoritar') AS FAVORITO
      FROM PUBLICACOES_PROFISSIONAL p
      LEFT JOIN TAGS_PUBLICACOES tp ON p.ID_PUBLICACAO = tp.ID_PUBLICACAO
      LEFT JOIN TAGS t ON tp.ID_TAG = t.ID_TAG
      LEFT JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
      LEFT JOIN FAVORITOS f 
        ON f.ID_PUBLICACAO = p.ID_PUBLICACAO 
        AND f.ID_USUARIO = ? 
        AND f.STATUS_FAVORITO = 1
      GROUP BY p.ID_PUBLICACAO
      ORDER BY p.ID_PUBLICACAO DESC
      LIMIT 50
    `, [idUsuario]);

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


      if (pub.FOTO_PERFIL_BANCO_USUARIO) {
    const buffer = Buffer.isBuffer(pub.FOTO_PERFIL_BANCO_USUARIO)
      ? pub.FOTO_PERFIL_BANCO_USUARIO
      : Buffer.from(pub.FOTO_PERFIL_BANCO_USUARIO);
    pub.FOTO_PERFIL_BANCO_USUARIO = "data:image/png;base64," + buffer.toString('base64');
  } else {
    pub.FOTO_PERFIL_BANCO_USUARIO = null; 
  }


      pub.imagens = imagensPorPublicacao[pub.ID_PUBLICACAO] || [];
      pub.imagensUrls = pub.imagens.map(imgBuffer => "data:image/jpeg;base64," + imgBuffer.toString('base64'));
    });

    return publicacoes;

  } catch (error) {
    console.error("Erro ao tentar listar publicações:", error);
    return [];
  }
},

findIdPublicacao: async (idPublicacao, idUsuario =  null) => {
  try {
    const [pubRows] = await pool.query(`
      SELECT 
        p.ID_PUBLICACAO,
        p.ID_USUARIO,
        p.NOME_PUBLICACAO,
        p.DESCRICAO_PUBLICACAO,
        p.CATEGORIA,
        u.NOME_USUARIO,
        u.FOTO_PERFIL_BANCO_USUARIO,
        GROUP_CONCAT(DISTINCT t.NOME_TAG) AS TAGS,
        IF(f.ID_PUBLICACAO IS NOT NULL, 'favorito', 'favoritar') AS FAVORITO
      FROM PUBLICACOES_PROFISSIONAL p
      LEFT JOIN TAGS_PUBLICACOES tp ON p.ID_PUBLICACAO = tp.ID_PUBLICACAO
      LEFT JOIN TAGS t ON tp.ID_TAG = t.ID_TAG
      LEFT JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
      LEFT JOIN FAVORITOS f 
        ON f.ID_PUBLICACAO = p.ID_PUBLICACAO
        AND f.ID_USUARIO = ?
        AND f.STATUS_FAVORITO = 1
      WHERE p.ID_PUBLICACAO = ?
      GROUP BY p.ID_PUBLICACAO
    `, [idUsuario, idPublicacao]);

    if (pubRows.length === 0) return null;

    const [imgsRows] = await pool.query(`
      SELECT IMG_PUBLICACAO 
      FROM CONTEUDOS_PUBLICACAO_PROFISSIONAL 
      WHERE ID_PUBLICACAO = ?
    `, [idPublicacao]);

    const publicacao = pubRows[0];

    if (publicacao.FOTO_PERFIL_BANCO_USUARIO) {
  publicacao.FOTO_PERFIL_BANCO_USUARIO = "data:image/png;base64," + publicacao.FOTO_PERFIL_BANCO_USUARIO.toString('base64');
} else {
  publicacao.FOTO_PERFIL_BANCO_USUARIO = null; 
}
    publicacao.imagens = imgsRows.map(row => row.IMG_PUBLICACAO);
    publicacao.imagensUrls = publicacao.imagens.map(buffer => "data:image/jpeg;base64," + buffer.toString('base64'));

    return publicacao;

  } catch (error) {
    console.log(error);
    throw error;
  }
},



  // findIdPublicacao: async (id) => {
  //   try {
  //     const [pubRows] = await pool.query(`
  //       SELECT 
  //         p.ID_PUBLICACAO,
  //         p.ID_USUARIO,
  //         p.NOME_PUBLICACAO,
  //         p.DESCRICAO_PUBLICACAO,
  //         p.CATEGORIA,
  //         u.NOME_USUARIO,
  //         u.FOTO_PERFIL_PASTA_USUARIO,
  //         GROUP_CONCAT(DISTINCT t.NOME_TAG) AS TAGS
  //       FROM PUBLICACOES_PROFISSIONAL p
  //       LEFT JOIN TAGS_PUBLICACOES tp ON p.ID_PUBLICACAO = tp.ID_PUBLICACAO
  //       LEFT JOIN TAGS t ON tp.ID_TAG = t.ID_TAG
  //       LEFT JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
  //       WHERE p.ID_PUBLICACAO = ?
  //       GROUP BY p.ID_PUBLICACAO
  //     `, [id]);

  //     if(pubRows.length === 0) return null;

  //     const [imgsRows] = await pool.query(`
  //       SELECT IMG_PUBLICACAO 
  //       FROM CONTEUDOS_PUBLICACAO_PROFISSIONAL 
  //       WHERE ID_PUBLICACAO = ?
  //     `, [id]);

  //     const publicacao = pubRows[0];
  //     publicacao.imagens = imgsRows.map(row => row.IMG_PUBLICACAO);
  //     publicacao.imagensUrls = publicacao.imagens.map(buffer => "data:image/jpeg;base64," + buffer.toString('base64'));

  //     return publicacao;

  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // },

  // NOVA FUNÇÃO PARA O CONTROLLER DE COMENTÁRIOS
  findIdPublicacaoComImagensBase64: async (id) => {
    try {
      return await listagensModel.findIdPublicacao(id);
    } catch (error) {
      console.error("Erro ao buscar publicação com imagens base64:", error);
      return null;
    }
  },

  listarPublicacoesPorUsuario: async (idDonoPublicacoes, idUsuarioLogado = null) => {
    try {
      const [publicacoes] = await pool.query(`
        SELECT 
        p.ID_PUBLICACAO,
        p.ID_USUARIO,
        p.NOME_PUBLICACAO,
        p.DESCRICAO_PUBLICACAO,
        p.CATEGORIA,
        u.NOME_USUARIO,
        u.FOTO_PERFIL_BANCO_USUARIO,
        GROUP_CONCAT(DISTINCT t.NOME_TAG) AS TAGS,
        IF(f.ID_PUBLICACAO IS NOT NULL, 'favorito', 'favoritar') AS FAVORITO
      FROM PUBLICACOES_PROFISSIONAL p
      LEFT JOIN TAGS_PUBLICACOES tp ON p.ID_PUBLICACAO = tp.ID_PUBLICACAO
      LEFT JOIN TAGS t ON tp.ID_TAG = t.ID_TAG
      LEFT JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
      LEFT JOIN FAVORITOS f 
        ON f.ID_PUBLICACAO = p.ID_PUBLICACAO 
        AND f.ID_USUARIO = ?
        AND f.STATUS_FAVORITO = 1
      WHERE p.ID_USUARIO = ?
      GROUP BY p.ID_PUBLICACAO
      ORDER BY p.ID_PUBLICACAO DESC
    `, [idUsuarioLogado, idDonoPublicacoes]);

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
        u.FOTO_PERFIL_BANCO_USUARIO,
        GROUP_CONCAT(DISTINCT t.NOME_TAG) AS TAGS,
        IF(f.ID_PUBLICACAO IS NOT NULL, 'favorito', 'favoritar') AS FAVORITO
      FROM PUBLICACOES_PROFISSIONAL p
      LEFT JOIN TAGS_PUBLICACOES tp ON p.ID_PUBLICACAO = tp.ID_PUBLICACAO
      LEFT JOIN TAGS t ON tp.ID_TAG = t.ID_TAG
      LEFT JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
      LEFT JOIN FAVORITOS f 
        ON f.ID_PUBLICACAO = p.ID_PUBLICACAO 
        AND f.ID_USUARIO = ?
        AND f.STATUS_FAVORITO = 1
      WHERE p.ID_USUARIO = ?
      GROUP BY p.ID_PUBLICACAO
      ORDER BY p.ID_PUBLICACAO DESC
    `, [idUsuario, idUsuario]); 

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
            u.ID_USUARIO,
               u.USER_USUARIO,
                    u.TIPO_USUARIO,
          u.NOME_USUARIO,
          u.FOTO_PERFIL_BANCO_USUARIO
        FROM PROPOSTA_PROJETO p
        LEFT JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
        ORDER BY p.DATA_PROPOSTA DESC
        LIMIT 50
      `);
  
      const mapaProfissional = {
        "Design Gráfico": "Designer Gráfico",
        "Ilustração": "Ilustrador(a)",
        "UI/UX": "Designer UI/UX",
        "Arte Digital": "Artista Digital",
        "Arte 3D": "Artista 3D",
        "Animação": "Animador(a)",
        "Branding": "Especialista em Branding",
        "Tipografia": "Tipógrafo(a)",
        "Modelagem 3D": "Modelador(a) 3D",
        "Design de Produto": "Designer de Produto",
        "Design Editorial": "Designer Editorial",
        "Design de Jogos": "Designer de Jogos",
        "Fotografia": "Fotógrafo(a)",
        "Outros": "Profissional Diverso"
      };
  

      function formatarTempoRestante(diffDias) {
        if (diffDias < 1) return "Expirado";
        if (diffDias < 7) return `${diffDias} ${diffDias === 1 ? "dia" : "dias"} restante(s)`;
        if (diffDias < 30) {
          const semanas = Math.ceil(diffDias / 7);
          return `${semanas} ${semanas === 1 ? "semana" : "semanas"} restante(s)`;
        } else {
          const meses = Math.ceil(diffDias / 30);
          return `${meses} ${meses === 1 ? "mês" : "meses"} restante(s)`;
        }
      }
      
      const propostasComProfissional = propostas.map(p => {
        let prazoRestante = null;
        let dataEntregaFormatada = null;
      
        if (p.PRAZO_ENTREGA) {
          const hoje = new Date();
          const prazo = new Date(p.PRAZO_ENTREGA);
          const diffMs = prazo - hoje;
          const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
          prazoRestante = formatarTempoRestante(diffDias);
          dataEntregaFormatada = prazo.toLocaleDateString('pt-BR');
        }
      
        return {
          ...p,
          profissionalRequerido: mapaProfissional[p.CATEGORIA_PROPOSTA] || "Profissional Diverso",
          prazoRestante,
          dataEntregaFormatada
        };
      });
      

      console.log("CONSOLE DO MODEL: " + propostasComProfissional)

  
      return propostasComProfissional;
  
    } catch (error) {
      console.error("Erro ao listar propostas de projeto:", error);
      return [];
    }
  },
  
  



  findIdProposta: async (idProposta) => {
  try {
    
    const [proRows] = await pool.query(`
      SELECT 
        p.*, 
        u.NOME_USUARIO, 
            u.ID_USUARIO,
               u.USER_USUARIO,
                  u.TIPO_USUARIO,
        u.FOTO_PERFIL_BANCO_USUARIO
      FROM PROPOSTA_PROJETO p
      INNER JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
      WHERE p.ID_PROPOSTA = ?
    `, [idProposta]);

    if (proRows.length === 0) return null; // não encontrou

    const proposta = proRows[0];

    // Se existir foto, converter BLOB para Base64
    if (proposta.FOTO_PERFIL_BANCO_USUARIO) {
      proposta.FOTO_PERFIL_BANCO_USUARIO = Buffer.from(proposta.FOTO_PERFIL_BANCO_USUARIO).toString('base64');
    }



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


        proposta.profissionalRequerido = mapaProfissional[proposta.CATEGORIA_PROPOSTA] || "Profissional Diverso";


    return proposta;

  } catch (error) {
    console.error("Erro ao buscar proposta:", error);
    throw error;
  }
},







listarPortfoliosUsuario: async (idUsuario) => {
  try {
    // Busca os portfolios do usuário 
    const [portfolios] = await pool.query(`
      SELECT 
        pf.ID_PORTFOLIO,
        pf.NOME_PORTFOLIO,
        pf.DESCRICAO_PORTFOLIO,
        pf.ID_USUARIO
      FROM PORTFOLIOS pf
      INNER JOIN USUARIOS u ON pf.ID_USUARIO = u.ID_USUARIO
      WHERE pf.ID_USUARIO = ?
      ORDER BY pf.ID_PORTFOLIO DESC
    `, [idUsuario]);

    if (portfolios.length === 0) return [];

    // Pegar todas as publicações que fazem parte desses portfolios
    const idsPortfolios = portfolios.map(p => p.ID_PORTFOLIO);

   
    console.log(idsPortfolios);

    const [publisPortfolio] = await pool.query(`
     SELECT 
      pp.ID_PORTFOLIO,
      pp.ID_PUBLICACAO,
      MIN(cp.IMG_PUBLICACAO) AS IMG_PUBLICACAO
    FROM PUBLICACAO_PORTFOLIO pp
    INNER JOIN CONTEUDOS_PUBLICACAO_PROFISSIONAL cp 
      ON pp.ID_PUBLICACAO = cp.ID_PUBLICACAO
    WHERE pp.ID_PORTFOLIO IN (?)
    GROUP BY pp.ID_PORTFOLIO, pp.ID_PUBLICACAO
    ORDER BY pp.ID_PUBLICACAO ASC;


    `, [idsPortfolios]);

    //  Organiz imagens por portfólio (pelo menos 4 imgs)
    const imagensPorPortfolio = {};
    publisPortfolio.forEach(pub => {
      if (!imagensPorPortfolio[pub.ID_PORTFOLIO]) imagensPorPortfolio[pub.ID_PORTFOLIO] = [];
      if (imagensPorPortfolio[pub.ID_PORTFOLIO].length < 4) {
        imagensPorPortfolio[pub.ID_PORTFOLIO].push(pub.IMG_PUBLICACAO);
      }
    });

    // Juntar imagens ao portfolio
    portfolios.forEach(p => {
      p.imagensCapa = imagensPorPortfolio[p.ID_PORTFOLIO] || [];
    });

    return portfolios;

  } catch (error) {
    console.error("Erro ao listar portfólios do usuário:", error);
    return [];
  }
},




 



buscarPortfolioPorId: async (idPortfolio) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        pf.ID_PORTFOLIO,
        pf.NOME_PORTFOLIO,
        pf.DESCRICAO_PORTFOLIO,
        pf.ID_USUARIO,
        u.NOME_USUARIO
      FROM PORTFOLIOS pf
      INNER JOIN USUARIOS u ON pf.ID_USUARIO = u.ID_USUARIO
      WHERE pf.ID_PORTFOLIO = ?
    `, [idPortfolio]);

    const portfolio = rows[0] || null;

    if (portfolio) {
      // Buscar tags do portfólio
      const [tagsPortfolio] = await pool.query(`
        SELECT t.NOME_TAG 
        FROM TAGS_PORTFOLIOS tp
        INNER JOIN TAGS t ON tp.ID_TAG = t.ID_TAG
        WHERE tp.ID_PORTFOLIO = ?
      `, [idPortfolio]);

      portfolio.tagsPortfolio = tagsPortfolio.map(t => t.NOME_TAG);
    }

    return portfolio;
  } catch (error) {
    console.error("Erro ao buscar portfolio:", error);
    return null;
  }
},



listarPublicacoesdoPortfolio: async (idPortfolio, idUsuario = null) => {
  try {
    // 1) Buscar publicações que estão nesse portfolio
    const [publicacoes] = await pool.query(`
     SELECT 
        p.ID_PUBLICACAO,
        p.ID_USUARIO,
        p.NOME_PUBLICACAO,
        p.DESCRICAO_PUBLICACAO,
        p.CATEGORIA,
        u.NOME_USUARIO,
        u.FOTO_PERFIL_BANCO_USUARIO,
        GROUP_CONCAT(DISTINCT t.NOME_TAG) AS TAGS,
        IF(f.ID_PUBLICACAO IS NOT NULL, 'favorito', 'favoritar') AS FAVORITO
      FROM PUBLICACOES_PROFISSIONAL p
      INNER JOIN PUBLICACAO_PORTFOLIO pp ON p.ID_PUBLICACAO = pp.ID_PUBLICACAO
      LEFT JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
      LEFT JOIN TAGS_PUBLICACOES tp ON p.ID_PUBLICACAO = tp.ID_PUBLICACAO
      LEFT JOIN TAGS t ON tp.ID_TAG = t.ID_TAG
      LEFT JOIN FAVORITOS f 
        ON f.ID_PUBLICACAO = p.ID_PUBLICACAO 
        AND f.ID_USUARIO = ? 
        AND f.STATUS_FAVORITO = 1
      WHERE pp.ID_PORTFOLIO = ?
      GROUP BY p.ID_PUBLICACAO
      ORDER BY p.ID_PUBLICACAO DESC
    `, [idUsuario, idPortfolio]);

    // 2) Buscar todas as imagens das publicações listadas
    const ids = publicacoes.map(pub => pub.ID_PUBLICACAO);
    if (ids.length === 0) return [];

    const [imgs] = await pool.query(`
      SELECT ID_PUBLICACAO, IMG_PUBLICACAO
      FROM CONTEUDOS_PUBLICACAO_PROFISSIONAL
      WHERE ID_PUBLICACAO IN (?)
    `, [ids]);

    // 3) Mapear imagens para cada publicação
    const imagensPorPublicacao = {};
    imgs.forEach(img => {
      if (!imagensPorPublicacao[img.ID_PUBLICACAO]) {
        imagensPorPublicacao[img.ID_PUBLICACAO] = [];
      }
      imagensPorPublicacao[img.ID_PUBLICACAO].push(img.IMG_PUBLICACAO);
    });

    // 4) Montar resultado final adicionando apenas imagens
    publicacoes.forEach(pub => {
      pub.imagens = imagensPorPublicacao[pub.ID_PUBLICACAO] || [];
    });

    return publicacoes;

  } catch (error) {
    console.error("Erro ao listar publicações do portfolio:", error);
    return [];
  }
},



listarSeguidoresESeguindo: async (idUsuarioPerfil, idUsuarioLogado = null) => {
  try {
    // ----------------- SEGUIDORES -----------------
    const [linhasSeguidores] = await pool.query(`
      SELECT u.ID_USUARIO,
             u.NOME_USUARIO,
             u.USER_USUARIO,
             u.FOTO_PERFIL_BANCO_USUARIO,
             IF(sg.ID_SEGUIDO IS NOT NULL AND sg.STATUS_SEGUINDO = 1, 1, 0) AS SEGUIDO
      FROM SEGUINDO s
      INNER JOIN USUARIOS u ON s.ID_USUARIO = u.ID_USUARIO
      LEFT JOIN SEGUINDO sg 
        ON sg.ID_USUARIO = ? 
        AND sg.ID_SEGUIDO = u.ID_USUARIO
        AND sg.STATUS_SEGUINDO = 1
      WHERE s.ID_SEGUIDO = ?
        AND s.STATUS_SEGUINDO = 1
      ORDER BY u.NOME_USUARIO ASC
    `, [idUsuarioLogado, idUsuarioPerfil]);

    // ----------------- SEGUINDO -----------------
    const [linhasSeguindo] = await pool.query(`
      SELECT u.ID_USUARIO,
             u.NOME_USUARIO,
             u.USER_USUARIO,
             u.FOTO_PERFIL_BANCO_USUARIO,
             IF(sg.ID_SEGUIDO IS NOT NULL AND sg.STATUS_SEGUINDO = 1, 1, 0) AS SEGUIDO
      FROM SEGUINDO s
      INNER JOIN USUARIOS u ON s.ID_SEGUIDO = u.ID_USUARIO
      LEFT JOIN SEGUINDO sg 
        ON sg.ID_USUARIO = ? 
        AND sg.ID_SEGUIDO = u.ID_USUARIO
        AND sg.STATUS_SEGUINDO = 1
      WHERE s.ID_USUARIO = ?
        AND s.STATUS_SEGUINDO = 1
      ORDER BY u.NOME_USUARIO ASC
    `, [idUsuarioLogado, idUsuarioPerfil]);

    // ----------------- TRATAR IMAGENS -----------------
    const tratarUsuarios = (linhas) => linhas.map(u => ({
      ...u,
      FOTO_PERFIL_BANCO_USUARIO: u.FOTO_PERFIL_BANCO_USUARIO
        ? `data:image/png;base64,${u.FOTO_PERFIL_BANCO_USUARIO.toString('base64')}`
        : null
    }));

    return {
      seguidores: tratarUsuarios(linhasSeguidores),
      seguindo: tratarUsuarios(linhasSeguindo)
    };

  } catch (error) {
    console.error("Erro ao listar seguidores e seguindo:", error);
    return { seguidores: [], seguindo: [] };
  }
},



}












module.exports = listagensModel;
