const pagamentoModel = require("../models/pagamentoModel");
const notificacoesModel = require("../models/notificacoesModel");


const moment = require("moment-timezone");

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
                DATA_INICIO: moment(dataInicio).tz("America/Sao_Paulo").format("YYYY-MM-DD HH:mm:ss"),
                DATA_FIM: dataFim ? moment(dataFim).tz("America/Sao_Paulo").format("YYYY-MM-DD HH:mm:ss") : null

            };

            console.log("Dados do pagamento a serem registrados:", camposJsonPagamento);

            const create = await pagamentoModel.createAssinatura(camposJsonPagamento);

            console.log("Pagamento registrado com sucesso, ID:", create.insertId);


            
       // Criando notificação
const idNotificacao = await notificacoesModel.criarNotificacao({
  idUsuario: req.session.autenticado.id,
  titulo: "🎉 Pagamento aprovado com sucesso!",
  preview: `✅ Seu pagamento foi confirmado, ${req.session.autenticado.nome_usuario}. Agora você já pode aproveitar todos os benefícios do Plano Pincel de Ouro!✨`,

  conteudo: `
    <section class="payment-banner">
      <section class="payment-content">
        <h1>🎉 Pagamento aprovado, ${req.session.autenticado.nome_usuario}! ✅</h1>
        <p>Obrigado por confiar no Traço Perfeito! Seu pagamento foi processado com sucesso e sua conta já foi atualizada. 🙌</p>
        <p>Aproveite agora mesmo as funcionalidades exclusivas para destacar seus trabalhos e se conectar a novos clientes! 💼✨</p>
        
    
      </section>
    </section>
  `,

  categoria: "PAGAMENTO"
});

console.log("Notificação criada com ID:", idNotificacao);

            
     


            
    
      req.session.dadosNotificacao = {
         titulo: 'Pagamento confirmado!', 
         mensagem: 'Seu pagamento foi registrado com sucesso. Aproveite todas as funcionalidades do plano Pincel de Ouro!', 
         tipo: 'success' };
  
          res.redirect("/"); 
           
        } catch (error) {
            console.log("Erro no insert:", error);

                            try {
                await notificacoesModel.criarNotificacao({
                    idUsuario: req.session.autenticado.id,
                    titulo: "⚠️ Erro no pagamento",
                    preview: `❌ Olá, ${req.session.autenticado.nome_usuario}! Ocorreu um problema ao processar seu pagamento. Verifique os dados ou tente novamente.`,

                    conteudo: `
                    <section class="payment-error-banner">
                        <section class="payment-error-content">
                        <h1>⚠️ Ocorreu um problema no pagamento</h1>
                        <p>Infelizmente não conseguimos concluir a transação. 😕</p>
                        <p>Por favor, revise as informações de pagamento e tente novamente. Se o problema persistir, entre em contato com o suporte. 💬</p>
                        
                        <a href="/suporte" class="payment-error-button">Entrar em contato com o suporte</a>
                        </section>
                    </section>
                    `,
                    categoria: "PAGAMENTO-ERRO"
                });

                console.log("✅ Notificação de erro registrada com sucesso!");

                } catch (erro) {
                console.error("⚠️ Falha ao salvar notificação de erro:", erro.message);
           
                }

      req.session.dadosNotificacao = {
        titulo: 'Ocorreu um erro.', 
        mensagem: 'Seu pagamento não foi registrado. Entre em contato com a equipe de suporte da plataforma.', 
        tipo: 'error' };
 
         res.redirect("/"); 
        }
    },


gravarPagamentoContratacao: async (req, res) => {
    console.log("Registrando pagamento de contratação...");
    console.log("Recebido no feedback:", req.body, req.query);

    try {
        // Pegar dados do feedback
        const externalReference = req.query.external_reference || req.body.external_reference;
        const preferenceId = req.query.preference_id || req.body.preference_id;
        const statusPagamento = req.query.status || "pendente";

        // Supondo que externalReference seja apenas o ID da contratação
        const idContratacao = Number(externalReference);
        if (!idContratacao) throw new Error("ID da contratação inválido.");

        // Buscar dados da contratação (opcional, para verificar valor total)
        const contratacao = await contratacaoModel.findId(idContratacao);
        if (!contratacao) return res.status(404).send("Contratação não encontrada.");

        // Criar registro de pagamento
        const camposPagamento = {
            ID_CONTRATACAO: idContratacao,
            ID_PAGAMENTO_MERCADO_PAGO: preferenceId,
            STATUS_PAGAMENTO: statusPagamento,
            VALOR_PAGO: Number(req.query.transaction_amount || contratacao.VALOR_TOTAL), // ou passar valor no external_reference
            DATA_PAGAMENTO: new Date()
        };

        const pagamentoCriado = await pagamentoModel.createPagamentoContratacao(camposPagamento);
        console.log("Pagamento registrado com sucesso:", pagamentoCriado.insertId);

        // Atualizar campo PAGO da contratação se aprovado
        if (statusPagamento === "approved") {
            await contratacaoModel.atualizarPago(idContratacao, "sim");
        }

        // Criar notificação pro cliente
        await notificacoesModel.criarNotificacao({
            idUsuario: req.session.autenticado.id,
            titulo: "🎉 Pagamento aprovado!",
            preview: `✅ Pagamento da contratação "${contratacao.NOME_PROJETO}" confirmado com sucesso.`,
            conteudo: `<p>O pagamento de R$${camposPagamento.VALOR_PAGO.toFixed(2)} foi aprovado.</p>`,
            categoria: "PAGAMENTO"
        });

        req.session.dadosNotificacao = {
            titulo: 'Pagamento confirmado!',
            mensagem: 'Seu pagamento foi registrado com sucesso.',
            tipo: 'success'
        };

        res.redirect("/"); 
    } catch (error) {
        console.error("Erro ao registrar pagamento:", error);

        req.session.dadosNotificacao = {
            titulo: 'Ocorreu um erro.',
            mensagem: 'Seu pagamento não foi registrado. Entre em contato com a equipe de suporte.',
            tipo: 'error'
        };

        res.redirect("/"); 
    }
}



};

module.exports = pagamentoController;
