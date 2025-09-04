const listagensModel = require("../models/listagensModel");
const comentariosModel = require("../models/comentariosModel");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
 
 
const listagensController = {
 
 
    listarProfissionais: async (req, res) => {
  try {
    const profissionais = await listagensModel.buscarProfissionaisComEspecializacao();
 
    console.log("Profissionais encontrados:", profissionais);
    res.render('pages/contratar', {
      profissionais
    });
 
  } catch (error) {
    console.error("Erro no controller ao listar profissionais:", error);
    res.status(500).send("Erro interno ao buscar profissionais");
  }
},
 
 
  exibirPerfil: async (req, res) => {
  const id = req.params.id;
  try {
    const usuario = await listagensModel.findIdusuario(id);
    const publicacoes = await listagensModel.listarPublicacoesPorUsuario(id);
 
   
 
 
    if (!usuario) {
      return res.status(404).send('Usuário não encontrado');
    }

    
 
    const especializacao = await listagensModel.findEspecializacaoByUserId(id);
 
    console.log("Dados do perfil sendo exibido:", usuario, especializacao, "Publicações: ", publicacoes);
    res.render('pages/perfil', {
      usuario,
      especializacao,
      publicacoes
    });
  } catch (erro) {
    console.log(erro);
    res.status(500).send('Erro ao carregar perfil');
  }
},
 
 
    listarPublicacoes: async (req, res,  dadosNotificacao) => {
  try {
    const publicacoes = await listagensModel.listarPublicacoes();
 
    console.log("Publicações encontradas:", publicacoes.map(pub => ({
  ID_PUBLICACAO: pub.ID_PUBLICACAO,
  NOME_PUBLICACAO: pub.NOME_PUBLICACAO,
  NOME_USUARIO: pub.NOME_USUARIO,
  TAGS: pub.TAGS,
  qtdImagens: (pub.imagens || []).length,
  qtdImagensUrls: (pub.imagensUrls || []).length,
})));

 
   
    let id_usuario = null;
    let tipo_usuario = null;
    if (req.session && req.session.autenticado) {
      id_usuario = req.session.autenticado.ID_USUARIO || req.session.autenticado.id || req.session.autenticado.ID;
      tipo_usuario = req.session.autenticado.TIPO_USUARIO || req.session.autenticado.tipo;
    }
    res.render('pages/index', {
      publicacoes,
      autenticado: !!req.session.autenticado,
      logado: req.session.logado,
      id_usuario,
      tipo_usuario,
      listaErros: null,
      dadosNotificacao
    });
 
  } catch (error) {
    console.error("Erro no controller ao listar publicações:", error);
    res.status(500).send("Erro interno ao buscar publicações");
     res.render('pages/index', {
      autenticado: !!req.session.autenticado,
      logado: req.session.logado,
      listaErros: ['Erro ao carregar publicações'],
      dadosNotificacao,
      publicacoes: []
    });
  }
},
 
 
  exibirPublicacao: async (req, res) => {
  const id = req.params.id;
  try {
    const publicacao = await listagensModel.findIdPublicacao(id);
 
    if (!publicacao) {
      return res.status(404).send('Publicação não encontrada');
    }
 
    let usuario = null;
const sessao = req.session.autenticado;

    // Se houver sessão ativa e for um objeto
    if (sessao && typeof sessao === 'object') {
      const idUsuario = sessao.ID_USUARIO || sessao.id || sessao.ID;

      if (idUsuario) {
        usuario = await listagensModel.findIdusuario(idUsuario);
      }
    } else if (typeof sessao === 'number' || typeof sessao === 'string') {
      // Se a sessão for diretamente um ID (número ou string)
      usuario = await listagensModel.findIdusuario(sessao);
    }

    
    // Só bloqueia se o usuário estiver autenticado mas não for encontrado no banco
    // Se não encontrar o usuário autenticado, apenas trata como visitante
    // Se não estiver autenticado, apenas mostra a publicação normalmente
 
    const comentarios = await comentariosModel.listarComentarios(id);
 
 console.log("Dados da publicação sendo exibida:", {
  ID_PUBLICACAO: publicacao.ID_PUBLICACAO,
  NOME_PUBLICACAO: publicacao.NOME_PUBLICACAO,
  NOME_USUARIO: publicacao.NOME_USUARIO,
  TAGS: publicacao.TAGS,
  qtdImagens: publicacao.imagens.length,
  qtdImagensUrls: publicacao.imagensUrls.length,
});

    console.log("Comentarios da publicação sendo exibida: ", comentarios)
    console.log("Usuário autenticado passado para a view:", usuario);
    res.render('pages/publicacao', {
      publicacao,
      comentarios,
      listaErros: null,
      usuario: usuario ? {
        id: usuario.ID_USUARIO || usuario.id,
        nome: usuario.NOME_USUARIO || usuario.nome,
        tipo: usuario.TIPO_USUARIO || usuario.tipo
      } : null,
      autenticado: !!usuario,
      id_usuario: usuario ? (usuario.ID_USUARIO || usuario.id) : null,
      tipo_usuario: usuario ? (usuario.TIPO_USUARIO || usuario.tipo) : null,
      dadosNotificacao: req.session.dadosNotificacao || null,
    });
  } catch (erro) {
    console.log(erro);
    res.status(500).send('Erro ao carregar publicação');
  }
},








listarPropostas: async (req, res) => {
  try {
    const propostas = await listagensModel.listarPropostas();

    console.log("Propostas encontradas:", propostas.map(p => ({
      ID_PROPOSTA: p.ID_PROPOSTA,
      TITULO_PROPOSTA: p.TITULO_PROPOSTA,
      NOME_USUARIO: p.NOME_USUARIO,
      PROFISSIONAL_REQUERIDO: p.profissionalRequerido,
      PRAZO_ENTREGA: p.PRAZO_ENTREGA,
      ORCAMENTO: p.ORCAMENTO
    })));

    res.render('pages/oportunidades', {
      propostas,
      autenticado: !!req.session.autenticado,
      logado: req.session.logado,
      listaErros: null,
      dadosNotificacao: null
    });

  } catch (error) {
    console.error("Erro no controller ao listar propostas:", error);
    res.status(500).render('pages/oportunidades', {
      propostas: [],
      autenticado: !!req.session.autenticado,
      logado: req.session.logado,
      listaErros: ['Erro ao carregar propostas'],
      dadosNotificacao:{
          titulo: 'Não foi possível carregar Propostas de Projeto.',
          mensagem: 'Tente novamente mais tarde.',
          tipo: 'error'
      }
    });
  }
},

 

  listarPublicacoesParaColocarNoPortfolio: async (req, res) => {
  
  try {
 
  const publicacoes = await listagensModel.listarPublicacoesUsuarioLogado(req.session.autenticado.id);
 

    
    console.log("Página Novo Portfólio carregada! Publicações: ", publicacoes);
    res.render('pages/novo-portfolio', {
      publicacoes,
      dadosNotificacao: null
    });
  } catch (erro) {
    console.log("Não foi possível listar suas publicações. ", erro);
    res.render('pages/novo-portfolio', {
      publicacoes: [],
      dadosNotificacao:{
          titulo: 'Não foi possível carregar suas publicações.',
          mensagem: 'Tente novamente mais tarde.',
          tipo: 'error'
      }
    });
  }
},
 
 

 
  listarPortfoliosdoUsuario: async (req, res) => {
  const id = req.params.id;
  try {
    const usuario = await listagensModel.findIdusuario(id);
    const portfolios = await listagensModel.listarPortfoliosUsuario(id);

    console.log(portfolios)
    const imgBase = '/imagens/img-portfolio-base.png'; //se n tiver imgs

    const portfoliosComImagens = portfolios.map(p => {
      // converter blobs em base64
      if (p.imagensCapa && p.imagensCapa.length > 0) {
        p.imagensCapa = p.imagensCapa.map(img => 
          `data:image/jpeg;base64,${img.toString('base64')}`
        );
      } else {
        p.imagensCapa = [];
      }

     
      while (p.imagensCapa.length < 4) {
        p.imagensCapa.push(imgBase);
      }

      return p;
    });

    if (!usuario) return res.status(404).send('Usuário não encontrado');

    console.log("Portfólios encontrados: ", portfoliosComImagens.map(port => ({
      ID_PORTFOLIO: port.ID_PORTFOLIO,
      NOME_PORTFOLIO: port.NOME_PORTFOLIO,
      DESCRICAO_PORTFOLIO:  port.DESCRICAO_PORTFOLIO,
      TAGS: port.TAGS_PORTFOLIO,
      qtdImagens: (port.imagensCapa || []).length,
      qtdImagensUrls: (port.imagensCapa || []).length,
    })))
    res.render('pages/portfolios', {
      portfolios: portfoliosComImagens,
      usuario,
      dadosNotificacao: null
    });
  } catch (erro) {
    console.log(erro);
    res.render('pages/portfolios', {
      portfolios: [],
      usuario: [],
      dadosNotificacao: {
        titulo: 'Não foi possível carregar os portfólios.',
        mensagem: 'Tente novamente mais tarde.',
        tipo: 'error'
      }
    });
  }
},








exibirPortfolio: async (req, res) => {
  const id = req.params.id;
  try {
    // 1) Buscar publicações do portfolio
    const publicacoesPortfolio = await listagensModel.listarPublicacoesdoPortfolio(id);

    // 2) Buscar dados do portfolio (nome, descrição, tags, etc.)
    const portfolio = await listagensModel.buscarPortfolioPorId(id);

    if (!publicacoesPortfolio || publicacoesPortfolio.length === 0) {
      return res.render('pages/portfolio', {
        publicacoesPortfolio: [],
        portfolio,
        
        portfolioDono: portfolio ? { ID_USUARIO: portfolio.ID_USUARIO, NOME_USUARIO: portfolio.NOME_USUARIO } : null,
        dadosNotificacao: {
          titulo: 'Portfólio vazio',
          mensagem: 'Nenhuma publicação encontrada neste portfólio.',
          tipo: 'info'
        }
      });
    }

    // 3) Pega o dono do portfolio a partir do portfolio
    const portfolioDono = portfolio ? { ID_USUARIO: portfolio.ID_USUARIO, NOME_USUARIO: portfolio.NOME_USUARIO } : null;

    console.log("Dados do portfólio sendo exibido:", portfolio);
    
console.log(publicacoesPortfolio[0].tagsPortfolio);
    res.render('pages/portfolio', {
      publicacoesPortfolio,
      portfolio,
      portfolioDono,
     
        dadosNotificacao: req.session.dadosNotificacao || null,
    });

  } catch (erro) {
    console.log(erro);
    res.render('pages/portfolio', {
      publicacoesPortfolio: [],
      portfolio: null,
      portfolioDono: null,
     
      dadosNotificacao: {
        titulo: 'Erro ao carregar o portfólio',
        mensagem: 'Tente novamente mais tarde.',
        tipo: 'error'
      }
    });
  }
},

 

// Listar denúncias para o admin
listarDenuncias: async (req, res) => {
  try {
    const denuncias = await require('../models/denunciasModel').listarDenuncias();
    res.render('pages/adm-lista-denuncias', { denuncias });
  } catch (erro) {
    console.error('Erro ao listar denúncias:', erro);
    res.render('pages/adm-lista-denuncias', { denuncias: [], erro: 'Erro ao listar denúncias.' });
  }
},



 
 
 
}
 
 
module.exports = listagensController;