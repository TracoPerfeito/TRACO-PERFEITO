// socket.js
const { Server } = require("socket.io");

let io;

function initSocket(server) {
  io = new Server(server);

  io.on("connection", (socket) => {
    console.log("Usuário conectado:", socket.id);

    socket.on("registrar_usuario", (usuarioId) => {
      socket.join(usuarioId); 
      console.log(`Usuário ${usuarioId} entrou na room ${usuarioId}`);
    });

    socket.on("disconnect", () => {
      console.log("Usuário desconectou:", socket.id);
      
    });
  });

  return io;
}

function getIo() {
  if (!io) throw new Error("Socket.io não foi inicializado!");
  return io;
}

module.exports = { initSocket, getIo };
