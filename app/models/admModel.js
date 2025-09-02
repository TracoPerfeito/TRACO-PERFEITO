//FAZER TUDOOOOO

var pool = require("../../config/pool_conexoes");

const admModel = {

    findUserEmail: async (dadosForm) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM USUARIOS WHERE EMAIL_USUARIO = ? AND TIPO_USUARIO = 'administrador'",
                [dadosForm.email]
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }   
    },

    findAll: async () => {
        try {
            const [linhas] = await pool.query(
                "SELECT * FROM USUARIOS WHERE STATUS_USUARIO = 'ativo' AND TIPO_USUARIO = 'administrador'"
            );
            return linhas;
        }catch (error) {
            console.log(error);
            return error;
        }
    },




    contarUsuarios: async () => {
    try {
        const [resultados] = await pool.query(
        "SELECT COUNT(*) AS total FROM USUARIOS");
        return resultados[0].total;
    } catch(error) {
        console.log(error);
        return error; //ou tentar colocar 0 
    }
 },


    contarUsuariosPorTipo: async (tipo) => {
    try {
        const [resultados] = await pool.query(
        "SELECT COUNT(*) AS total FROM USUARIOS WHERE TIPO_USUARIO = ?", [tipo]);
        return resultados[0].total;
    } catch(error) {
        console.log(error);
        return error; //ou tentar colocar 0
    }
 },


    listarUsuarios: async () => {
        try {
            const [linhas] = await pool.query(
                "SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, USER_USUARIO, TIPO_USUARIO, STATUS_USUARIO, FOTO_PERFIL_PASTA_USUARIO FROM USUARIOS "
            );
            return linhas;
        } catch (error) {
            console.log(error);
            return error; //ou []
        }
    },



    listarUsuariosPorTipo: async (tipo) => {
        try {
            const [linhas] = await pool.query(
                "SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, USER_USUARIO, TIPO_USUARIO, STATUS_USUARIO, FOTO_PERFIL_PASTA_USUARIO FROM USUARIOS WHERE STATUS_USUARIO = 'ativo' AND TIPO_USUARIO = ?",
                [tipo]
            );
            return linhas;
        } catch (error) {
            console.log(error);
            return error; //ou []
        }
    },






};

module.exports = admModel;