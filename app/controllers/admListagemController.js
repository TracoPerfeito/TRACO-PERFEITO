const moment = require("moment");
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);
var pool = require("../../config/pool_conexoes");
const admModel = require("../models/admModel");
const listarUsuariosPaginados = async (req, res) => {
    res.locals.moment = moment;

    try {
        let pagina = req.query.pagina == undefined ? 1 : parseInt(req.query.pagina);
        let regPagina = 4;
        let inicio = (pagina - 1) * regPagina;

        // 🔹 Obter o total geral de registros
        let totReg = await admModel.totalRegListagem();
        console.log("Total de registros (totReg):", totReg);

        let totPaginas = Math.ceil(totReg / regPagina);
        console.log("Total de páginas (totPaginas):", totPaginas);

        // 🔹 Obter os usuários da página atual
        let results = await admModel.findPageListagem(inicio, regPagina);
        let usuarios = Array.isArray(results) ? results : [];
        console.log("Usuários da página atual:", usuarios);

        // 🔹 Obter totais completos (independente da página)
        let [totais] = await admModel.totalUsuariosPorStatus();
        console.log("Objeto totais recebido do banco:", totais);

        // Criar o objeto paginador
        let paginador = totReg <= regPagina
            ? null
            : { pagina_atual: pagina, total_reg: totReg, total_paginas: totPaginas };

        // Renderizar view com os dados
        res.render("pages/adm-lista-usuarios", { 
            usuarios,
            paginador, 
            totais, 
            autenticado: req.session?.autenticado || false, 
            logado: req.session?.logado || null
        });

    } catch (error) {
        console.log("Erro ao listar usuários paginados:", error);
        res.status(500).render("pages/erro-conexao", {
            mensagem: "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
        });
    }
};













module.exports = {
    listarUsuariosPaginados
};