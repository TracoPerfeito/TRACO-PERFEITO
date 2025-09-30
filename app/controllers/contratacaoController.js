
const notificacoesModel = require("../models/notificacoesModel");

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
    body("ID_CLIENTE")
      .notEmpty()
      .withMessage("ID do cliente é obrigatório."),
    body("ID_PROFISSIONAL")
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
      .withMessage("A data de entrega deve ser uma data válida."),
    body("OBSERVACOES")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Observações podem ter no máximo 1000 caracteres.")
  ],

  // Criar contratação
  criarContratacao: async (req, res) => {
    console.log("Chegou no criar contratação!")
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        req.session.dadosNotificacao = {
          titulo: "Erro ao criar contratação",
          mensagem: "Verifique os campos e tente novamente.",
          tipo: "error"
        };
        return res.redirect("/criar-contratacao");
      }

      const { ID_CLIENTE, ID_PROFISSIONAL, NOME_PROJETO, DESCRICAO, VALOR_TOTAL, DATA_ENTREGA, OBSERVACOES } = req.body;

      const novoRegistro = {
        ID_CLIENTE,
        ID_PROFISSIONAL,
        NOME_PROJETO,
        DESCRICAO,
        VALOR_TOTAL,
        DATA_ENTREGA,
        OBSERVACOES: OBSERVACOES || null,
        STATUS: "AGUARDANDO_CONFIRMACAO"
      };

      const resultado = await contratacaoModel.createContratacao(novoRegistro);

      if (!resultado) {
        req.session.dadosNotificacao = {
          titulo: "Erro",
          mensagem: "Não foi possível criar a contratação.",
          tipo: "error"
        };
        return res.redirect("/criar-contratacao");
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
      await contratacaoModel.updateContratacao({ STATUS: "EM_ANDAMENTO" }, id);

      req.session.dadosNotificacao = {
        titulo: "Contratação aceita",
        mensagem: "O projeto agora está em andamento.",
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
    const aguardandoAceite = contratacoesConvertidas.filter(c => c.STATUS === "AGUARDANDO_CONFIRMACAO");
    const emAndamento = contratacoesConvertidas.filter(c => c.STATUS === "EM_ANDAMENTO");
    const concluidas = contratacoesConvertidas.filter(c => c.STATUS === "CONCLUIDA");
    const canceladas = contratacoesConvertidas.filter(c => c.STATUS === "CANCELADA");

    console.log("Exibindo pagina de contratacoes com os seguintes dados:", contratacoesConvertidas);

    res.render("pages/contratacoes", {
      aguardandoAceite,
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
}

};

module.exports = contratacoesController;
