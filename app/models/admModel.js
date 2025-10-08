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
                "SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, USER_USUARIO, TIPO_USUARIO, STATUS_USUARIO, FOTO_PERFIL_BANCO_USUARIO FROM USUARIOS "
            );


            const usuarios = linhas.map(p => {
                return {
                  ...p,
                  FOTO_PERFIL_BANCO_USUARIO: p.FOTO_PERFIL_BANCO_USUARIO
                    ? `data:image/png;base64,${p.FOTO_PERFIL_BANCO_USUARIO.toString('base64')}`
                    : null
                 
                };
              });
          
              return usuarios;
        } catch (error) {
            console.log(error);
            return error; //ou []
        }
    },



    listarUsuariosPorTipo: async (tipo) => {
        try {
            const [linhas] = await pool.query(
                "SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, USER_USUARIO, TIPO_USUARIO, STATUS_USUARIO, FOTO_PERFIL_BANCO_USUARIO FROM USUARIOS WHERE TIPO_USUARIO = ?",
                [tipo]
            );
            return linhas;
        } catch (error) {
            console.log(error);
            return []; //ou error
        }
    },



    //TENTATIVA DE PAGINAÇÃO

    findPageListagem: async (inicio, total) => {
        try {
            const [linhas] = await pool.query(
                "SELECT * FROM USUARIOS LIMIT ?, ?",
                [inicio, total]
            );
            
            const usuarios = linhas.map(p => {
                return {
                  ...p,
                  FOTO_PERFIL_BANCO_USUARIO: p.FOTO_PERFIL_BANCO_USUARIO
                    ? `data:image/png;base64,${p.FOTO_PERFIL_BANCO_USUARIO.toString('base64')}`
                    : null
                 
                };
              });
          
              return usuarios;



        } catch (error) {
            console.log(error);
            return []; // Retorna um array vazio em caso de erro
        }
    },

    totalRegListagem: async () => {
        try {
            const [linhas] = await pool.query(
                "SELECT COUNT(*) AS TOTAL FROM USUARIOS"
            );
            return linhas[0].TOTAL; // Retorna o valor total diretamente
        } catch (error) {
            console.log(error);
            return 0; // Retorna 0 em caso de erro
        }
    },

    //LISTAGEM DAS DENÚNCIAS 

    listarDenunciasComentarios: async () => {
        try {
            const [denuncias_comentarios] = await pool.query(
                `SELECT 
                    dc.ID_DENUNCIA, 
                    dc.ID_USUARIO_DENUNCIANTE, 
                    dc.ID_COMENTARIO, 
                    dc.MOTIVO, 
                    dc.STATUS, 
                    dc.DATA_DENUNCIA,
                    c.ID_USUARIO AS ID_USUARIO_COMENTARIO,
                    c.CONTEUDO_COMENTARIO,
                    c.DATA_COMENTARIO
                FROM DENUNCIAS_COMENTARIOS dc
                INNER JOIN COMENTARIOS c ON dc.ID_COMENTARIO = c.ID_COMENTARIO`
            );
            return denuncias_comentarios;
    
        } catch (error) {
            console.log(error);
            return []; // ou retorna error
        }
    },
    
    listarDenunciasUsuarios: async () => {
        try{
            const[denuncias_usuarios] = await pool.query(
                "SELECT ID_DENUNCIA, ID_USUARIO_DENUNCIANTE, ID_USUARIO_DENUNCIADO, MOTIVO, STATUS, DATA_DENUNCIA"
            );
            return denuncias_usuarios;
            
        } catch (error) {
            console.log(error);
            return[];
        }
    },



 salvarMsgQuemSomos: async (dados) => {
        try{
                const [result] = await pool.query(
                "INSERT INTO MENSAGENS_QUEM_SOMOS SET ?",
                [dados]
            );
             console.log("Mensagem salva:", result);
            return result;
        }catch (error){
     
            console.log("Ocorreu um erro no model:", error);
            throw error;
        }
    },


};

module.exports = admModel;