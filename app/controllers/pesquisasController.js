const pesquisasModel = require("../models/pesquisasModel");
const {favoritoModel} = require("../models/favoritoModel");

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

    if (!resultados) resultados = [];

    // Adiciona a contagem de curtidas a cada publicação
    const resultadosComCurtidas = await Promise.all(
      resultados.map(async (pub) => {
        const totalCurtidas = await favoritoModel.countCurtidas(pub.ID_PUBLICACAO);
        return { ...pub, totalCurtidas };
      })
    );

    const descricoesFamosas = {
      "arte digital": "Arte digital envolve a criação de trabalhos visuais utilizando ferramentas digitais e softwares gráficos. Encontre os melhores artistas digitais no Traço Perfeito!",
      "branding": "Branding é o processo de construção e gestão de marcas, incluindo identidade visual e posicionamento. Descubra profissionais de branding prontos para transformar sua marca no Traço Perfeito!",
      "design grafico": "Design gráfico é a prática de criar composições visuais para comunicar mensagens. Veja as melhores publicações de design gráfico no Traço Perfeito!",
      "design gráfico": "Design gráfico é a prática de criar composições visuais para comunicar mensagens. Veja as melhores publicações de design gráfico no Traço Perfeito!",
      "ilustração": "Ilustração é a arte de criar imagens para acompanhar, interpretar ou decorar textos e ideias. Explore os ilustradores mais criativos no Traço Perfeito!",
      // ... resto das descrições
    };

    const descricaoFamosa = descricoesFamosas[termoPesquisa?.toLowerCase()] || null;

    console.log("Resultados da pesquisa com curtidas:", resultadosComCurtidas.map(pub => ({
  ID_PUBLICACAO: pub.ID_PUBLICACAO,
  NOME_PUBLICACAO: pub.NOME_PUBLICACAO,
  NOME_USUARIO: pub.NOME_USUARIO,
  CATEGORIA: pub.CATEGORIA,
  TAGS: pub.TAGS,
  N_CURTIDAS: pub.N_CURTIDAS,
  FAVORITO: pub.FAVORITO,
  qtdImagens: (pub.imagens || []).length,
  qtdImagensUrls: (pub.imagensUrls || []).length,
})));

    // info do usuário logado
    let id_usuario = null;
    let tipo_usuario = null;
    if (req.session?.autenticado) {
      id_usuario = req.session.autenticado.ID_USUARIO || req.session.autenticado.id;
      tipo_usuario = req.session.autenticado.TIPO_USUARIO || req.session.autenticado.tipo;
    }

    res.render('pages/index', {
      publicacoes: resultadosComCurtidas,
      termoPesquisa: termoPesquisa,
      mostrarTextoBusca: "true",
      descricaoFamosa, 
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

    const termoPesquisa = req.query.q || '';
    const descricaoFamosa = null;

    res.render('pages/index', {
      publicacoes: [],
      termoPesquisa: termoPesquisa,
      mostrarTextoBusca: "false",
      autenticado: !!req.session?.autenticado,
      logado: null,
      id_usuario,
      descricaoFamosa, 
      tipo_usuario,
      listaErros: null,
      dadosNotificacao: {
        titulo: "Ocorreu um erro.",
        mensagem: "Não foi possível realizar sua pesquisa. Tente novamente mais tarde.",
        tipo: "error"
      }
    });
  }
},


  filtrarRapido: async (req, res) => {

    console.log("Chegou nos filtros rápidos");

    try{



    } catch (error) {


    }

  }

};

module.exports = pesquisasController;
