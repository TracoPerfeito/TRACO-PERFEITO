const pesquisasModel = require("../models/pesquisasModel");
const publicacoesModel = require("../models/publicacoesModel");
const {favoritoModel} = require("../models/favoritoModel");
const {seguidoresModel} = require("../models/seguidoresModel");
const listagensModel = require("../models/listagensModel");

const pesquisasController = {

 pesquisar: async (req, res) => {
  console.log("Chegou no pesquisar.");

  try {
    const stopWords = ['de', '@',  'do', 'da', 'dos', 'das', 'e', 'no', 'na', 'nos', 'nas', 'o', 'a', 'os', 'um', 'uma', 'uns', 'umas'];
    const termoPesquisa = req.query.q || '';

    console.log('Termo de pesquisa recebido:', termoPesquisa);

    // separar palavras e filtrar stop words
    let palavras = termoPesquisa
      .toLowerCase()
      .split(/\s+/)
      .map(p => p.startsWith('@') ? p.slice(1) : p)
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

  const resultadosComContagem = await Promise.all(
      resultados.map(async (pub) => {
        const N_CURTIDAS = await favoritoModel.countCurtidas(pub.ID_PUBLICACAO);
        const N_COMENTARIOS = await publicacoesModel.contarNumComentarios(pub.ID_PUBLICACAO);
        const N_VISUALIZACOES = await publicacoesModel.contarNumVisualizacoes(pub.ID_PUBLICACAO);

        return { 
          ...pub, 
          N_CURTIDAS, 
          N_COMENTARIOS, 
          N_VISUALIZACOES 
        };
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

    console.log("Resultados da pesquisa com curtidas:", resultadosComContagem.map(pub => ({
  ID_PUBLICACAO: pub.ID_PUBLICACAO,
  NOME_PUBLICACAO: pub.NOME_PUBLICACAO,
  NOME_USUARIO: pub.NOME_USUARIO,
  CATEGORIA: pub.CATEGORIA,
  
 N_CURTIDAS: pub.N_CURTIDAS,
      N_COMENTARIOS: pub.N_COMENTARIOS,
      N_VISUALIZACOES: pub.N_VISUALIZACOES,
      FAVORITO: pub.FAVORITO,    
      DATA_PUBLICACAO: pub.DATA_PUBLICACAO,
      DESCRICAO_PUBLICACAO: pub.DESCRICAO_PUBLICACAO,
  qtdImagens: (pub.imagens || []).length,
  qtdImagensUrls: (pub.imagensUrls || []).length,
})));


    let id_usuario = null;
    let tipo_usuario = null;
    if (req.session?.autenticado) {
      id_usuario = req.session.autenticado.ID_USUARIO || req.session.autenticado.id;
      tipo_usuario = req.session.autenticado.TIPO_USUARIO || req.session.autenticado.tipo;
    }

    res.render('pages/index', {
      publicacoes: resultadosComContagem,
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

pesquisarProfissionais: async (req, res) => {
  console.log("Chegou no pesquisarProfissionais.");

  try {
    const stopWords = ['de', '@', 'do', 'da', 'dos', 'das', 'e', 'no', 'na', 'nos', 'nas', 'o', 'a', 'os', 'um', 'uma', 'uns', 'umas'];
    const termoPesquisa = req.query.q || '';

    console.log('Termo de pesquisa recebido:', termoPesquisa);

    // separar palavras e filtrar stop words
    let palavras = termoPesquisa
      .toLowerCase()
      .split(/\s+/)
      .map(p => p.startsWith('@') ? p.slice(1) : p)
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
    const idUsuarioLogado = req.session?.autenticado?.id || null;

    // chamar método do model
    let resultados = await pesquisasModel.pesquisarPorProfissionais(palavrasNormalizadas, idUsuarioLogado);

    if (!resultados) resultados = [];

    // adicionar contagem de seguidores e publicações
    const resultadosComContagem = await Promise.all(
      resultados.map(async (prof) => {
        const QUANT_SEGUIDORES = await listagensModel.contarSeguidores(prof.ID_USUARIO);
        const QUANT_PUBLICACOES = await listagensModel.contarPublicacoes(prof.ID_USUARIO);
        return { 
          ...prof, 
          QUANT_SEGUIDORES,
          QUANT_PUBLICACOES,
          SEGUIDO: prof.SEGUIDO
        };
      })
    );

    console.log("Profissionais encontrados com contagem:", resultadosComContagem.map(p => ({
      ID_USUARIO: p.ID_USUARIO,
      NOME_USUARIO: p.NOME_USUARIO,
      DATA_CADASTRO: p.DATA_CADASTRO,
      ESPECIALIZACAO_DESIGNER: p.ESPECIALIZACAO_DESIGNER,
      QUANT_SEGUIDORES: p.QUANT_SEGUIDORES,
      QUANT_PUBLICACOES: p.QUANT_PUBLICACOES,
      SEGUIDO: p.SEGUIDO
    })));

    res.render('pages/contratar', {
      profissionais: resultadosComContagem,
      termoPesquisa: termoPesquisa,
      mostrarTextoBusca: "true",
      descricaoFamosa: null,
      autenticado: !!req.session?.autenticado
    });

  } catch (error) {
    console.error("Ocorreu um erro na pesquisa de profissionais:", error);

    res.render('pages/contratar', {
      profissionais: [],
      termoPesquisa: req.query.q || '',
      mostrarTextoBusca: "false",
      descricaoFamosa: null,
      autenticado: !!req.session?.autenticado,
      dadosNotificacao: {
        titulo: "Ocorreu um erro.",
        mensagem: "Não foi possível realizar sua pesquisa. Tente novamente mais tarde.",
        tipo: "error"
      }
    });
  }
},






pesquisarPropostas: async (req, res) => {
  console.log("Chegou no pesquisarPropostas.");

  try {
    const stopWords = ['de', '@', 'do', 'da', 'dos', 'das', 'e', 'no', 'na', 'nos', 'nas', 'o', 'a', 'os', 'um', 'uma', 'uns', 'umas'];
    const termoPesquisa = req.query.q || '';

    console.log("Termo de pesquisa recebido:", termoPesquisa);

    // separar palavras e filtrar stop words
    let palavras = termoPesquisa
      .toLowerCase()
      .split(/\s+/)
      .map(p => p.startsWith('@') ? p.slice(1) : p)
      .filter(p => !stopWords.includes(p));

    function removerAcentos(texto) {
      return texto.normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/ç/g, 'c');
    }

    const palavrasNormalizadas = palavras.map(p => removerAcentos(p));
    palavrasNormalizadas.push(removerAcentos(termoPesquisa));

    console.log("Palavras normalizadas para pesquisa:", palavrasNormalizadas);

    // chamar model
    let resultados = await pesquisasModel.pesquisarPropostas(palavrasNormalizadas);

    if (!resultados) resultados = [];

    console.log("Resultados obtidos:", resultados.map(p => ({
      ID_PROPOSTA: p.ID_PROPOSTA,
      TITULO_PROPOSTA: p.TITULO_PROPOSTA,
      NOME_USUARIO: p.NOME_USUARIO,
      PROFISSIONAL_REQUERIDO: p.profissionalRequerido,
      PRAZO_ENTREGA: p.PRAZO_ENTREGA,
      ORCAMENTO: p.ORCAMENTO
    })));

    res.render('pages/oportunidades', {
      propostas: resultados,
      termoPesquisa,
      autenticado: !!req.session.autenticado,
      logado: req.session.logado,
      listaErros: null,
      dadosNotificacao: resultados.length === 0 ? {
        titulo: "Busca sem resultados!",
        mensagem: `Nenhuma proposta encontrada para "${termoPesquisa}". Tente outro termo.`,
        tipo: "info"
      } : null
    });

  } catch (error) {
    console.error("Erro ao pesquisar propostas:", error);

    res.status(500).render('pages/oportunidades', {
      propostas: [],
      termoPesquisa: req.query.q || '',
      autenticado: !!req.session.autenticado,
      logado: req.session.logado,
      listaErros: ['Erro ao pesquisar propostas'],
      dadosNotificacao:{
          titulo: 'Não foi possível realizar a pesquisa.',
          mensagem: 'Tente novamente mais tarde.',
          tipo: 'error'
      }
    });
  }
},



};

module.exports = pesquisasController;
