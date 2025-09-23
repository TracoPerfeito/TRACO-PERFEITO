const pagamentoModel = require("../models/pagamentoModel");

const moment = require("moment");

const pagamentoController = {

   gravarPagamento: async (req, res) => {
    console.log("Registrando pagamento...");
    console.log("Recebido no feedback:", req.body, req.query);

    try {
        const idPedido = req.query.external_reference; 
        const camposJsonPagamento = {
            ID_PEDIDO: idPedido,
            ID_USUARIO: req.session.autenticado.id,
            METODO: req.query.payment_type,
            VALOR: req.query.preference_id, 
            STATUS: req.query.status || "pendente",
            DATA: moment().format("YYYY-MM-DD HH:mm:ss")
        };

        console.log("Dados do pagamento a serem registrados:", camposJsonPagamento);

        const create = await pagamentoModel.create(camposJsonPagamento);

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
