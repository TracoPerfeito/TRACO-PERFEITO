
const notificacoesModel = require("../models/notificacoesModel");
const usuariosModel = require("../models/usuariosModel");

const contratacaoModel = require("../models/contratacaoModel");
const listagensController = require("../controllers/listagensController");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const { removeImg } = require("../util/removeImg");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const https = require('https');
const fs = require('fs');

const contratacoesController = {

  // Regras de validação para criação de contratação
  regrasValidacaoCriarContratacao: [
   body("ID_CONTRATANTE")
    .notEmpty()
    .withMessage("ID do cliente é obrigatório."),
  body("ID_CONTRATADO")
    .notEmpty()
    .withMessage("ID do profissional é obrigatório."),
     body("NOME_PROJETO")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("O nome do projeto deve ter entre 2 e 100 caracteres."),
    body("DESCRICAO")
      .trim()
      .isLength({ min: 2, max: 2000 })
      .withMessage("A descrição deve ter entre 2 e 2000 caracteres."),
    body("VALOR_TOTAL")
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("O valor total deve ser um número positivo."),
      body("DATA_ENTREGA")
      .notEmpty()
      .isDate({ format: "YYYY-MM-DD" })
      .withMessage("A data de entrega deve ser uma data válida.")
      .custom((value) => {
        const data = moment(value, "YYYY-MM-DD", true);
        if (!data.isValid()) {
          throw new Error("Data inválida.");
        }
    
        const hoje = moment().startOf("day");
        const limite = moment("2030-12-31"); // impossivel ser adepois di=sso
    
        if (data.isBefore(hoje)) {
          throw new Error("A data de entrega não pode ser no passado.");
        }
        if (data.isAfter(limite)) {
          throw new Error("A data de entrega não pode ser muito distante no futuro.");
        }
    
        return true; // passou
      }),
    
    body("OBSERVACOES")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Observações podem ter no máximo 1000 caracteres.")
  ],


  mostrarPagina: async (req, res) =>{

    console.log("Chegou no mostrar pagina");


    try{
 const { destId, destTipo, destNome } = req.query;

    // Usuário logado já está na sessão
    const usuLogado = req.session.autenticado;

    // Destinatário (vem do clique/seleção)
    const destinatario = {
      id: destId,
      tipo: destTipo,
      nome: destNome
    };

    // Passa para o EJS
    res.render("pages/criar-contratacao", { usuLogado, destinatario });
    }catch(error){
console.log(error);
 req.session.dadosNotificacao = {
        titulo: "Ocorreu um erro.",
        mensagem: "Tente novamente mais tarde.",
        tipo: "error"
      };
      return res.redirect("/");
    }
  },

  // Criar contratação
  criarContratacao: async (req, res) => {
    console.log("Chegou no criar contratação!")
    try {

      
      console.log("Dados do formulário recebidos:", req.body);

      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        req.session.dadosNotificacao = {
          titulo: "Erro ao criar contratação",
          mensagem: "Verifique os campos e tente novamente.",
          tipo: "error"
        };
        return res.redirect("/criar-contratacao");
      }

      const { ID_CONTRATANTE, ID_CONTRATADO, NOME_PROJETO, DESCRICAO, VALOR_TOTAL, DATA_ENTREGA, OBSERVACOES } = req.body;

      const novoRegistro = {
        ID_CLIENTE: ID_CONTRATANTE,       
  ID_PROFISSIONAL: ID_CONTRATADO,  
        NOME_PROJETO,
        DESCRICAO,
        VALOR_TOTAL,
        DATA_ENTREGA,
        OBSERVACOES: OBSERVACOES || null,
        STATUS: "AGUARDANDO CONFIRMAÇÃO",
        ID_USUARIO_CRIADOR: req.session.autenticado.id,
        
      };

      const resultado = await contratacaoModel.createContratacao(novoRegistro);
      

      if (!resultado) {
        req.session.dadosNotificacao = {
          titulo: "Erro",
          mensagem: "Não foi possível criar a contratação.",
          tipo: "error"
        };
        return res.redirect("/criar-contratacao");
      } else{
        console.log("Deu certo!")
        console.log(resultado)
      }

      req.session.dadosNotificacao = {
        titulo: "Sucesso!",
        mensagem: "Contratação criada com sucesso. Aguarde a confirmação do profissional.",
        tipo: "success"
      };

      return res.redirect("/");

    } catch (erro) {
      console.error("Erro ao criar contratação:", erro);
      req.session.dadosNotificacao = {
        titulo: "Erro interno",
        mensagem: "Ocorreu um erro ao processar sua solicitação.",
        tipo: "error"
      };
      return res.redirect("/criar-contratacao");
    }
  },

  // Aceitar contratação (profissional)
  aceitarContratacao: async (req, res) => {
      console.log("Chegou no aceitar contratação.");
    try {
      const id = req.params.id;
      await contratacaoModel.updateContratacao({ STATUS: "AGUARDANDO PAGAMENTO" }, id);

      req.session.dadosNotificacao = {
        titulo: "Contratação aceita",
        mensagem: "O projeto agora está aceito. Aguardando pagamento.",
        tipo: "success"
      };
        console.log("Contratação aceita");
      return res.redirect("/contratacoes");
    } catch (erro) {
      console.error("Erro ao aceitar contratação:", erro);
      req.session.dadosNotificacao = {
        titulo: "Erro",
        mensagem: "Não foi possível aceitar a contratação.",
        tipo: "error"
      };
      return res.redirect("/contratacoes");
    }
  },

  // Recusar contratação (profissional)
  recusarContratacao: async (req, res) => {

    console.log("Chegou no recusar contratação.");
    try {
      const id = req.params.id;
      await contratacaoModel.updateContratacao({ STATUS: "CANCELADA" }, id);

      req.session.dadosNotificacao = {
        titulo: "Contratação recusada",
        mensagem: "Você recusou esta contratação.",
        tipo: "warning"
      };

        console.log("Contratação recusada.");
      return res.redirect("/contratacoes");
    } catch (erro) {
      console.error("Erro ao recusar contratação:", erro);
      req.session.dadosNotificacao = {
        titulo: "Erro",
        mensagem: "Não foi possível recusar a contratação.",
        tipo: "error"
      };
      return res.redirect("/contratacoes");
    }
  },




listarContratacoes: async (req, res) => {
  try {
    const usuarioId = req.session.autenticado.id;
    const contratacoes = await contratacaoModel.findByUsuarioDetalhado(usuarioId);

    // Converter os valores antes de qualquer filtragem
    const contratacoesConvertidas = contratacoes.map(c => ({
      ...c,
      VALOR_TOTAL: Number(c.VALOR_TOTAL),
      DATA_ENTREGA: new Date(c.DATA_ENTREGA)
    }));

    // Separar por status a partir do array convertido
    const aguardandoAceite = contratacoesConvertidas.filter(c => c.STATUS === "AGUARDANDO CONFIRMAÇÃO");
    const aguardandoPag = contratacoesConvertidas.filter(c => c.STATUS === "AGUARDANDO PAGAMENTO");
    const emAndamento = contratacoesConvertidas.filter(c => c.STATUS === "EM ANDAMENTO");
    const concluidas = contratacoesConvertidas.filter(c => c.STATUS === "CONCLUÍDA");
    const canceladas = contratacoesConvertidas.filter(c => c.STATUS === "CANCELADA");

    console.log("Exibindo pagina de contratacoes com os seguintes dados:", contratacoesConvertidas);

    res.render("pages/contratacoes", {
      aguardandoAceite,
      aguardandoPag,
      emAndamento,
      concluidas,
      canceladas,
      todas: contratacoesConvertidas
    });

  } catch (erro) {
    console.error("Erro ao listar contratações:", erro);
    req.session.dadosNotificacao = {
      titulo: "Erro",
      mensagem: "Não foi possível carregar suas contratações.",
      tipo: "error"
    };
    res.redirect("/");
  }
},






pagarContratacao: async (req, res) => {
  try {
    const id = req.params.id;
    const usuarioId = req.session.autenticado.id;

    const [contratacao] = await contratacaoModel.findId(id);

    if(!contratacao) {
      req.session.dadosNotificacao = {
        titulo: "Erro",
        mensagem: "Contratação não encontrada.",
        tipo: "error"
      };
      return res.redirect("/contratacoes");
    }

    if(contratacao.ID_CLIENTE !== usuarioId) {
      return res.redirect("/contratacoes"); // segurança: só contratante pode pagar
    }

    // Transformar tipos
    contratacao.VALOR_TOTAL = Number(contratacao.VALOR_TOTAL);
    contratacao.DATA_ENTREGA = new Date(contratacao.DATA_ENTREGA);

    // Renderizar página de pagamento
    res.render("pages/pagamento-contratacao", {
      contratacao,
      usuario: req.session.autenticado
    });

  } catch (erro) {
    console.error("Erro ao carregar pagamento da contratação:", erro);
    res.redirect("/contratacoes");
  }
},


exibirPagamento: async (req, res) => {
    console.log("Chegou no exibir pagamento.")
  try {
       console.log("Entrou no try do exibir pagamento.")
    const contratacaoId = req.params.id;
   
    const usuarioLogadoId = req.session.autenticado.id;
    console.log("Id do usuario logado:" , usuarioLogadoId)

    // Busca a contratação com dados dos usuários
    const contratacao = await contratacaoModel.findId(contratacaoId);

    if (!contratacao) {
      return res.status(404).send("Contratação não encontrada.");
    }


     console.log("Usuario contratante:  ", contratacao.ID_CLIENTE)
    // Verifica se o usuário logado é o contratante
   if (Number(contratacao.ID_CLIENTE) !== usuarioLogadoId) {
  return res.status(403).send("Você não tem permissão para acessar esta contratação.");
}


    contratacao.VALOR_TOTAL = Number(contratacao.VALOR_TOTAL);
    contratacao.DATA_ENTREGA = new Date(contratacao.DATA_ENTREGA);

    // Renderiza a página passando o objeto com dados
    res.render("pages/pagarcontratacao", { contratacao });

  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao carregar página de pagamento.");
  }
},







confirmarEntrega: async (req, res) => {
  console.log("Chegou no confirmar entrega");

  try {
    const idContratacao = req.params.id;
    const idUsuario = req.session.autenticado.id;

    // 1️⃣ Buscar a contratação
    const contratacao = await contratacaoModel.findById(idContratacao);
    if (!contratacao) {
      req.session.dadosNotificacao = {
        titulo: "Erro",
        mensagem: "Contratação não encontrada.",
        tipo: "error"
      };
      return res.redirect("/contratacoes");
    }

    // 2️⃣ Atualizar confirmação dependendo do tipo de usuário
    if (idUsuario === contratacao.ID_PROFISSIONAL && contratacao.CONFIRMACAO_PROFISSIONAL === 0) {
      await contratacaoModel.updateConfirmacaoProfissional(idContratacao);
    } else if (idUsuario === contratacao.ID_CLIENTE && contratacao.CONFIRMACAO_CLIENTE === 0) {
      await contratacaoModel.updateConfirmacaoCliente(idContratacao);
    } else if (
      (idUsuario !== contratacao.ID_PROFISSIONAL && idUsuario !== contratacao.ID_CLIENTE) ||
      (contratacao.CONFIRMACAO_PROFISSIONAL === 1 && contratacao.CONFIRMACAO_CLIENTE === 1)
    ) {
      req.session.dadosNotificacao = {
        titulo: "Aviso",
        mensagem: "Nenhuma alteração foi realizada.",
        tipo: "info"
      };
      return res.redirect("/contratacoes");
    }

    // 3️⃣ Buscar novamente pra checar se os dois confirmaram
    const atualizada = await contratacaoModel.findById(idContratacao);

    if (
      atualizada.CONFIRMACAO_PROFISSIONAL === 1 &&
      atualizada.CONFIRMACAO_CLIENTE === 1 &&
      atualizada.STATUS !== "FINALIZADA"
    ) {
      await contratacaoModel.updateContratacao({ STATUS: "FINALIZADA", DATA_FINALIZACAO: new Date() }, idContratacao);

      req.session.dadosNotificacao = {
        titulo: "Sucesso",
        mensagem: "Contratação finalizada! Cliente já pode avaliar o profissional.",
        tipo: "success"
      };
      return res.redirect("/contratacoes");
    }

    // 4️⃣ Se já estava finalizada
    if (atualizada.STATUS === "FINALIZADA") {
      req.session.dadosNotificacao = {
        titulo: "Aviso",
        mensagem: "Contratação já finalizada. Cliente pode avaliar o profissional.",
        tipo: "info"
      };
      return res.redirect("/contratacoes");
    }

    req.session.dadosNotificacao = {
      titulo: "Sucesso",
      mensagem: "Confirmação registrada!",
      tipo: "success"
    };
    return res.redirect("/contratacoes");

  } catch (erro) {
    console.error("Erro ao confirmar entrega:", erro);
    req.session.dadosNotificacao = {
      titulo: "Erro",
      mensagem: "Não foi possível confirmar a entrega.",
      tipo: "error"
    };
    return res.redirect("/contratacoes");
  }
},


};

module.exports = contratacoesController;
