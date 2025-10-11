const publicacoesModel = require("../models/publicacoesModel");
const pool = require("../../config/pool_conexoes");
const listagensModel = require("../models/listagensModel");
const {favoritoModel} = require("../models/favoritoModel");
const notificacoesModel = require("../models/notificacoesModel");
const listagensController = require("../controllers/listagensController");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const { removeImg } = require("../util/removeImg");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const https = require('https');
const fs = require('fs');

const publicacoesController = {


  regrasValidacaoCriarPublicacao: [
    body("titulo")
      .trim()
      .isLength({ min: 1, max: 70 })
      .withMessage("O título deve ter entre 1 e 70 caracteres."),
    body("categoria")
      .trim()
      .notEmpty()
      .withMessage("A categoria é obrigatória."),
    body("descricao")
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage("A descrição deve ter entre 1 e 2000 caracteres."),
    body("tags")
      .custom((value) => {
        try {
          const tags = JSON.parse(value);
          if (!Array.isArray(tags)) throw new Error();
          if (tags.length > 10) throw new Error("Máximo 10 tags permitidas.");
          return true;
        } catch {
          throw new Error("Tags inválidas, envie um array JSON.");
        }
      }),
   
  ],



  regrasValidacaoCriarPropostaProjeto: [
    body("titulo")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("O título deve ter entre 2 e 50 caracteres."),
    
    body("categoria")
      .trim()
      .notEmpty()
      .withMessage("A categoria é obrigatória."),
    
    body("preferencia")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 30 })
      .withMessage("A preferência deve ter no máximo 30 caracteres."),

    body("prazoEntrega")
      .optional({ checkFalsy: true })
      .isDate({ format: "YYYY-MM-DD" })
      .withMessage("O prazo de entrega deve ser uma data válida."),

    body("orcamento")
      .optional({ checkFalsy: true })
      .isFloat({ min: 0 })
      .withMessage("O orçamento deve ser um valor positivo."),

       body("descricao")
      .trim()
      .isLength({ min: 2, max: 2000 })
      .withMessage("A descrição deve ter entre 2 e 2000 caracteres."),

  ],



    regrasValidacaoCriarPortfolio: [
    body("titulo")
      .trim()
      .isLength({ min: 2, max: 70 })
      .withMessage("O título deve ter entre 2 e 70 caracteres."),
    body("descricao")
      .trim()
      .isLength({ min: 2, max: 2000 })
      .withMessage("A descrição deve ter entre 2 e 2000 caracteres."),
    body("tags")
      .custom((value) => {
        try {
          const tags = JSON.parse(value);
          if (!Array.isArray(tags)) throw new Error();
          if (tags.length > 10) throw new Error("Máximo 10 tags permitidas.");
          return true;
        } catch {
          throw new Error("Tags inválidas, envie um array JSON.");
        }
      }),

  ],


  

    regrasValidacaoEditarPortfolio: [
    body("titulo")
      .trim()
      .isLength({ min: 2, max: 70 })
      .withMessage("O título deve ter entre 2 e 70 caracteres."),
    body("descricao")
      .trim()
      .isLength({ min: 2, max: 2000 })
      .withMessage("A descrição deve ter entre 2 e 2000 caracteres."),
    body("tags")
      .custom((value) => {
        try {
          const tags = JSON.parse(value);
          if (!Array.isArray(tags)) throw new Error();
          if (tags.length > 10) throw new Error("Máximo 10 tags permitidas.");
          return true;
        } catch {
          throw new Error("Tags inválidas, envie um array JSON.");
        }
      }),

  ],


    regrasValidacaoEditarProposta: [
      body("titulo_publicacao")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("O título deve ter entre 2 e 50 caracteres."),
    
    body("categoria")
      .trim()
      .notEmpty()
      .withMessage("A categoria é obrigatória."),
    
    // body("preferencia")
    //   .optional({ checkFalsy: true })
    //   .trim()
    //   .isLength({ max: 30 })
    //   .withMessage("A preferência deve ter no máximo 30 caracteres."),

    body("prazo_entrega")
      .optional({ checkFalsy: true })
      .isDate({ format: "YYYY-MM-DD" })
      .withMessage("O prazo de entrega deve ser uma data válida."),

    body("orcamento")
      .optional({ checkFalsy: true })
      .isFloat({ min: 0 })
      .withMessage("O orçamento deve ser um valor positivo."),

       body("descricao_proposta")
      .trim()
      .isLength({ min: 2, max: 2000 })
      .withMessage("A descrição deve ter entre 2 e 2000 caracteres."),



],


    regrasValidacaoEditarPublicacao: [
  body("titulo_publicacao")
    .trim()
    .isLength({ min: 1, max: 70 })
    .withMessage("O título deve ter entre 1 e 70 caracteres."),

    body("categoria")
    .trim()
    .notEmpty()
    .withMessage("Selecione uma categoria"),
  
  

  body("descricao_publicacao")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("A descrição deve ter entre 1 e 2000 caracteres."),

  body("tags")
    .custom((value) => {
      try {
        const tags = JSON.parse(value);
        if (!Array.isArray(tags)) throw new Error();
        if (tags.length > 10) throw new Error("Máximo 10 tags permitidas.");
        return true;
      } catch {
        throw new Error("Tags inválidas, envie um array JSON.");
      }
    }),
  ],











  criarPublicacao: async (req, res) => {

    try {

      // Avisa que chegou aqui e mostra os valores recebidos.
      console.log("Chegou no criarPublicacao.");
      console.log("Body:", req.body);
      console.log("FILES:", req.files);


      //Verifica se a validação retornou algum erro.
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        console.log("Deu erro na validação af");
        return res.status(400).json({ erros: erros.array() });
      
      }

      // titulo, descricao, categoria e tags são retirados do body.
      const { titulo, descricao, categoria, tags } = req.body;
      // Pega o ID do usuário logado.
      const idUsuario = req.session.autenticado.id;

      // Cria a publicação com seus dados base, na tabela PUBLICACOES_PROFISSIONAL.
      const resultado = await publicacoesModel.criarPublicacao({
        ID_USUARIO: idUsuario,
        NOME_PUBLICACAO: titulo,
        DESCRICAO_PUBLICACAO: descricao,
        CATEGORIA: categoria
      });

      console.log(resultado) // Mostra o que foi inserido na tabela PUBLICACOES_PROFISSIONAL.

      // Se não houver resultado, ou seja, nada foi inserido, retorna um erro. 
      if (!resultado) {
        return res.status(500).json({ erro: "Erro ao criar a publicação." });
      }

        
      const idPublicacao = resultado; // resultado já é o insertId
      console.log("Id inserido:", idPublicacao); // Mostra o ID da publicação inserida.
      const imagens = req.files.images || req.files || [];
      console.log("Imagens recebidas:", imagens);

    if (imagens && imagens.length > 0) { //Se tem imagens e o tamanho é maior que 0...
      for (const imagem of imagens) { // Para cada imagem recebida...
        const bufferImagem = imagem.buffer; // Converte a imagem para buffer (dados binários).
        
        await publicacoesModel.inserirConteudo(idPublicacao, bufferImagem); // Insere a imagem na tabela CONTEUDO_PUBLICACOES_PROFISSIONAL, com o ID da publicação que foi inserido anteriormente em PUBLICACOES_PROFISSIONAL.
        console.log("Imagem inserida com sucesso"); // Para avisar que inseriu a imagem com sucesso
      }
    }


 const tagsRecebidas = JSON.parse(req.body.tags); // Monta um const com as tags que vieram do body
 console.log("Tags recebidas:", tagsRecebidas); //Mostra pra nois no terminal

 for (const tag of tagsRecebidas) { //agora vamos fazer certas instruções para cada uma das tags do array
  console.log("Tag:", tag); //Mostra no terminal a tag do momento

  let tagExistente = await publicacoesModel.buscarTagPorNome(tag);  // Confere no banco se já tem uma tag com esse nome. Se não tiver, fica undefined.
  console.log("Tag encontrada no buscarTagPorNome:", tagExistente);// Mostra o retorno


  if(!tagExistente){// Se a tag ainda não existe
    const novaTag = await publicacoesModel.criarTag(tag); //Define novaTag como o resultado da criação de uma nova tag com o nome
    console.log("Tag criada:", novaTag); // Mostra a tag que foi criada

    let tagPublicacao = novaTag; //Agora define tagPublicacao como a novaTag que acabou de ser criada
    console.log(tagPublicacao); //Mostra qual é a tagPublicação

    const resultado = await publicacoesModel.associarTagPublicacao(tagPublicacao, idPublicacao); //Insere uma linha na tabela de relacionamento: o id da tag e o id da publicação
    console.log(resultado) //Resultado da tentativa de associar tags a publicação

  } else {// Se a tag já existe
    console.log("Tag já existe:", tagExistente); // Mostra que ela já existe
     
    let tagPublicacao = tagExistente.ID_TAG; //Define tagPublicação como o ID da tag já existente

    console.log(tagPublicacao); //Mostra o id da tag

    const resultado = await publicacoesModel.associarTagPublicacao(tagPublicacao, idPublicacao);//Insere uma linha na tabela de relacionamento: o id da tag e o id da publicação
    console.log(resultado) //Resultado da tentativa de associar tags a publicação




  }
}

req.session.dadosNotificacao = {
  titulo: "Publicação criada com sucesso!",
  mensagem: "Sua publicação foi enviada corretamente.",
  tipo: "success"
};

return res.status(200).json({ 
  sucesso: true, 
  mensagem: "Publicação criada com sucesso!", 
  idPublicacao: idPublicacao 
});

    } catch (erro) {
      
              console.error("Erro ao criar publicação:", erro);
              req.session.dadosNotificacao = {
              titulo: "Ocorreu um erro.",
              mensagem: "Não foi possível salvar sua publicação. Tente novamente mais tarde.",
              tipo: "error"
            };

            return res.status(200).json({ 
              sucesso: false, 
              mensagem: "Não foi possível criar a publicação.", 
              idPublicacao: null
            });

        }
  },







editarPublicacao: async (req, res) => {

  console.log("Chegou no editarPublicação");
  
  try {

    const { id_publicacao, titulo_publicacao, descricao_publicacao, categoria, tags } = req.body;


    const idPublicacao = req.body.id_publicacao;
    const idUsuario = req.session.autenticado.id;
    console.log("Editando publicação:", idPublicacao);
    console.log("Body recebido:", req.body);
   

    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      console.log("Deu erro na validação !!");
      console.log("Erros de validação:", erros.array());

          
      

      req.session.dadosNotificacao = {
        titulo: "Não foi possível salvar as alterações.",
        mensagem: "Preencha os campos corretamente.",
        tipo: "error"
      };

      return res.redirect("/publicacao/" + idPublicacao);


      // return res.render('pages/publicacao', {
      //   idPublicacao,
      //   listaErros: erros.array(),
      //   dadosNotificacao: {
      //     titulo: "Erro na validação",
      //     mensagem: "Alguns campos estão inválidos.",
      //     tipo: "error"
      //   }, 
      //     erros: erros.array(),
      // });
    }

    // 1) Atualiza os dados básicos da publicação

    console.log("Passou pela validação uhuuu.");

    

    let categoriaFinal = req.body.categoria;
if (req.body.outraCategoria && req.body.outraCategoria.trim() !== '') {
    categoriaFinal = req.body.outraCategoria.trim();
}


    const resultado = await publicacoesModel.atualizarPublicacao({
      ID_PUBLICACAO: id_publicacao,
      NOME_PUBLICACAO: titulo_publicacao,
      DESCRICAO_PUBLICACAO: descricao_publicacao,
      CATEGORIA: categoriaFinal,
    });

    console.log("Dados básicos atualizados!");

   

  
    // Atualiza as tags
    await publicacoesModel.removerTagsDaPublicacao(idPublicacao); 
    console.log("Chegou na parte de atualizar a tags");

    let tagsRecebidas = [];
if (tags && tags.trim() !== "") {
  tagsRecebidas = JSON.parse(tags);
}

  for (const tag of tagsRecebidas) {
  const nomeTag = tag.value; // só o nome da tag
  let tagExistente = await publicacoesModel.buscarTagPorNome(nomeTag);
  if (!tagExistente) {
    const novaTagId = await publicacoesModel.criarTag(tag.value, tag.color, tag.style);
    await publicacoesModel.associarTagPublicacao(novaTagId, idPublicacao);
  } else {
    await publicacoesModel.associarTagPublicacao(tagExistente.ID_TAG, idPublicacao);
  }
}



    // 4) Sucesso
    console.log("Se chegou aqui, deu certo!");
    
  req.params.id = idPublicacao; 


req.session.dadosNotificacao = {
  titulo: "Atualização feita!",
  mensagem: "Sua publicação foi atualizada com sucesso.",
  tipo: "success"
};



return res.redirect("/publicacao/" + idPublicacao);


  } catch (erro) {
    console.error("Erro ao editar publicação:", erro);
  

    const idPublicacao = req.body.id_publicacao;
      req.session.dadosNotificacao = {
        titulo: "Ocorreu um erro.",
        mensagem: "Não foi possível atualizar sua publicação.",
        tipo: "error"
      };

    
     return res.redirect("/publicacao/" + idPublicacao);

}

},


editarProposta: async (req, res) => {
  console.log("Chegou no editarProposta");
  const previousUrl = req.get("Referer") || "/";
  try {
    const { id_proposta, titulo_proposta, descricao_proposta, categoria_proposta, preferencia_proposta, prazo_entrega, orcamento } = req.body;
    const idUsuario = req.session.autenticado.id;

    console.log("Editando proposta:", id_proposta);
    console.log("Body recebido:", req.body);

    // Validação
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      console.log("Erros de validação:", erros.array());

      req.session.dadosNotificacao = {
        titulo: "Não foi possível salvar as alterações.",
        mensagem: "Preencha os campos corretamente.",
        tipo: "error"
      };

      return res.redirect(previousUrl);
    }

    // Categoria (permite "outra categoria")
    let categoriaFinal = categoria_proposta;
    if (req.body.outraCategoria && req.body.outraCategoria.trim() !== "") {
      categoriaFinal = req.body.outraCategoria.trim();
    }

    // Corrige o valor do prazo_entrega: se vazio, envia null para o banco
    let prazoFinal = prazo_entrega && prazo_entrega.trim() !== '' ? prazo_entrega : null;

    await publicacoesModel.atualizarProposta({
      ID_PROPOSTA: id_proposta,
      TITULO_PROPOSTA: titulo_proposta,
      DESCRICAO_PROPOSTA: descricao_proposta,
      CATEGORIA_PROPOSTA: categoriaFinal,
      PREFERENCIA_PROPOSTA: preferencia_proposta,
      PRAZO_ENTREGA: prazoFinal,
      ORCAMENTO: orcamento,
      ID_USUARIO: idUsuario
    });

    console.log("Proposta atualizada com sucesso!");

    // Notificação de sucesso
    req.session.dadosNotificacao = {
      titulo: "Atualização feita!",
      mensagem: "Sua proposta foi atualizada com sucesso.",
      tipo: "success"
    };

    return res.redirect(previousUrl);

  } catch (erro) {
    console.error("Erro ao editar proposta:", erro);

    const idProposta = req.body.id_proposta;
    req.session.dadosNotificacao = {
      titulo: "Ocorreu um erro.",
      mensagem: "Não foi possível atualizar sua proposta.",
      tipo: "error"
    };

    return res.redirect(previousUrl);
  }
},













  criarPropostadeProjeto: async (req, res) => {

    try {

      // Avisa que chegou aqui e mostra os valores recebidos.
      console.log("Chegou no criarPropostadeProjeto.");
      console.log("Body:", req.body);
   


      //Verifica se a validação retornou algum erro.
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
      console.log("Deu erro na validação !!");

      return res.render('pages/nova-publi-pedido', {
        listaErros: erros,
        dadosNotificacao: {
          titulo: 'Erro ao enviar Proposta de Projeto!',
          mensagem: 'Verifique se os campos foram corretamente preenchidos.',
          tipo: 'error'
        },
        usuario: req.session.autenticado || null,
        autenticado: !!req.session.autenticado,
      });
    }
     
      const { titulo, categoria, preferencia, prazoEntrega, orcamento, descricao} = req.body;
      // Pega o ID do usuário logado.
      const idUsuario = req.session.autenticado.id;

      // Cria a publicação com seus dados base, na tabela de propostas.
      const resultado = await publicacoesModel.criarPropostadeProjeto({
        ID_USUARIO: idUsuario,
        TITULO_PROPOSTA: titulo,
        DESCRICAO_PUBLICACAO: descricao,
        CATEGORIA_PROPOSTA: categoria,
        PREFERENCIA_PROPOSTA: preferencia,
        PRAZO_ENTREGA: prazoEntrega,
        ORCAMENTO: orcamento,
        DESCRICAO_PROPOSTA: descricao
             
      });

      console.log(resultado) // Mostra o que foi inserido na tabela Proposta de projeto.

      // Se não houver resultado, ou seja, nada foi inserido, retorna um erro. 
  if (!resultado) {
      console.log("Deu erro ao salvar Proposta de Projeto!");

    
      return res.render('pages/nova-publi-pedido', {
        listaErros: null,
        dadosNotificacao: {
          titulo: 'Erro ao enviar Proposta de Projeto.',
          mensagem: 'Não foi possível salvar sua proposta.',
          tipo: 'error'
        },
        usuario: req.session.autenticado || null,
        autenticado: !!req.session.autenticado,
      });
    }

   
    return res.render('pages/nova-publi-pedido', {
      listaErros: null,
      dadosNotificacao: {
        titulo: 'Proposta de Projeto enviada!',
        mensagem: "Sua Proposta de Projeto foi salva com sucesso.",
        tipo: "success"
      },
    
      usuario: req.session.autenticado ? {
        id: req.session.autenticado.id,
        nome: req.session.autenticado.nome,
        tipo: req.session.autenticado.tipo
      } : null,
      autenticado: !!req.session.autenticado,
    });
    } catch (erro) {
      console.error("Erro ao criar proposta de projeto:", erro);
      return res.status(500).json({ erro: "Erro interno ao criar proposta de projeto." });
    }
  },











  criarPortfolio: async (req, res) => {

    try {

      // Avisa que chegou aqui e mostra os valores recebidos.
      console.log("Chegou no criarPortfolio.");
      console.log("Body:", req.body);
    


      //Verifica se a validação retornou algum erro.
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        console.log("Deu erro na validação af");
    req.session.dadosNotificacao = {
               titulo: 'Campos inválidos.',
               mensagem: 'Verifique os campos e tente novamente.',
               tipo: 'error'
             };
       
       
       
       
       
             return res.redirect("/novo-portfolio");

      }

      // titulo, descricao, categoria e tags são retirados do body.
      const { titulo, descricao, tags } = req.body;
      // Pega o ID do usuário logado.
      const idUsuario = req.session.autenticado.id;

      // Cria a publicação com seus dados base, na tabela 
      const resultado = await publicacoesModel.criarPortfolio({
        ID_USUARIO: idUsuario,
        NOME_PORTFOLIO: titulo,
        DESCRICAO_PORTFOLIO: descricao,

      });

      console.log(resultado) // Mostra o que foi inserido na tabela

      // Se não houver resultado, ou seja, nada foi inserido, retorna um erro. 
      if (!resultado) {

         req.session.dadosNotificacao = {
               titulo: 'Ocorreu um erro.',
               mensagem: 'Não foi possível criar seu portfólio. Tente novamente mais tarde.',
               tipo: 'error'
             };
       
       
       
       
       
             return res.redirect("/");

        }
    

        
      const idPortfolio = resultado; // resultado já é o insertId
      console.log("Id inserido:", idPortfolio); // Mostra o ID da publicação inserida.
 

  


const tagsRecebidas = req.body.tags
  ? req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
  : []; // Monta um const com as tags que vieram do body
 console.log("Tags recebidas:", tagsRecebidas); //Mostra pra nois no terminal

 for (const tag of tagsRecebidas) { //agora vamos fazer certas instruções para cada uma das tags do array
  console.log("Tag:", tag); //Mostra no terminal a tag do momento

  let tagExistente = await publicacoesModel.buscarTagPorNome(tag);  // Confere no banco se já tem uma tag com esse nome. Se não tiver, fica undefined.
  console.log("Tag encontrada no buscarTagPorNome:", tagExistente);// Mostra o retorno


  if(!tagExistente){// Se a tag ainda não existe
    const novaTag = await publicacoesModel.criarTag(tag); //Define novaTag como o resultado da criação de uma nova tag com o nome
    console.log("Tag criada:", novaTag); // Mostra a tag que foi criada

    let tagPortfolio = novaTag; //Agora define tagPortfolio como a novaTag que acabou de ser criada
    console.log(tagPortfolio); //Mostra qual é a tagPortfolio

    const resultado = await publicacoesModel.associarTagPortfolio(tagPortfolio, idPortfolio); //Insere uma linha na tabela de relacionamento: o id da tag e o id da publicação
    console.log(resultado) //Resultado da tentativa de associar tags a publicação

  } else {// Se a tag já existe
    console.log("Tag já existe:", tagExistente); // Mostra que ela já existe
     
    let tagPortfolio = tagExistente.ID_TAG; //Define tagPortfolio como o ID da tag já existente

    console.log(tagPortfolio); //Mostra o id da tag

    const resultado = await publicacoesModel.associarTagPortfolio(tagPortfolio, idPortfolio);//Insere uma linha na tabela de relacionamento: o id da tag e o id da publicação
    console.log(resultado) //Resultado da tentativa de associar tags a publicação




  }
}

// Pega os ids das publicações selecionadas
const idsPublis = req.body.publicacoesSelecionadas ? req.body.publicacoesSelecionadas.split(',') : [];

for (const idPub of idsPublis) {
  await publicacoesModel.inserirPublisPortfolio(idPub, idPortfolio);
}

    console.log("Deu certo.");
    req.session.dadosNotificacao = {
             titulo: 'Portfólio criado!',
        mensagem: "Seu portfólio foi criado com sucesso.",
        tipo: "success"
             };
       
       
       
       
       
             return res.redirect("/portfolio/" + idPortfolio );
    } catch (erro) {
      console.error("Erro ao criar portfólio:", erro);
     
      return res.render('pages/novo-portfolio', {
      listaErros: erro,
      dadosNotificacao: {
        titulo: 'Não foi possível criar portfólio.',
        mensagem: "Tente novamente mais tarde.",
        tipo: "error"
      },
      publicacoes: [],

      usuario: req.session.autenticado || null,
      autenticado: !!req.session.autenticado,
    });
    }
  },


  // Excluir publicação (apenas dono)
  excluirPublicacao: async (req, res) => {
    try {
      const { idPublicacao } = req.body;
      if (!idPublicacao) {
        return res.status(400).send("ID da publicação não enviado.");
      }
      const publicacao = await publicacoesModel.findIdPublicacao(idPublicacao);
      if (!publicacao) {
        return res.status(404).send("Publicação não encontrada.");
      }
      const idUsuario = req.session.autenticado.id;
      const tipoUsuario = req.session.autenticado.tipo;
      // Permitir exclusão se for dono OU administrador
      if (publicacao.ID_USUARIO !== idUsuario && tipoUsuario !== 'administrador') {
        return res.status(403).send("Você não tem permissão para excluir esta publicação.");
      }



      let resultado = await publicacoesModel.excluirPublicacao(idPublicacao);
      console.log(resultado);

            
      req.session.dadosNotificacao = {
        titulo: " Publicação Excluída!",
        mensagem: "Sua publicação foi excluída com sucesso.",
        tipo: "success"
      };




      return res.redirect("/"); 
    } catch (erro) {
      console.error("Erro ao excluir publicação:", erro);
      
      
            
      req.session.dadosNotificacao = {
        titulo: "Ocorreu um erro.",
        mensagem: "Não foi possível excluir sua publicação.",
        tipo: "error"
      };




      return res.redirect("/"); 
    }
  },




  getPublicacoesUsuario: async (req, res) => {
  const userId = req.session.autenticado.id; 
  const publicacoes = await listagensModel.listarPublicacoesUsuarioLogado(userId); // consulta no banco
  publicacoes.forEach(pub => {
  pub.imagens = pub.imagens.map(imgBuffer => {
    return `data:image/jpeg;base64,${imgBuffer.toString('base64')}`; 
  });
});


  res.json(publicacoes); // retorna JSON
},




adicionarPublicacoesAoPortfolio: async (req, res) => {

  const { publicacoesSelecionadas, portfolioId } = req.body;
  console.log(req.body);

  try {
    
    if (!portfolioId) {

      
      
    req.session.dadosNotificacao = {
      titulo: "Ocorreu um erro.",
      mensagem: "Tente novamente mais tarde.",
      tipo: "error"
    };


    return  res.redirect("/");

    }

    if (!publicacoesSelecionadas || publicacoesSelecionadas.length === 0) {
      
    req.session.dadosNotificacao = {
      titulo: "Selecione publicações.",
      mensagem: "Nenhuma publicação foi selecionada.",
      tipo: "attention"
    };

    }

    // Se veio como string separada por vírgula, transforma em array de números
    const idsArray = typeof publicacoesSelecionadas === "string"
      ? publicacoesSelecionadas.split(",").map(id => parseInt(id))
      : publicacoesSelecionadas;

  for (const idPublicacao of idsArray) {
  const existe = await publicacoesModel.verificarPublisNoPortfolio(idPublicacao, portfolioId);
  if (!existe) {
    await publicacoesModel.inserirPublisPortfolio(idPublicacao, portfolioId);
  }
}


console.log("Deu tudo certo. Publicações adicionadas ao portfólio.")

  req.params.id = portfolioId;

  
req.session.dadosNotificacao = {
  titulo: "Publicações inseridas com sucesso!",
  mensagem: "As publicações foram adicionadas ao portfólio com sucesso.",
  tipo: "success"
};

await listagensController.exibirPortfolio(req, res);

  } catch (error) {
    console.log("Não foi possível adicionar as publicações ao portfolio.");
    console.log(error);

    req.params.id = portfolioId;

   req.session.dadosNotificacao = {
      titulo: 'Ocorreu um erro.',
      mensagem: "Não foi possível adicionar as publicações ao portfólio.",
      tipo: "error"
    };
    
await listagensController.exibirPortfolio(req, res);
  } 


},


removerPublicacoesDoPortfolio: async (req, res) => {
  console.log("Chegou no removerPublicacoesDoPortfolio")
  const { id_portfolio, publisParaRemocao } = req.body;
  console.log(req.body);

  try {
    if (!id_portfolio) {
   
          req.session.dadosNotificacao = {
      titulo: "Ocorreu um erro.",
      mensagem: "Tente novamente mais tarde.",
      tipo: "error"
    };

    return res.redirect("/");
    }

    if (!publisParaRemocao || publisParaRemocao.length === 0) {
         req.session.dadosNotificacao = {
      titulo: "Selecione publicações!",
      mensagem: "Nenhuma publicação foi selecionada para remoção.",
      tipo: "attention"
    };


    req.params.id = id_portfolio;

   
    await listagensController.exibirPortfolio(req, res);

    }

    // Converte string separada por vírgula em array de números
    const idsArray = typeof publisParaRemocao === "string"
      ? publisParaRemocao.split(",").map(id => parseInt(id))
      : publisParaRemocao;

    for (const idPublicacao of idsArray) {
      await publicacoesModel.removerPublisDoPortfolio(idPublicacao, id_portfolio);
    }

    console.log("Deu tudo certo. Publicações removidas do portfólio.");

    req.params.id = id_portfolio;

    req.session.dadosNotificacao = {
      titulo: "Publicações removidas com sucesso!",
      mensagem: "As publicações foram removidas do portfólio com sucesso.",
      tipo: "success"
    };

    await listagensController.exibirPortfolio(req, res);

  } catch (error) {
    console.error("Não foi possível remover as publicações do portfólio.", error);

    req.params.id = id_portfolio;

    req.session.dadosNotificacao = {
      titulo: 'Ocorreu um erro.',
      mensagem: "Não foi possível remover as publicações do portfólio.",
      tipo: "error"
    };
    
    await listagensController.exibirPortfolio(req, res);
  }
},






editarPortfolio: async (req, res) => {
  try {
    console.log("Chegou no editarPortfolio.");
    console.log("Body:", req.body);

    const idPortfolio = req.body.id_portfolio;

    // Verifica se a validação retornou algum erro
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      console.log("Deu erro na validação do editar portfolio af");
      return res.status(400).json({ erros: erros.array() });
    }

    const { titulo, descricao } = req.body;

    // Pega o ID do usuário logado
    const idUsuario = req.session.autenticado.id;

    // Atualiza os dados básicos do portfólio
    const resultado = await publicacoesModel.editarPortfolio({
      NOME_PORTFOLIO: titulo,
      DESCRICAO_PORTFOLIO: descricao,
      ID_PORTFOLIO: idPortfolio
    });

    console.log("Portfólio atualizado:", resultado);

    if (!resultado) {
      return res.status(500).json({ erro: "Erro ao editar o portfolio." });
    }

    // ===== Atualiza tags =====

    // 1) Remove todas as tags antigas do portfólio
    await publicacoesModel.removerTagsDoPortfolio(idPortfolio);
    console.log("Tags antigas removidas");

    // 2) Pega as tags recebidas do front
    const tagsRecebidas = req.body.tags ? JSON.parse(req.body.tags) : [];
    console.log("Tags recebidas:", tagsRecebidas);

    // 3) Associa cada tag ao portfólio
    for (const tag of tagsRecebidas) {
      console.log("Tag:", tag);

      // Confere se a tag já existe no banco
      let tagExistente = await publicacoesModel.buscarTagPorNome(tag);
      let tagId;

      if (!tagExistente) {
        // Se não existe, cria
        tagId = await publicacoesModel.criarTag(tag);
        console.log("Tag criada:", tagId);
      } else {
        tagId = tagExistente.ID_TAG;
        console.log("Tag já existe:", tagId);
      }

      // Associa a tag ao portfólio
      const associacao = await publicacoesModel.associarTagPortfolio(tagId, idPortfolio);
      console.log("Associação realizada:", associacao);
    }

    // ===== Sucesso =====
    console.log("Portfólio e tags atualizados com sucesso!");

    req.params.id = idPortfolio;
    req.session.dadosNotificacao = {
      titulo: "Atualização feita!",
      mensagem: "Os dados do portfólio foram atualizados com sucesso.",
      tipo: "success"
    };

    await listagensController.exibirPortfolio(req, res);

  } catch (erro) {
    console.error("Erro ao editar portfolio:", erro);

    req.params.id = req.body.id_portfolio;
    req.session.dadosNotificacao = {
      titulo: "Ocorreu um erro.",
      mensagem: "Não foi possível atualizar seu portfólio.",
      tipo: "error"
    };

    await listagensController.exibirPortfolio(req, res);
  }
},






  excluirPortfolio: async (req, res) => {
    try {
      const { idPortfolio } = req.body;
      if (!idPortfolio) {
        return res.status(400).send("ID do portfólio não enviado.");
      }
      const portfolio = await listagensModel.buscarPortfolioPorId(idPortfolio);
      if (!portfolio) {
        return res.status(404).send("Portfólio não encontrado.");
      }
      const idUsuario = req.session.autenticado.id;
      const tipoUsuario = req.session.autenticado.tipo;
      // Permitir exclusão se for dono OU administrador
      if (portfolio.ID_USUARIO !== idUsuario && tipoUsuario !== 'administrador') {
        return res.status(403).send("Você não tem permissão para excluir este portfólio.");
      }

      let resultado = await publicacoesModel.excluirPortfolio(idPortfolio);
      console.log(resultado);

            
      req.session.dadosNotificacao = {
        titulo: "Portfólio Excluído!",
        mensagem: "Seu portfólio foi excluído com sucesso.",
        tipo: "success"
      };




      return res.redirect("/"); 
    } catch (erro) {
      console.error("Erro ao excluir portfólio:", erro);

      req.session.dadosNotificacao = {
        titulo: "Ocorreu um erro.",
        mensagem: "Não foi possível excluir seu portfólio.",
        tipo: "error"
      };




      return res.redirect("/"); 
    }
  },








// favoritar: async (req, res) => {
//     console.log("Chegou no favoritar");

//     if (!req.session.autenticado?.autenticado) {
//       console.log("O usuário precisa logar. Mandando ele pra página de login.")
//         return res.render("pages/login", { 
//             listaErros: null,
//             dadosNotificacao: {
//                 titulo: "Faça seu Login!", 
//                 mensagem: "Para favoritar é necessário estar logado!", 
//                 tipo: "warning" 
//             },
//             valores: [],
//             retorno: null,
//             errosLogin: null
//         });
//     }

//     try {
//         console.log("id da publicação:", req.query.id);
//         console.log("situação:", req.query.sit);
//         console.log("id do usuário:", req.session.autenticado.id);

//         await favoritoModel.favoritar({
//             idPublicacao: req.query.id,
//             situacao: req.query.sit,
//             idUsuario: req.session.autenticado.id
//         });

//         console.log("Favorito atualizado!");

      
//         const previousUrl = req.get("Referer") || "/";
//         res.redirect(previousUrl);

//     } catch (err) {
//         console.error(err);
//         res.redirect("/");
//     }
// }



favoritar: async (req, res) => {
  console.log("Chegou no favoritar");

  if (!req.session.autenticado?.autenticado) {
    return res.render("pages/login", { 
      listaErros: null,
      dadosNotificacao: {
        titulo: "Faça seu Login!", 
        mensagem: "Para favoritar é necessário estar logado!", 
        tipo: "warning" 
      },
      valores: [],
      retorno: null,
      errosLogin: null
    });
  }

  try {
    const idPublicacao = req.query.id;
    const situacao = req.query.sit;
    const idUsuario = req.session.autenticado.id;

    const idDonoPublicacao = req.query.idDono;
    const nomePublicacao = req.query.nomePub;

    console.log("id da publicação:", idPublicacao);
    console.log("situação:", situacao);
    console.log("id do usuário (quem curtiu):", idUsuario);
    console.log("id do dono da publicação:", idDonoPublicacao);
    console.log("nome da publicação:", nomePublicacao);

    const resultado = await favoritoModel.favoritar({
  idPublicacao,
  situacao,
  idUsuario
});

if (resultado.mudou && resultado.status === 1 && idUsuario != idDonoPublicacao) {
  const idNotificacao = await notificacoesModel.criarNotificacao({
    idUsuario: idDonoPublicacao,
    titulo: "Nova curtida!",
    preview: `${req.session.autenticado.nome} curtiu sua publicação "${nomePublicacao}".`,
    conteudo: `
      <p class="comentario-texto">Seu post tá bombando! 🔥 </p>
      <p>Sua publicação "<strong>${nomePublicacao}</strong>" recebeu uma curtida de 
      <strong class="nome-comentador">${req.session.autenticado.nome}</strong>! ❤️</p>
      <a href="/publicacao/${idPublicacao}" class="btn-ver-comentario">Ver publicação</a>
    `,
    categoria: "CURTIDA"
  });

  console.log("Notificação criada com ID:", idNotificacao);
}
    const previousUrl = req.get("Referer") || "/";
    if (previousUrl.includes("/salvarcomentario") || previousUrl.includes("/excluir-comentario") || previousUrl.includes("/editar-publicacao")) {
      return res.redirect(`/publicacao/${idPublicacao}`);
    } else if (previousUrl.includes("/editar-portfolio") || previousUrl.includes("/remover-publis-portfolio") || previousUrl.includes("/adicionar-publis-portfolio")) {
      return res.redirect(`/portfolio/${req.session.currentPortfolioId}`);
    }

    return res.redirect(previousUrl || "/");

  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
},











// Excluir Proposta
  excluirProposta: async (req, res) => {
    try {
      const { idProposta } = req.body;
      if (!idProposta) {
        return res.status(400).send("ID da proposta não enviado.");
      }
      const proposta = await publicacoesModel.findIdProposta(idProposta);
      if (!proposta) {
        return res.status(404).send("Proposta não encontrada.");
      }
      const idUsuario = req.session.autenticado.id;
      const tipoUsuario = req.session.autenticado.tipo;
      // Permitir exclusão se for dono OU administrador
      if (proposta.ID_USUARIO !== idUsuario && tipoUsuario !== 'administrador') {
        return res.status(403).send("Você não tem permissão para excluir esta proposta de projeto.");
      }



      let resultado = await publicacoesModel.excluirProposta(idProposta);
      console.log(resultado);



      

            
      req.session.dadosNotificacao = {
        titulo: "Proposta de projeto excluída!",
        mensagem: "Sua proposta de projeto foi excluída com sucesso.",
        tipo: "success"
      };




      return res.redirect("/"); 
    } catch (erro) {
      console.error("Erro ao excluir proposta:", erro);
      
      
            
      req.session.dadosNotificacao = {
        titulo: "Ocorreu um erro.",
        mensagem: "Não foi possível excluir sua proposta de projeto.",
        tipo: "error"
      };




      return res.redirect("/"); 
    }
  },

   buscarPropostaPorId: async (req, res) => {
      try {
        const { idProposta } = req.params;
        const [proposta] = await pool.query('SELECT * FROM PROPOSTA_PROJETO WHERE ID_PROPOSTA = ?', [idProposta]);
  
        if (!proposta[0]) {
          req.session.dadosNotificacao = { titulo: 'Erro', mensagem: 'Proposta não encontrada', tipo: 'erro' };
          return res.redirect('/projetos');
        }
  
        res.render('pages/editar-proposta', { proposta: proposta[0] });
      } catch (error) {
        console.error('Erro ao buscar proposta:', error);
        res.status(500).render('pages/erro-conexao', { mensagem: 'Não foi possível acessar a proposta.' });
      }
    },
  
    // // Atualizar proposta
    // editarProposta: async (req, res) => {
    //   try {
    //     const { idProposta } = req.params;
    //     const { titulo, descricao, categoria, preferencia, prazoEntrega, orcamento, status } = req.body;
    //     const idUsuarioLogado = req.session.autenticado.id;
  
    //     const previousUrl = req.get("Referer") || "/";

    //     // Verifica se o usuário é dono da proposta
    //     const [proposta] = await pool.query('SELECT ID_USUARIO FROM PROPOSTA_PROJETO WHERE ID_PROPOSTA = ?', [idProposta]);
    //     if (!proposta[0]) {
    //       req.session.dadosNotificacao = { titulo: 'Erro', mensagem: 'Proposta não encontrada', tipo: 'erro' };
    //       return res.redirect(previousUrl);
    //     }
    //     if (proposta[0].ID_USUARIO !== idUsuarioLogado) {
    //       req.session.dadosNotificacao = { titulo: 'Erro', mensagem: 'Você não pode editar esta proposta', tipo: 'erro' };
    //       return res.redirect(previousUrl);
    //     }
  
    //     // Atualiza os dados da proposta
    //     await pool.query(
    //       `UPDATE PROPOSTA_PROJETO 
    //        SET TITULO_PROPOSTA=?, DESCRICAO_PROPOSTA=?, CATEGORIA_PROPOSTA=?, PREFERENCIA_PROPOSTA=?, PRAZO_ENTREGA=?, ORCAMENTO=?, STATUS_PROPOSTA=?
    //        WHERE ID_PROPOSTA=?`,
    //       [titulo, descricao, categoria, preferencia, prazoEntrega || null, orcamento || null, status, idProposta]
    //     );
  
    //     req.session.dadosNotificacao = { titulo: 'Sucesso', mensagem: 'Proposta atualizada!', tipo: 'sucesso' };
    //     res.redirect(`/projetos/${idProposta}`);
    //   } catch (error) {
    //     console.error('Erro ao editar proposta:', error);
    //     res.status(500).render('pages/erro-conexao', { mensagem: 'Não foi possível atualizar a proposta.' });
    //   }
    // },
  
    // Denunciar proposta
    denunciarProposta: async (req, res) => {
      try {
        const { idProposta, motivo } = req.body;
        const idUsuario = req.session.autenticado.id;
  
        if (!idProposta || !motivo) {
          req.session.dadosNotificacao = { titulo: 'Erro', mensagem: 'Parâmetros inválidos', tipo: 'erro' };
          return res.redirect('/projetos');
        }
  
        await denunciasModel.criarDenunciaProjeto({ idProjeto: idProposta, idUsuario, motivo });
  
        req.session.dadosNotificacao = { titulo: 'Sucesso', mensagem: 'Denúncia enviada com sucesso!', tipo: 'sucesso' };
        res.redirect('/projetos');
  
      } catch (error) {
        console.error('Erro ao denunciar proposta:', error);
        res.status(500).render('pages/erro-conexao', { mensagem: 'Não foi possível denunciar a proposta.' });
      }
    }






};

module.exports = publicacoesController;