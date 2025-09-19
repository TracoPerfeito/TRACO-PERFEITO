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
  u.NOME_USUARIO,
  u.FOTO_PERFIL_BANCO_USUARIO,
  IF(f.ID_PUBLICACAO IS NOT NULL, 'favorito', 'favoritar') AS FAVORITO,
  GROUP_CONCAT(DISTINCT t.NOME_TAG) AS TAGS
FROM (
  SELECT DISTINCT p.ID_PUBLICACAO, p.ID_USUARIO, p.NOME_PUBLICACAO, p.DESCRICAO_PUBLICACAO, p.CATEGORIA
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
}
}


module.exports = pesquisasModel;
