// controllers/pagamentoController.js
const { PagamentoModel } = require("../models/pagamentoModel");
const moment = require("moment");

const pagamentoController = {

    gravarPagamento: async (req, res) => {
        console.log("Registrando pagamento...");
        console.log("Recebido no feedback:", req.body, req.query);

        try {


            const camposJsonPagamento = {
                ID_PEDIDO: req.body.id_pedido,               // vincula com o pedido
                ID_USUARIO: req.session.autenticado.id,      // usuário logado
                METODO: req.body.metodo,                     // "Cartão", "PIX", etc.
                VALOR: req.body.valor,                       // total
                STATUS: req.body.status || "pendente", 
                DATA: moment().format("YYYY-MM-DD HH:mm:ss")
            };

            console.log("Dados do pagamento a serem registrados:", camposJsonPagamento);
            // cria registro na tabela PAGAMENTO
            const create = await PagamentoModel.create(camposJsonPagamento);

            console.log("Pagamento registrado com sucesso, ID:", create.insertId);
            res.json({
                mensagem: "Pagamento registrado com sucesso!",
                id_pagamento: create.insertId
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ erro: "Erro ao registrar pagamento" });
        }
    }
};

module.exports =  pagamentoController ;
