const pool = require('../../config/pool_conexoes');

const pesquisasModel = {


  pesquisar: async (palavras, idUsuario = null) => {
  if (!palavras || palavras.length === 0) return [];

  const whereClauses = [];
  const valores = [];

  palavras.forEach(p => {
    const likeTerm = `%${p}%`;
    whereClauses.push(
      "REPLACE(LOWER(p.DESCRICAO_PUBLICACAO), 'ç', 'c') LIKE ?",
      "REPLACE(LOWER(p.CATEGORIA), 'ç', 'c') LIKE ?",
      "REPLACE(LOWER(u.NOME_USUARIO), 'ç', 'c') LIKE ?",
      "REPLACE(LOWER(t.NOME_TAG), 'ç', 'c') LIKE ?"
    );
    valores.push(likeTerm, likeTerm, likeTerm, likeTerm);
  });

 const sql = `
 SELECT 
  p.ID_PUBLICACAO,
  p.ID_USUARIO,
  p.NOME_PUBLICACAO,
  p.DESCRICAO_PUBLICACAO,
  p.CATEGORIA,
  p.DATA_PUBLICACAO,
  u.NOME_USUARIO,
  u.FOTO_PERFIL_BANCO_USUARIO,
  IF(f.ID_PUBLICACAO IS NOT NULL, 'favorito', 'favoritar') AS FAVORITO,
  GROUP_CONCAT(DISTINCT t.NOME_TAG) AS TAGS
FROM (
  SELECT DISTINCT 
    p.ID_PUBLICACAO, 
    p.ID_USUARIO, 
    p.NOME_PUBLICACAO, 
    p.DESCRICAO_PUBLICACAO, 
    p.CATEGORIA,
    p.DATA_PUBLICACAO 
  FROM PUBLICACOES_PROFISSIONAL p
  LEFT JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
  LEFT JOIN TAGS_PUBLICACOES tp ON p.ID_PUBLICACAO = tp.ID_PUBLICACAO
  LEFT JOIN TAGS t ON tp.ID_TAG = t.ID_TAG
  WHERE ${whereClauses.join(' OR ')}
) AS p
LEFT JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
LEFT JOIN TAGS_PUBLICACOES tp ON p.ID_PUBLICACAO = tp.ID_PUBLICACAO
LEFT JOIN TAGS t ON tp.ID_TAG = t.ID_TAG
LEFT JOIN FAVORITOS f
  ON f.ID_PUBLICACAO = p.ID_PUBLICACAO
  AND f.ID_USUARIO = ?
  AND f.STATUS_FAVORITO = 1
GROUP BY p.ID_PUBLICACAO
ORDER BY p.ID_PUBLICACAO DESC


`;



  valores.push(idUsuario);

  const [publicacoes] = await pool.query(sql, valores);

  if (publicacoes.length === 0) return [];

  // buscar imagens dentro do model
  const ids = publicacoes.map(pub => pub.ID_PUBLICACAO);
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

  // transformar imagens e fotos em Base64
  publicacoes.forEach(pub => {
    // foto de perfil
    if (pub.FOTO_PERFIL_BANCO_USUARIO) {
      const buffer = Buffer.isBuffer(pub.FOTO_PERFIL_BANCO_USUARIO)
        ? pub.FOTO_PERFIL_BANCO_USUARIO
        : Buffer.from(pub.FOTO_PERFIL_BANCO_USUARIO);
      pub.FOTO_PERFIL_BANCO_USUARIO = "data:image/png;base64," + buffer.toString('base64');
    } else {
      pub.FOTO_PERFIL_BANCO_USUARIO = null;
    }

    // imagens
    pub.imagens = imagensPorPublicacao[pub.ID_PUBLICACAO] || [];
    pub.imagensUrls = pub.imagens.map(img => "data:image/jpeg;base64," + img.toString('base64'));
  });

  return publicacoes;
},





















  pesquisarPorProfissionais: async (palavras, idUsuario = null) => {
    if (!palavras || palavras.length === 0) return [];

    const whereClauses = [];
    const valores = [];

    
    palavras.forEach(p => {
      const likeTerm = `%${p}%`;
      whereClauses.push(
        "REPLACE(LOWER(u.NOME_USUARIO), 'ç', 'c') LIKE ?",
        "REPLACE(LOWER(u.USER_USUARIO), 'ç', 'c') LIKE ?",
        "REPLACE(LOWER(u.EMAIL_USUARIO), 'ç', 'c') LIKE ?",
        "REPLACE(LOWER(u.DESCRICAO_PERFIL_USUARIO), 'ç', 'c') LIKE ?",
        "REPLACE(LOWER(up.ESPECIALIZACAO_DESIGNER), 'ç', 'c') LIKE ?"
      );
      valores.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
    });

    const sql = `
      SELECT 
        u.ID_USUARIO,
        u.NOME_USUARIO,
        u.USER_USUARIO,
        u.EMAIL_USUARIO,
        u.DESCRICAO_PERFIL_USUARIO,
        u.DATA_CADASTRO,
        up.ESPECIALIZACAO_DESIGNER,
        u.FOTO_PERFIL_BANCO_USUARIO,
        IF(s.ID_SEGUIDO IS NOT NULL AND s.STATUS_SEGUINDO = 1, 1, 0) AS SEGUIDO
      FROM USUARIOS u
      LEFT JOIN USUARIO_PROFISSIONAL up ON u.ID_USUARIO = up.ID_USUARIO
      LEFT JOIN SEGUINDO s 
        ON s.ID_USUARIO = ? 
        AND s.ID_SEGUIDO = u.ID_USUARIO
        AND s.STATUS_SEGUINDO = 1
      WHERE u.TIPO_USUARIO = 'profissional'
        AND (${whereClauses.join(' OR ')})
      GROUP BY u.ID_USUARIO
      ORDER BY u.NOME_USUARIO ASC
    `;

    valores.unshift(idUsuario || 0); 

    try {
      const [usuarios] = await pool.query(sql, valores);


  if (usuarios.length === 0) return [];

      // Converter foto de perfil para Base64
      usuarios.forEach(u => {
        if (u.FOTO_PERFIL_BANCO_USUARIO) {
          const buffer = Buffer.isBuffer(u.FOTO_PERFIL_BANCO_USUARIO)
            ? u.FOTO_PERFIL_BANCO_USUARIO
            : Buffer.from(u.FOTO_PERFIL_BANCO_USUARIO);
          u.FOTO_PERFIL_BANCO_USUARIO = "data:image/png;base64," + buffer.toString('base64');
        } else {
          u.FOTO_PERFIL_BANCO_USUARIO = null;
        }
      });

      return usuarios;

    } catch (error) {
      console.error("Erro na pesquisa de profissionais:", error);
      return [];
    }
  },




















  pesquisarPropostas: async (palavras) => {
  try {
    if (!palavras || palavras.length === 0) return [];

    const whereClauses = [];
    const valores = [];

    palavras.forEach(p => {
      const likeTerm = `%${p}%`;
      whereClauses.push(
        "REPLACE(LOWER(p.TITULO_PROPOSTA), 'ç', 'c') LIKE ?",
        "REPLACE(LOWER(p.DESCRICAO_PROPOSTA), 'ç', 'c') LIKE ?",
        "REPLACE(LOWER(p.CATEGORIA_PROPOSTA), 'ç', 'c') LIKE ?",
        "REPLACE(LOWER(u.NOME_USUARIO), 'ç', 'c') LIKE ?"
      );
      valores.push(likeTerm, likeTerm, likeTerm, likeTerm);
    });

    const sql = `
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
        u.FOTO_PERFIL_BANCO_USUARIO
      FROM PROPOSTA_PROJETO p
      LEFT JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
      WHERE ${whereClauses.join(' OR ')}
      ORDER BY p.DATA_PROPOSTA DESC
      LIMIT 50
    `;

    const [propostas] = await pool.query(sql, valores);

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

    return propostasComProfissional;

  } catch (error) {
    console.error("Erro ao pesquisar propostas:", error);
    return [];
  }
},

}



module.exports = pesquisasModel;
