const pagamentoModel = require("../models/pagamentoModel");

const moment = require("moment");

const pagamentoController = {

   gravarPagamento: async (req, res) => {
    console.log("Registrando pagamento...");
    console.log("Recebido no feedback:", req.body, req.query);

    try {
 const externalReference = req.body.external_reference || req.query.external_reference;
const [idPedido, plano] = externalReference.split("_");

      const dataInicio = moment();
let dataFim;

switch (plano) {
    case "semanal":
        dataFim = dataInicio.clone().add(7, "days");
        break;
    case "mensal":
        dataFim = dataInicio.clone().add(1, "month");
        break;
    case "anual":
        dataFim = dataInicio.clone().add(1, "year");
        break;
    default:
        dataFim = null;
}


        const camposJsonPagamento = {
            ID_USUARIO: req.session.autenticado.id,
            PLANO: plano,
            STATUS_PAGAMENTO: req.query.status || "pendente",
            ID_PAGAMENTO: req.query.preference_id,
            DATA_INICIO: dataInicio.format("YYYY-MM-DD HH:mm:ss"),
            DATA_FIM: dataFim ? dataFim.format("YYYY-MM-DD HH:mm:ss") : null
        };

        console.log("Dados do pagamento a serem registrados:", camposJsonPagamento);

        const create = await pagamentoModel.createAssinatura(camposJsonPagamento);

        console.log("Pagamento registrado com sucesso, ID:", create.insertId);
        res.json({
            mensagem: "Pagamento registrado com sucesso!",
            id_pagamento: create.insertId
        });
    } catch (error) {
        console.log("Erro no insert:", error);
        res.status(500).json({ erro: "Erro ao registrar pagamento" });
    }
}

};

module.exports =  pagamentoController ;
