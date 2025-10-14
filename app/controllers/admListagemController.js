const moment = require("moment");
const bcrypt = require("bcryptjs");
const admModel = require("../models/admModel");

const admListagemController = {
  // 📘 LISTAGEM GERAL DE USUÁRIOS (com paginação)
  listarUsuariosPaginados: async (req, res) => {
    res.locals.moment = moment;

    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const regPagina = 4;
      const inicio = (pagina - 1) * regPagina;

      // 🔹 Total de registros
      const totReg = await admModel.totalRegListagem();
      const totPaginas = Math.ceil(totReg / regPagina);

      // 🔹 Usuários da página atual
      const results = await admModel.findPageListagem(inicio, regPagina);
      const usuarios = Array.isArray(results) ? results : [];

      // 🔹 Totais gerais
      const [totais] = await admModel.totalUsuariosPorStatus();

      const paginador = totReg > regPagina
        ? { pagina_atual: pagina, total_reg: totReg, total_paginas: totPaginas }
        : null;

      res.render("pages/adm-lista-usuarios", { 
        usuarios,
        paginador, 
        totais, 
        autenticado: req.session?.autenticado || false, 
        logado: req.session?.logado || null
      });

    } catch (error) {
      console.error("Erro ao listar usuários paginados:", error);
      res.status(500).render("pages/erro-conexao", {
        mensagem: "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
      });
    }
  },

  // 💰 LISTAGEM DE ASSINANTES (com paginação e totais financeiros)
  listarUsuariosAssinantesPaginados: async (req, res) => {
    res.locals.moment = moment;

    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const regPagina = 4;
      const inicio = (pagina - 1) * regPagina;

      // 🔹 Total de registros
      const totReg = await admModel.totalRegListagemAssinantes();
      const totPaginas = Math.ceil(totReg / regPagina);
      console.log("total paginas", totPaginas)

      // 🔹 Assinantes da página atual
      const results = await admModel.findPageListagemAssinantes(inicio, regPagina);
      const usuarios = Array.isArray(results) ? results : [];
      console.log("total usuarios", usuarios)


     // 🔹 Totais (ex: planos ativos, faturamento etc)
const totais = await admModel.contagemAssinantesPorPlano();


      // 🔹 Ganhos totais do admin (soma de pagamentos)
      const totalGanhos = await admModel.totalGanhosAssinaturas();

      const paginador = totReg > regPagina
        ? { pagina_atual: pagina, total_reg: totReg, total_paginas: totPaginas }
        : null;

        console.log("totais", totais)
        console.log("total ganhos", totalGanhos)



      res.render("pages/adm-assinantes", { 
        usuarios,
        paginador, 
        totais,
        totalGanhos, 
        autenticado: req.session?.autenticado || false, 
        logado: req.session?.logado || null
      });

    } catch (error) {
      console.error("Erro ao listar assinantes paginados:", error);
      res.status(500).render("pages/erro-conexao", {
        mensagem: "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
      });
    }
  },
};

module.exports = admListagemController;
