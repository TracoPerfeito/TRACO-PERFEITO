const moment = require("moment");
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);
var pool = require("../../config/pool_conexoes");
const admModel = require("../models/admModel");

// Definir a função listarUsuariosPaginados
const listarUsuariosPaginados = async (req, res) => {
    res.locals.moment = moment;

    try {
        let pagina = req.query.pagina == undefined ? 1 : parseInt(req.query.pagina);
        let regPagina = 8;
        let inicio = (pagina - 1) * regPagina;

        // Obter o total de registros
        let totReg = await admModel.totalRegListagem();
        let totPaginas = Math.ceil(totReg / regPagina);

        // Obter os usuários paginados
        let results = await admModel.findPageListagem(inicio, regPagina);

        // Garantir que `usuarios` seja sempre um array
        let usuarios = Array.isArray(results) ? results : [];

        // Criar o objeto paginador
        let paginador = totReg <= regPagina
            ? null
            : { pagina_atual: pagina, total_reg: totReg, total_paginas: totPaginas };

       

            console.log(usuarios)
        
 console.log("Usuários encontrados:", results.map(user => ({
    ID_USUARIO: user.ID_USUARIO,
    NOME_USUARIO: user.NOME_USUARIO,
    FOTO_PERFIL: user.FOTO_PERFIL_BANCO_USUARIO,
   
    DATA_CADASTRO: user.DATA_CADASTRO,
  })));
   // Renderizar a view com os dados

        res.render("pages/adm-lista-usuarios", { 
            usuarios: usuarios || [], 
            paginador: paginador || null, 
            autenticado: req.session?.autenticado || false, 
            logado: req.session?.logado || null
    })

} catch (error) {
        console.log("Erro ao listar usuários paginados:", error);
        res.status(500).render("pages/erro-conexao", {
            mensagem:
                "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
        });
    };


}















module.exports = {
    listarUsuariosPaginados
};