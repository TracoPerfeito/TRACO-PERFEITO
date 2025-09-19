const pesquisasModel = require("../models/pesquisasModel");

const pesquisasController = {

  pesquisar: async (req, res) => {
    console.log("Chegou no pesquisar.");
   

    try {
      const stopWords = ['de', 'do', 'da', 'dos', 'das', 'e', 'no', 'na', 'nos', 'nas', 'o', 'a', 'os', 'um', 'uma', 'uns', 'umas'];
      const termoPesquisa = req.query.q || '';

      console.log('Termo de pesquisa recebido:', termoPesquisa);

      // separar palavras e filtrar stop words
      let palavras = termoPesquisa
        .toLowerCase()
        .split(/\s+/)
        .filter(p => !stopWords.includes(p));

      function removerAcentos(texto) {
        return texto.normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/ç/g, 'c');
      }

      // normalizar palavras
      const palavrasNormalizadas = palavras.map(p => removerAcentos(p));
      palavrasNormalizadas.push(removerAcentos(termoPesquisa));

      console.log('Palavras para pesquisa:', palavrasNormalizadas);

      // pegar idUsuario do session
      const idUsuario = req.session?.autenticado?.id || null;

      // chamar método do model
      let resultados = await pesquisasModel.pesquisar(palavrasNormalizadas, idUsuario);


      console.log("Resultados da pesquisa:", resultados.map(res => ({
  ID_PUBLICACAO: res.ID_PUBLICACAO,
  NOME_PUBLICACAO: res.NOME_PUBLICACAO,
  NOME_USUARIO: res.NOME_USUARIO,
  TAGS: res.TAGS,
  FAVORITO: res.FAVORITO,
  qtdImagens: (res.imagens || []).length,
  qtdImagensUrls: (res.imagensUrls || []).length,
})));

     
      if (!resultados) resultados = [];

      // info do usuário logado
      let id_usuario = null;
      let tipo_usuario = null;
      if (req.session?.autenticado) {
        id_usuario = req.session.autenticado.ID_USUARIO || req.session.autenticado.id;
        tipo_usuario = req.session.autenticado.TIPO_USUARIO || req.session.autenticado.tipo;
      }

      res.render('pages/index', {
        publicacoes: resultados,
        autenticado: !!req.session?.autenticado,
        logado: null,
        id_usuario,
        tipo_usuario,
        listaErros: null,
        dadosNotificacao: resultados.length === 0 ? {
          titulo: "Busca sem resultados!",
          mensagem: `Nenhum resultado encontrado para "${termoPesquisa}". Tente outro termo.`,
          tipo: "info"
        } : null
      });

    } catch (error) {
      console.error("Ocorreu um erro na pesquisa:", error);

      let id_usuario = null;
      let tipo_usuario = null;
      if (req.session?.autenticado) {
        id_usuario = req.session.autenticado.ID_USUARIO || req.session.autenticado.id;
        tipo_usuario = req.session.autenticado.TIPO_USUARIO || req.session.autenticado.tipo;
      }

      res.render('pages/index', {
        publicacoes: [],
        autenticado: !!req.session?.autenticado,
        logado: null,
        id_usuario,
        tipo_usuario,
        listaErros: null,
        dadosNotificacao: {
          titulo: "Ocorreu um erro.",
          mensagem: "Não foi possível realizar sua pesquisa. Tente novamente mais tarde.",
          tipo: "error"
        }
      });
    }
  }

};

module.exports = pesquisasController;
