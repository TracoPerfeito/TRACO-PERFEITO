const express = require("express");
const app = express();
const port = 3000;
const env = require("dotenv").config();
const http = require("http");  
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);


const { configurarSocketIo } = require("./app/util/socket");
// Configura o Socket.IO com o servidor HTTP
configurarSocketIo(io);

const session = require("express-session");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));




const injetarLocais = require("./app/middlewares/injetarLocais");
app.use(injetarLocais);



app.use(express.static("./app/public"));


app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const { verificarUsuAutenticado } = require("./app/models/autenticador_middleware");
app.use(verificarUsuAutenticado);

const rotas = require("./app/routes/router");
app.use("/", rotas);

const rotaAdm = require("./app/routes/router-adm");
app.use("/adm", rotaAdm);


server.listen(process.env.APP_PORT, ()=>{
    console.log(`Servidor onLine!\nhttp://localhost:${process.env.APP_PORT}`);
});

