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



    // Ver se deixa aqui ou no admModel...

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



};

module.exports = admModel;