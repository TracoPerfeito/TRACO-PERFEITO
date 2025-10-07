const { mensagemController } = require("../controllers/mensagemController");


const usuariosConectados = {};

function configurarSocketIo(io) {
  io.on("connection", (socket) => {
    console.log("Usuário conectado:", socket.id);

    socket.on("login", (userId) => {
      usuariosConectados[userId] = socket.id;
      console.log("Usuário logado no socket:", userId);
    });

    socket.on("privateMessage", async (data) => {
      try {
        await mensagemController.salvarMensagemViaSocket(data);

        const destinatarioSocketId = usuariosConectados[data.destinatarioId];
        if (destinatarioSocketId) {
          io.to(destinatarioSocketId).emit("privateMessage", {
            remetenteId: data.remetenteId,
            conteudo: data.conteudo,
            data_envio: data.data_envio,
            remetenteNome: data.remetenteNome
          });
        }
      } catch (error) {
        console.error("Erro ao processar mensagem via socket:", error);
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of Object.entries(usuariosConectados)) {
        if (socketId === socket.id) {
          delete usuariosConectados[userId];
          console.log(`Usuário ${userId} desconectado`);
          break;
        }
      }
    });
  });
}

module.exports = { configurarSocketIo, usuariosConectados };
