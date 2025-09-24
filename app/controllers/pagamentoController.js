const pagamentoModel = require("../models/pagamentoModel");

const moment = require("moment");

const pagamentoController = {

    gravarPagamento: async (req, res) => {
        console.log("Registrando pagamento...");
        console.log("Recebido no feedback:", req.body, req.query);





        try {
     


            const externalReference = req.query.external_reference || req.body.external_reference;
    
            let idPedido, plano;
       
            if (externalReference.includes("_")) {

                [idPedido, plano] = externalReference.split("_");
             
            } else {
        
                idPedido = externalReference;
     
                plano = "semanal"; // ou algum default
              
            }
     










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



            
    
      req.session.dadosNotificacao = {
         titulo: 'Pagamento confirmado!', 
         mensagem: 'Seu pagamento foi registrado com sucesso. Aproveite todas as funcionalidades do plano Pincel de Ouro!', 
         tipo: 'success' };
  
          res.redirect("/"); 
           
        } catch (error) {
            console.log("Erro no insert:", error);
         
      req.session.dadosNotificacao = {
        titulo: 'Ocorreu um erro.', 
        mensagem: 'Seu pagamento não foi registrado. Entre em contato com a equipe de suporte da plataforma.', 
        tipo: 'error' };
 
         res.redirect("/"); 
        }
    }

};

module.exports = pagamentoController;
