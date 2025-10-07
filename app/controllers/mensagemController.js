const mensagemModel = require("../models/mensagemModel");
const usuariosModel = require("../models/usuariosModel");
const { body, validationResult } = require("express-validator");
const moment = require('moment');

const mensagemController = {

    // Validação do formulário de envio
    regrasValidacaoMensagem: [
        body("destinatario_id")
            .isInt().withMessage("Destinatário inválido"),
        body("conteudo")
            .isLength({ min: 1, max: 500 })
            .withMessage("Mensagem deve ter entre 1 e 500 caracteres"),
    ],

    

    // Exibe página de chat com lista de usuários
    mostrarChat: async (req, res) => {

        console.log("Chegou no mostrar Chat!")
        try {

              const destinatarioId = req.query.destinatarioId || null;
             const usuarios = await mensagemModel.encontrarConversas(req.session.autenticado.id);
              console.log("Achou usuarios. quantidade: ", usuarios.length);
              console.log("Usuario que conversaram comigo: ", usuarios)

const naoLidas = await mensagemModel.countMensagensNaoLidas(req.session.autenticado.id);


console.log("Não lidas: ", naoLidas);

            const mensagens = await mensagemModel.findConversas(req.session.autenticado.id);
            
            console.log("mensagens: ", mensagens)
           

            res.render("pages/chat", {
                 usuarios: usuarios,
                destinatarioId: destinatarioId,
                mensagens,
                naoLidas ,
                listaErros: null,
                dadosNotificacao: null,
                usuarioLogado: req.session.autenticado
            });
        } catch (error) {
            console.log(error);
            res.render("pages/chat", {
                usuarios: [],
                mensagens: [],
                naoLidas ,
                destinatarioId: null,
                listaErros: null,
                dadosNotificacao: { titulo: "Erro!", mensagem: "Falha ao carregar chat.", tipo: "error" },
                usuarioLogado: req.session.autenticado
            });
        }
    },


  atualizarbarralateral: async (req, res) => {
    try {
        const userId = req.session.autenticado.id;
        const usuarios = await mensagemModel.encontrarConversas(userId);
        const naoLidas = await mensagemModel.countMensagensNaoLidas(userId);

    

     res.json({ usuarios, naoLidas });

    } catch (err) {
        console.log("Erro ao buscar usuários:", err);
        res.status(500).json({ error: "Não foi possível buscar usuários" });
    }
},



marcarcomolida: async (req, res) => {
    try {
        const userId = req.session.autenticado.id; // usuário logado
        const destinatarioId = req.body.destinatarioId || req.query.destinatarioId; // quem você está marcando como lida

        if (!destinatarioId) {
            return res.status(400).json({ error: "Destinatário não informado" });
        }

        // chama o modelo para marcar como lidas
        await mensagemModel.marcarComoLidas({ idUsuario: destinatarioId, idUsuLogado: userId });

        // busca novamente as conversas para atualizar badges
        const usuarios = await mensagemModel.encontrarConversas(userId);
        const naoLidas = await mensagemModel.countMensagensNaoLidas(userId);

        res.json({ usuarios, naoLidas });
    } catch (err) {
        console.log("Erro ao marcar mensagens como lidas:", err);
        res.status(500).json({ error: "Não foi possível marcar como lida" });
    }
},


    mostrarConversas: async (req, res) => {

        
        console.log("Chegou no mostrar Conversas")
        try {
            const userId = req.session.autenticado.id;
             console.log("userId:", userId);
            const destinatarioId = req.params.id;
             console.log("Destinatario id :", destinatarioId);
            const usuarios = await mensagemModel.encontrarConversas(userId); 
             console.log("usuarios. tamanho:", usuarios.length);
           
         await mensagemModel.marcarComoLidas({ idUsuario: destinatarioId, idUsuLogado: userId });

             // Pega todas as mensagens entre userId e destinatarioId
            const mensagens = await mensagemModel.findConversas(userId, destinatarioId);
            
       const mensagensFormatadas = mensagens.map(msg => ({
    remetente_id: msg.REMETENTE_ID,
    destinatario_id: msg.DESTINATARIO_ID,
    remetente_nome: msg.REMETENTE_NOME, // se o findConversas retorna o nome do remetente
    conteudo: msg.CONTEUDO,
    data_envio: msg.DATA_ENVIO ? moment(msg.DATA_ENVIO).format("YYYY-MM-DDTHH:mm:ss") : null,
    status: msg.STATUS

}));

console.log(mensagensFormatadas)
            // Se a requisição foi feita via fetch (esperando JSON)
            if (req.headers["accept"] && req.headers["accept"].includes("application/json")) {
             
                return res.json(mensagensFormatadas);
            }

            
            // Caso contrário, renderiza a página EJS
            res.render("pages/chat", {
                usuarioLogado: req.session.autenticado,
                usuarios,
                mensagens,
            });
        } catch (error) {
            console.log("Erro ao carregar conversas:", error);
            res.status(500).send("Erro ao carregar conversas");
        }
    },

    salvarMensagemViaSocket: async (data) => {
         console.log("Chegou no salvar msg")
        const novaMensagem = {
            remetente_id: data.remetenteId,
            destinatario_id: data.destinatarioId,
            conteudo: data.conteudo,
            data_envio: new Date(),
        };

         console.log("nova mensagem:", novaMensagem)
        return await mensagemModel.create(novaMensagem);

    },



    
criarChat: async (req, res) => {
  if (!req.session.autenticado?.autenticado) {
    return res.redirect("/login");
  }

  try {
    const idUsuLogado = req.session.autenticado.id;
    const idUsuario = req.query.id; // ID do destinatário vindo do perfil

    
 
    // Busca todos os chats do usuário para a sidebar
    const usuarios = await mensagemModel.encontrarConversas(idUsuLogado);

    // Busca mensagens do chat recém-criado ou existente
    const mensagens = await mensagemModel.findConversas(idUsuLogado, idUsuario);

    res.render("pages/chat", {
      usuarioLogado: req.session.autenticado,
      destinatarioId: idUsuario, // já seleciona a conversa
      usuarios: usuarios || [],
      mensagens,
      listaErros: null,
      dadosNotificacao: null
    });

  } catch (err) {
    console.error(err);
    req.session.dadosNotificacao = {
      titulo: 'Erro',
      mensagem: 'Não foi possível iniciar conversa. Tente novamente mais tarde.',
      tipo: 'error'
    };
    res.redirect("/");
  }
},




abrirChatUsuario: async (req, res) => {
    console.log("Chegou no abrirchatusuario")
  try {
    const usuarioLogado = req.session.usuario;   // Usuário que está logado
    const outroUsuarioId = req.params.idUsuario; // ID do usuário do perfil clicado

    // Pegar dados do outro usuário
    const [outroUsuario] = await pool.query(
      "SELECT ID_USUARIO, NOME_USUARIO, FOTO_PERFIL_BANCO_USUARIO FROM USUARIOS WHERE ID_USUARIO = ?",
      [outroUsuarioId]
    );

    if (!outroUsuario[0]) {
      return res.send("Usuário não encontrado");
    }

    // Pegar mensagens entre os dois usuários
    const mensagens = await mensagemModel.findConversas(usuarioLogado.id, outroUsuarioId);

    // Renderiza view do chat com as mensagens (ou vazia se não houver)
    res.render("pages/chat_com_usuario", {
      usuarioLogado,
      outroUsuario: outroUsuario[0],
      mensagens
    });

  } catch (error) {
    console.log(error);
    res.send("Erro ao abrir chat com usuário");
  }
},






temNovasMsgs: async (req, res) => {
  if (!req.session.autenticado?.autenticado) {
    return res.json({ totalGeral: 0, porRemetente: [] });
  }

  try {
    const resultado = await mensagemModel.countMsgsNovasDetalhado(req.session.autenticado.id);

    // Opcional: já gerar "dadosNotificacao" pronto
    const notificacoes = resultado.porRemetente.map(r => ({
      titulo: `Nova mensagem de ${r.remetenteNome}`,
      mensagem: r.ultimaMensagem,
      remetenteId: r.remetenteId,
      qtdNaoLidas: r.totalNaoLidas,
      data: r.dataUltimaMensagem
    }));

    res.json({
      totalGeral: resultado.totalGeral,
      notificacoes
    });

  } catch (err) {
    console.error("Erro no mensagensController.temNovasMsgs:", err);
    res.status(500).json({ totalGeral: 0, notificacoes: [] });
  }
}

};

module.exports = { mensagemController };
