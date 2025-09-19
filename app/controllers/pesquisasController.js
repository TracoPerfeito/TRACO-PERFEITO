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


    const descricoesFamosas = {
  "arte digital": "Arte digital envolve a criação de trabalhos visuais utilizando ferramentas digitais e softwares gráficos. Encontre os melhores artistas digitais no Traço Perfeito!",
  "branding": "Branding é o processo de construção e gestão de marcas, incluindo identidade visual e posicionamento. Descubra profissionais de branding prontos para transformar sua marca no Traço Perfeito!",
  "design grafico": "Design gráfico é a prática de criar composições visuais para comunicar mensagens. Veja as melhores publicações de design gráfico no Traço Perfeito!",
  "design gráfico": "Design gráfico é a prática de criar composições visuais para comunicar mensagens. Veja as melhores publicações de design gráfico no Traço Perfeito!",

  "ilustração": "Ilustração é a arte de criar imagens para acompanhar, interpretar ou decorar textos e ideias. Explore os ilustradores mais criativos no Traço Perfeito!",
  "design de personagens": "Design de personagens é a criação visual de figuras únicas para jogos, animações e histórias. Conheça quem dá vida a personagens incríveis no Traço Perfeito!",

  // novos que você pediu
  "modelagem 3d": "Modelagem 3D é a criação de formas tridimensionais para jogos, filmes e produtos digitais. Descubra artistas de modelagem 3D no Traço Perfeito!",
  "logotipos": "Logotipos são símbolos visuais que representam a identidade de uma marca. Veja criações marcantes de logotipos no Traço Perfeito!",
  "ui ux": "UI/UX Design foca na experiência do usuário e na interface visual de sites e aplicativos. Encontre projetos de UI/UX inovadores no Traço Perfeito!",
  "arte para jogos digitais": "Arte para jogos digitais combina criatividade e técnica para criar mundos e personagens interativos. Explore artes para games no Traço Perfeito!",
  "arte conceitual": "Arte conceitual traduz ideias em imagens, dando forma visual a universos, cenários e personagens. Conheça artistas de arte conceitual no Traço Perfeito!",
  "storyboard": "Storyboard é a sequência de quadros ilustrados que planejam narrativas visuais em filmes e animações. Descubra storyboards incríveis no Traço Perfeito!",
  "design para moda": "Design para moda une arte, estilo e conceito na criação de roupas e estampas. Veja tendências e inovações em design de moda no Traço Perfeito!",
  "design de embalagens": "O design de embalagens cria soluções criativas e funcionais para proteger e valorizar produtos. Explore embalagens criativas no Traço Perfeito!",
  "animação 2d": "Animação 2D dá movimento a personagens e histórias em duas dimensões. Inspire-se em animações 2D no Traço Perfeito!",
  "pixel art": "Pixel art é a arte digital feita pixel por pixel, muito usada em jogos retrô. Descubra artistas de pixel art no Traço Perfeito!",
  "cartoon": "Cartoon é o estilo artístico marcado por traços expressivos, humor e personagens caricatos. Explore cartoons originais no Traço Perfeito!",
  "design publicitário": "Design publicitário cria campanhas visuais para promover produtos e serviços. Veja os melhores trabalhos de publicidade no Traço Perfeito!",
  "publicidade": "Publicidade utiliza o design como ferramenta para comunicação e persuasão. Descubra campanhas criativas no Traço Perfeito!",

  // extras que já tínhamos alinhado
  "minimalismo": "O design minimalista valoriza a simplicidade, utilizando poucos elementos para transmitir ideias de forma clara e elegante. Descubra projetos minimalistas no Traço Perfeito!",
  "preto e branco": "O design em preto e branco explora contrastes intensos e atemporais. Veja as melhores criações em preto e branco no Traço Perfeito!",
  "colorido": "Design colorido aposta em paletas vibrantes e expressivas para transmitir energia e impacto. Inspire-se em trabalhos coloridos no Traço Perfeito!",
  "maximalista": "O maximalismo celebra o excesso de detalhes, cores e texturas, criando experiências visuais marcantes. Explore o melhor do design maximalista no Traço Perfeito!",
  "vintage": "O estilo vintage resgata elementos de épocas passadas, trazendo nostalgia e autenticidade ao design. Veja os melhores trabalhos vintage no Traço Perfeito!",

  // áreas específicas
  "design editorial": "O design editorial organiza textos e imagens em livros, revistas e publicações digitais. Aqui você encontra o melhor do design editorial no Traço Perfeito!",
  "design de games": "Design de games une arte e interatividade para criar universos imersivos. Veja as melhores publicações de design de games no Traço Perfeito!",
  "motion design": "Motion design aplica animação ao design gráfico para criar experiências dinâmicas. Descubra os principais trabalhos de motion design no Traço Perfeito!",
  "tipografia": "Tipografia é a arte de organizar letras e fontes para comunicar estilo e identidade. Explore projetos de tipografia únicos no Traço Perfeito!",
  "design de produto": "Design de produto une estética e funcionalidade na criação de objetos físicos e digitais. Veja inovações em design de produto no Traço Perfeito!"
};


  const descricaoFamosa = descricoesFamosas[termoPesquisa?.toLowerCase()] || null;

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
  }

};

module.exports = pesquisasController;
