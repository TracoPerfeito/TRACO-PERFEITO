const listagensModel = require("../models/listagensModel");
const publicacoesModel = require("../models/publicacoesModel");
const contratacaoModel = require("../models/contratacaoModel");
const comentariosModel = require("../models/comentariosModel");
const { body, validationResult } = require("express-validator");
const {favoritoModel} = require("../models/favoritoModel");
const moment = require("moment");
 
 
const listagensController = {
 
 
//     listarProfissionais: async (req, res) => {
//   try {
//     const profissionais = await listagensModel.buscarProfissionaisComEspecializacao();


//      const profissionaisComContagem = await Promise.all(
//       profissionais.map(async (prof) => {
      
//         const QUANT_SEGUIDORES = await listagensModel.contarSeguidores(prof.ID_USUARIO);
//         const QUANT_PUBLICACOES = await listagensModel.contarPublicacoes(prof.ID_USUARIO);

//         return { 
//           ...prof, 
//           QUANT_SEGUIDORES,
//           QUANT_PUBLICACOES
//         };
//       })
//     );


//  console.log("Profissionais encontrados:", profissionaisComContagem.map(p => ({
//   ID_USUARIO: p.ID_USUARIO,
//   NOME_USUARIO: p.NOME_USUARIO,
//   FOTO_PERFIL: p.FOTO_PERFIL_BANCO_USUARIO ? 'sim' : 'não',
//   IMG_BANNER: p.IMG_BANNER_BANCO_USUARIO ? 'sim' : 'não',
//   DESCRICAO_PERFIL_USUARIO: p.DESCRICAO_PERFIL_USUARIO,
//   DATA_CADASTRO: p.DATA_CADASTRO,
//   ESPECIALIZACAO_DESIGNER: p.ESPECIALIZACAO_DESIGNER,
//   QUANT_SEGUIDORES: p.QUANT_SEGUIDORES,
//   QUANT_PUBLICACOES: p.QUANT_PUBLICACOES
// })));

//     res.render('pages/contratar', {
//       profissionais: profissionaisComContagem,
//       termoPesquisa: null,
//       mostrarTextoBusca: "false",
//       descricaoFamosa: null,
//     });
 
//   } catch (error) {
//     console.error("Erro no controller ao listar profissionais:", error);
//     res.status(500).render('pages/erro-conexao', {
//   mensagem: "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
// });
//   }
// },



listarProfissionais: async (req, res) => {
  try {
    const profissionais = await listagensModel.buscarProfissionaisComContagem(req.session.autenticado?.id);

   console.log("Profissionais encontrados:", profissionais.map(p => ({
  ID_USUARIO: p.ID_USUARIO,
  NOME_USUARIO: p.NOME_USUARIO,
  FOTO_PERFIL: p.FOTO_PERFIL_BANCO_USUARIO ? 'sim' : 'não',
  IMG_BANNER: p.IMG_BANNER_BANCO_USUARIO ? 'sim' : 'não',
  DESCRICAO_PERFIL_USUARIO: p.DESCRICAO_PERFIL_USUARIO,
  DATA_CADASTRO: p.DATA_CADASTRO,
  ESPECIALIZACAO_DESIGNER: p.ESPECIALIZACAO_DESIGNER,
  QUANT_SEGUIDORES: p.QUANT_SEGUIDORES,
  QUANT_PUBLICACOES: p.QUANT_PUBLICACOES,
  MEDIA_NOTA: p.MEDIA_NOTA,
  QTD_AVALIACOES: p.QTD_AVALIACOES,
  CONTRATOS_FINALIZADOS: p.CONTRATOS_FINALIZADOS,
  SEGUIDO: p.SEGUIDO,
  IS_PRO: p.isPro,
  MEDIA_PRECO: p.MEDIA_PRECO
})));




    res.render('pages/contratar', {
      profissionais,
      termoPesquisa: null,
      mostrarTextoBusca: "false",
      descricaoFamosa: null,
    });

  } catch (error) {
    console.error("Erro no controller ao listar profissionais:", error);
    res.status(500).render('pages/erro-conexao', {
      mensagem: "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
    });
  }
},



procurarFoto: async (req, res) => {
  const id = req.params.id;
  try {
    const usuario = await listagensModel.findIdusuario(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json({
     id: usuario.ID_USUARIO,
      nome: usuario.NOME_USUARIO,
      username: usuario.USER_USUARIO,
        tipo: usuario.TIPO_USUARIO,    
      foto: usuario.FOTO_PERFIL_BANCO_USUARIO || '/imagens/foto-perfil.png'
    });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ error: "Não foi possível acessar o banco" });
  }
},

 
 
//   exibirPerfil: async (req, res) => {
//   const id = req.params.id;
//   try {
//     const idLogado = req.session.autenticado?.id || null;
//     const usuario = await listagensModel.findIdusuario(id, idLogado);



//     const publicacoes = await listagensModel.listarPublicacoesPorUsuario(id, req.session.autenticado.id);

//     const publicacoesComContagem = await Promise.all(
//       publicacoes.map(async (pub) => {
//         const N_CURTIDAS = await favoritoModel.countCurtidas(pub.ID_PUBLICACAO);
//         const N_COMENTARIOS = await publicacoesModel.contarNumComentarios(pub.ID_PUBLICACAO);
//         const N_VISUALIZACOES = await publicacoesModel.contarNumVisualizacoes(pub.ID_PUBLICACAO);
 
//         return { 
//           ...pub, 
//           N_CURTIDAS, 
//           N_COMENTARIOS, 
//           N_VISUALIZACOES 
//         };
//       })
//     );

//     const qntPortfolios = await listagensModel.contarPortfoliosUsuario(id);
//     const qntSeguidores = await listagensModel.contarSeguidores(id);
 
   
 
 
//     if (!usuario) {
//       return res.status(404).send('Usuário não encontrado');
//     }

    
 
//     const especializacao = await listagensModel.findEspecializacaoByUserId(id);
//  console.log("Dados do perfil sendo exibido:", {
//   ID_USUARIO: usuario.ID_USUARIO,
//   NOME_USUARIO: usuario.NOME_USUARIO,
//   EMAIL_USUARIO: usuario.EMAIL_USUARIO,
//   CELULAR_USUARIO: usuario.CELULAR_USUARIO,
//   SENHA_USUARIO: usuario.SENHA_USUARIO,
//   CPF_USUARIO: usuario.CPF_USUARIO,
//   DATA_NASC_USUARIO: usuario.DATA_NASC_USUARIO,
//   GENERO_USUARIO: usuario.GENERO_USUARIO,
//   FOTO_PERFIL_BANCO_USUARIO: usuario.FOTO_PERFIL_BANCO_USUARIO ? 'sim' : 'não',
//   IMG_BANNER_BANCO_USUARIO: usuario.IMG_BANNER_BANCO_USUARIO ? 'sim' : 'não',
//   TIPO_USUARIO: usuario.TIPO_USUARIO,
//   STATUS_USUARIO: usuario.STATUS_USUARIO,
//   USER_USUARIO: usuario.USER_USUARIO,
//   DESCRICAO_PERFIL_USUARIO: usuario.DESCRICAO_PERFIL_USUARIO,
//   LINKEDIN_USUARIO: usuario.LINKEDIN_USUARIO,
//   PINTEREST_USUARIO: usuario.PINTEREST_USUARIO,
//   INSTAGRAM_USUARIO: usuario.INSTAGRAM_USUARIO,
//   WHATSAPP_USUARIO: usuario.WHATSAPP_USUARIO,
//    SEGUINDO: Number(usuario.SEGUIDO),
//   Publicacoes: publicacoes
// }, "Especialização:", especializacao, "Quantidade de portfólios:", qntPortfolios, "Quantidade de seguidores:", qntSeguidores);

//     res.render('pages/perfil', {
//       usuario,
//       especializacao,
//       publicacoes: publicacoesComContagem,
//       qntPortfolios,
//       qntSeguidores
//     });
//   } catch (erro) {
//     console.log(erro);
//     res.status(500).render('pages/erro-conexao', {
//       mensagem: "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
//     });
//   }
// },
 


// exibirPerfil: async (req, res, dadosNotificacao) => {
//   const id = req.params.id;
//   const idContratacao = req.query.idContratacao || null; 

//   try {
//     const idLogado = req.session.autenticado?.id || null;
//     const usuario = await listagensModel.findIdusuario(id, idLogado);

//     if (!usuario) {
//       return res.status(404).send('Usuário não encontrado');
//     }

//     // lógica de avaliação
//     let podeAvaliar = false;
//     if (idContratacao) {
//       const contratacao = await contratacaoModel.findId(idContratacao);
//       if (
//         contratacao &&
//         contratacao.ID_CLIENTE === idLogado &&
//         contratacao.ID_PROFISSIONAL === Number(id) &&
//         contratacao.STATUS === "FINALIZADA" &&
//         !contratacao.AVALIACAO_NOTA // ou outro campo que indique se já avaliou
//       ) {
//         podeAvaliar = true;
//       }
//     }

//     const publicacoes = await listagensModel.listarPublicacoesPorUsuario(id, idLogado);

//     const publicacoesComContagem = await Promise.all(
//       publicacoes.map(async (pub) => {
//         const N_CURTIDAS = await favoritoModel.countCurtidas(pub.ID_PUBLICACAO);
//         const N_COMENTARIOS = await publicacoesModel.contarNumComentarios(pub.ID_PUBLICACAO);
//         const N_VISUALIZACOES = await publicacoesModel.contarNumVisualizacoes(pub.ID_PUBLICACAO);
//         return { ...pub, N_CURTIDAS, N_COMENTARIOS, N_VISUALIZACOES };
//       })
//     );

//     const qntPortfolios = await listagensModel.contarPortfoliosUsuario(id);
//     const qntSeguidores = await listagensModel.contarSeguidores(id);

//     const especializacao = await listagensModel.findEspecializacaoByUserId(id);

//     console.log(dadosNotificacao);
//     res.render('pages/perfil', {
//       usuario,
//       especializacao,
//       publicacoes: publicacoesComContagem,
//       qntPortfolios,
//       qntSeguidores,
//       podeAvaliar,     
//       idContratacao,
//       dadosNotificacao   
//     });

//   } catch (erro) {
//     console.log(erro);
//     res.status(500).render('pages/erro-conexao', {
//       mensagem: "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
//     });
//   }
// },


exibirPerfil: async (req, res, dadosNotificacao) => {
  const id = req.params.id;
  const idContratacao = req.query.idContratacao || null;

  try {
    const idLogado = req.session.autenticado?.id || null;

    // busca usuário e dados agregados em uma query só
    const usuario = await listagensModel.findIdusuario(id, idLogado);

    if (!usuario) {
      return res.status(404).send('Usuário não encontrado');
    }


    const usuarioLog = { ...usuario };

usuarioLog.FOTO_PERFIL_BANCO_USUARIO = usuarioLog.FOTO_PERFIL_BANCO_USUARIO ? '(tem)' : '(não tem)';
usuarioLog.IMG_BANNER_BANCO_USUARIO = usuarioLog.IMG_BANNER_BANCO_USUARIO ? '(tem)' : '(não tem)';

console.log("Dados do perfil sendo exibido: ", usuarioLog);





    let podeAvaliar = false;
    if (idContratacao) {
      const contratacao = await contratacaoModel.findId(idContratacao);
      if (
        contratacao &&
        contratacao.ID_CLIENTE === idLogado &&
        contratacao.ID_PROFISSIONAL === Number(id) &&
        contratacao.STATUS === "FINALIZADA" &&
        !contratacao.AVALIACAO_NOTA
      ) {
        podeAvaliar = true;
      }
    }

    const avaliacoes = await listagensModel.listarAvaliacoes(id);
   
    console.log("Avaliações do usuário:");
      avaliacoes.forEach(av => {
        console.log({
          ID_AVALIACAO: av.ID_AVALIACAO,
          ID_PROFISSIONAL: av.ID_PROFISSIONAL,
          ID_AVALIADOR: av.ID_AVALIADOR,
          COMENTARIO: av.COMENTARIO,
          NOTA: av.NOTA,
          DATA_CRIACAO: av.DATA_CRIACAO,
          NOME_AVALIADOR: av.NOME_AVALIADOR,
          FOTO_AVALIADOR: av.FOTO_AVALIADOR ? "(tem)" : "(não tem)"
        });
      });

    // publicações do usuário (mantemos como estava)
    const publicacoes = await listagensModel.listarPublicacoesPorUsuario(id, idLogado);
    const publicacoesComContagem = await Promise.all(
      publicacoes.map(async (pub) => {
        const N_CURTIDAS = await favoritoModel.countCurtidas(pub.ID_PUBLICACAO);
        const N_COMENTARIOS = await publicacoesModel.contarNumComentarios(pub.ID_PUBLICACAO);
        const N_VISUALIZACOES = await publicacoesModel.contarNumVisualizacoes(pub.ID_PUBLICACAO);
        return { ...pub, N_CURTIDAS, N_COMENTARIOS, N_VISUALIZACOES };
      })
    );

    // renderiza passando o usuário já turbinado
    res.render('pages/perfil', {
      usuario,
      publicacoes: publicacoesComContagem,
      avaliacoes,
      podeAvaliar,
      idContratacao,
      dadosNotificacao
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).render('pages/erro-conexao', {
      mensagem: "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
    });
  }
},

listarPublicacoes: async (req, res, dadosNotificacao) => {
  try {
    const publicacoes = await listagensModel.listarPublicacoes(req.session.autenticado.id);

    const publicacoesComContagem = await Promise.all(
      publicacoes.map(async (pub) => {
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

    console.log("Publicações encontradas:", publicacoesComContagem.map(pub => ({
      ID_PUBLICACAO: pub.ID_PUBLICACAO,
      NOME_PUBLICACAO: pub.NOME_PUBLICACAO,
      NOME_USUARIO: pub.NOME_USUARIO,
      CATEGORIA: pub.CATEGORIA,
      TAGS: pub.TAGS,
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
    if (req.session && req.session.autenticado) {
      id_usuario = req.session.autenticado.ID_USUARIO || req.session.autenticado.id || req.session.autenticado.ID;
      tipo_usuario = req.session.autenticado.TIPO_USUARIO || req.session.autenticado.tipo;
    }

    res.render('pages/index', {
      publicacoes: publicacoesComContagem, // envia as publicações já com a contagem
      termoPesquisa: null,
      mostrarTextoBusca: "false",
      descricaoFamosa: null,
      autenticado: !!req.session.autenticado,
      logado: req.session.logado,
      id_usuario,
      tipo_usuario,
      listaErros: null,
      dadosNotificacao
    });

  } catch (error) {
    console.error("Erro no controller ao listar publicações:", error);
    res.status(500).render('pages/index', {
      autenticado: !!req.session.autenticado,
      termoPesquisa: null,
      mostrarTextoBusca: "false",
      descricaoFamosa: null,
      logado: req.session.logado,
      listaErros: ['Erro ao carregar publicações'],
      dadosNotificacao,
      publicacoes: []
    });
  }
},

 
exibirPublicacao: async (req, res, dadosNotificacao) => {
  const id = req.params.id;

  try {
    // Busca a publicação
    const publicacao = await listagensModel.findIdPublicacao(id, req.session.autenticado?.id);
    const N_VISUALIZACOES = await publicacoesModel.contarNumVisualizacoes(id);
    const N_CURTIDAS = await favoritoModel.countCurtidas(id);

    if (!publicacao) {
      console.log("Publicação não encontrada para o ID:", id);

      req.session.dadosNotificacao = {
        titulo: "Publicação não encontrada",
        mensagem: "A publicação que você tentou acessar não existe.",
        tipo: "error"
      };

      return res.redirect("/");
    }

    // Recupera usuário logado sem redefinir a sessão
    let usuario = null;
    const sessao = req.session.autenticado;

    if (sessao && typeof sessao === "object") {
      const idUsuario = sessao.ID_USUARIO || sessao.id || sessao.ID;
      if (idUsuario) usuario = await listagensModel.findIdusuario(idUsuario);
    } else if (typeof sessao === "number" || typeof sessao === "string") {
      usuario = await listagensModel.findIdusuario(sessao);
    }

    // Controle de visitas para contabilizar visualizações
    if (!req.session.visitas) req.session.visitas = {};
    const ultimaVisita = req.session.visitas[publicacao.ID_PUBLICACAO];
    const agora = new Date();
    const intervaloMinutos = 30; // tempo limite entre visualizações

    if (!ultimaVisita || (agora - new Date(ultimaVisita)) > intervaloMinutos * 60 * 1000) {
      const idUsuario = usuario ? (usuario.ID_USUARIO || usuario.id) : null;
      await publicacoesModel.registrarVisualizacao(publicacao.ID_PUBLICACAO, idUsuario, null);
      req.session.visitas[publicacao.ID_PUBLICACAO] = agora;
    }

    const comentarios = await comentariosModel.listarComentarios(id);

    // Renderiza a página sem alterar req.session.autenticado
    res.render("pages/publicacao", {
      publicacao,
      comentarios,
      N_VISUALIZACOES,
      N_CURTIDAS,
      listaErros: null,
      dadosNotificacao,
    });
  } catch (erro) {
    console.log(erro);
    res.status(500).render("pages/erro-conexao", {
      mensagem: "Não foi possível acessar o banco de dados. Tente novamente mais tarde.",
    });
  }
},







listarPropostas: async  (req, res, dadosNotificacao) => {
  try {
    const propostas = await listagensModel.listarPropostas();

    console.log(propostas)

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
       termoPesquisa: null,
      mostrarTextoBusca: "false",
      descricaoFamosa: null,
      autenticado: !!req.session.autenticado,
      logado: req.session.logado,
      listaErros: null,
      dadosNotificacao
        ,
        id_usuario: req.session.autenticado ? (req.session.autenticado.ID_USUARIO || req.session.autenticado.id || req.session.autenticado.ID) : null
        ,
        tipo_usuario: req.session.autenticado ? (req.session.autenticado.TIPO_USUARIO || req.session.autenticado.tipo) : null
    });

  } catch (error) {
    console.error("Erro no controller ao listar propostas:", error);
    res.status(500).render('pages/oportunidades', {
      propostas: [],
       termoPesquisa: null,
      mostrarTextoBusca: "false",
      descricaoFamosa: null,
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




 
 
  exibirProposta: async (req, res) => {
  const id = req.params.id;
  try {
    const proposta = await listagensModel.findIdProposta(id, req.session.autenticado.id);


     if (!proposta) {
      // Se não existir a proposta
     console.log("Proposta não encontrada para o ID:", id);

      req.session.dadosNotificacao = {
         titulo: "Proposta não encontrada",
          mensagem: "A proposta que você tentou acessar não existe.",
          tipo: "error" 
        
        };
  
         return res.redirect("/oportunidades"); 
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
    console.log("Dados da proposta sendo exibida:", {
      ID_PROPOSTA: proposta.ID_PROPOSTA,
      NOME_PROPOSTA: proposta.TITULO_PROPOSTA,
      NOME_USUARIO: proposta.NOME_USUARIO,
      PROFISSIONAL_REQUERIDO: proposta.profissionalRequerido,
      PRAZO_ENTREGA: proposta.PRAZO_ENTREGA,
      PRAZO_RESTANTE: proposta.prazoRestante, 
      ORCAMENTO: proposta.ORCAMENTO,
      DATA_PROPOSTA: proposta.DATA_PROPOSTA,
      DESCRICAO_PROPOSTA: proposta.DESCRICAO_PROPOSTA,
      CATEGORIA_PROPOSTA: proposta.CATEGORIA_PROPOSTA,
      PREFERENCIA_PROPOSTA: proposta.PREFERENCIA_PROPOSTA,
      STATUS_PROPOSTA: proposta.STATUS_PROPOSTA
    });
    

 

  
    
    const dadosNotificacao = req.session.dadosNotificacao || null;
    req.session.dadosNotificacao = null;

    console.log("Dados de notificação:", dadosNotificacao);
    res.render('pages/propostadeprojeto', {
      proposta,
      usuario: usuario ? {
        id: usuario.ID_USUARIO || usuario.id,
        nome: usuario.NOME_USUARIO || usuario.nome,
        tipo: usuario.TIPO_USUARIO || usuario.tipo
      } : null,
      autenticado: !!usuario,
      id_usuario: usuario ? (usuario.ID_USUARIO || usuario.id) : null,
      tipo_usuario: usuario ? (usuario.TIPO_USUARIO || usuario.tipo) : null,
      dadosNotificacao
    });
  } catch (erro) {
    console.log(erro);
   

     req.session.dadosNotificacao = {
         titulo: "Ocorreu um erro",
          mensagem: "Não foi possível acessar a proposta de projeto. Tente novamente mais tarde.",
          tipo: "error" 
        
        };
  
         return res.redirect("/oportunidades"); 
  }
},






 

  listarPublicacoesParaColocarNoPortfolio: async (req, res, dadosNotificacao) => {
  
  try {
 
  const publicacoes = await listagensModel.listarPublicacoesUsuarioLogado(req.session.autenticado.id);
 

    
    console.log("Página Novo Portfólio carregada! Publicações: ", publicacoes);
    res.render('pages/novo-portfolio', {
      publicacoes,
      dadosNotificacao
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

console.log("ID do portfólio:", id);

  try {
    // 1) Buscar dados do portfolio (nome, descrição, tags, etc.)
    const portfolio = await listagensModel.buscarPortfolioPorId(id);
    console.log("Dados do portfólio buscado:", portfolio); //ok


    if (!portfolio) {
      // Se não existir o port
     console.log("Portfólio não encontrado para o ID:", id);

      req.session.dadosNotificacao = {
         titulo: "Portfólio não encontrado",
          mensagem: "O portfólio que você tentou acessar não existe.",
          tipo: "error" 
        
        };
  
         return res.redirect("/"); 
    }


    // 2) Buscar publicações do portfolio
    const publicacoesPortfolio = await listagensModel.listarPublicacoesdoPortfolio(id, req.session.autenticado.id);

    // console.log("Publicações do portfólio encontradas:", publicacoesPortfolio);

    // 3) Pega o dono do portfolio a partir do portfolio
    const portfolioDono = portfolio
      ? { ID_USUARIO: portfolio.ID_USUARIO, NOME_USUARIO: portfolio.NOME_USUARIO }
      : null;

      // Quando carregar a página do portfolio
req.session.currentPortfolioId = id;

    // 4) Se não tem publicações, ainda renderiza as tags do portfólio
    if (!publicacoesPortfolio || publicacoesPortfolio.length === 0) {
      return res.render("pages/portfolio", {
        publicacoesPortfolio: [],
        portfolio,
        portfolioDono,
        dadosNotificacao: {
          titulo: "Portfólio vazio",
          mensagem: "Nenhuma publicação encontrada neste portfólio.",
          tipo: "info",
        },
      });
    }

    // 5) Caso tenha publicações
    console.log("Dados do portfólio sendo exibido:", portfolio);
    res.render("pages/portfolio", {
      publicacoesPortfolio,
      portfolio,
      portfolioDono,
      dadosNotificacao: req.session.dadosNotificacao || null,
    });

  } catch (erro) {
    console.log(erro);
    res.render("pages/portfolio", {
      publicacoesPortfolio: [],
      portfolio: null,
      portfolioDono: null,
      dadosNotificacao: {
        titulo: "Erro ao carregar o portfólio",
        mensagem: "Tente novamente mais tarde.",
        tipo: "error",
      },
    });
  }
},






// exibirPortfolio: async (req, res) => {
//   const id = req.params.id;
//   try {
//     // 1) Buscar publicações do portfolio
//     const publicacoesPortfolio = await listagensModel.listarPublicacoesdoPortfolio(id);

//     // 2) Buscar dados do portfolio (nome, descrição, tags, etc.)
//     const portfolio = await listagensModel.buscarPortfolioPorId(id);

//     if (!publicacoesPortfolio || publicacoesPortfolio.length === 0) {
//       return res.render('pages/portfolio', {
//         publicacoesPortfolio: [],
//         portfolio,
        
//         portfolioDono: portfolio ? { ID_USUARIO: portfolio.ID_USUARIO, NOME_USUARIO: portfolio.NOME_USUARIO } : null,
//         dadosNotificacao: {
//           titulo: 'Portfólio vazio',
//           mensagem: 'Nenhuma publicação encontrada neste portfólio.',
//           tipo: 'info'
//         }
//       });
//     }

//     // 3) Pega o dono do portfolio a partir do portfolio
//     const portfolioDono = portfolio ? { ID_USUARIO: portfolio.ID_USUARIO, NOME_USUARIO: portfolio.NOME_USUARIO } : null;

//     console.log("Dados do portfólio sendo exibido:", portfolio);
    
// console.log(publicacoesPortfolio[0].tagsPortfolio);
//     res.render('pages/portfolio', {
//       publicacoesPortfolio,
//       portfolio,
//       portfolioDono,
     
//         dadosNotificacao: req.session.dadosNotificacao || null,
//     });

//   } catch (erro) {
//     console.log(erro);
//     res.render('pages/portfolio', {
//       publicacoesPortfolio: [],
//       portfolio: null,
//       portfolioDono: null,
     
//       dadosNotificacao: {
//         titulo: 'Erro ao carregar o portfólio',
//         mensagem: 'Tente novamente mais tarde.',
//         tipo: 'error'
//       }
//     });
//   }
// },

 

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



 listarSeguidoresESeguindo: async (req, res) => {
  try {
    const userId = parseInt(req.query.id);
    if (!userId) return res.status(400).json({ error: "ID do usuário inválido" });

    const { seguidores, seguindo } = await listagensModel.listarSeguidoresESeguindo(userId, req.session?.autenticado?.id);

     const seguidoresLog = seguidores.map(u => ({
  ID_USUARIO: u.ID_USUARIO,
  NOME_USUARIO: u.NOME_USUARIO,
  FOTO_PERFIL: u.FOTO_PERFIL_BANCO_USUARIO ? 'sim' : 'não',
  USER_USUARIO: u.USER_USUARIO,
  SEGUIDO: u.SEGUIDO // 1 ou 0
}));

const seguindoLog = seguindo.map(u => ({
  ID_USUARIO: u.ID_USUARIO,
  NOME_USUARIO: u.NOME_USUARIO,
  FOTO_PERFIL: u.FOTO_PERFIL_BANCO_USUARIO ? 'sim' : 'não',
  USER_USUARIO: u.USER_USUARIO,
  SEGUIDO: u.SEGUIDO
}));

console.log("Seguidores encontrados:", seguidoresLog);
console.log("Seguindo encontrados:", seguindoLog);
    res.json({
      seguidores,
      seguindo,
     usuarioLogado: req.session?.autenticado?.id ? true : false,
  idUsuarioLogado: req.session?.autenticado?.id || null
    });
  } catch (erro) {
    console.error("Não foi possível listar seguidores.", erro);
    res.status(500).json({ error: "Não foi possível carregar os seguidores" });
  }
},


 
}
 
 
module.exports = listagensController;