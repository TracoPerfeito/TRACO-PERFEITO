var pool = require("../../config/pool_conexoes");

const pagamentoModel = {
    // Buscar todas as assinaturas
    findAll: async () => {
        try {
            const [resultados] = await pool.query("SELECT * FROM ASSINATURAS");
            return resultados;
        } catch (error) {
            return error;
        }
    },

    // Buscar assinatura por ID
    findId: async (id) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM ASSINATURAS WHERE ID_ASSINATURA = ?",
                [id]
            );
            return resultados;
        } catch (error) {
            return error;
        }
    },

    // Buscar assinatura de um usuário
    findByUsuario: async (usuarioId) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM ASSINATURAS WHERE USUARIO_ID = ?",
                [usuarioId]
            );
            return resultados;
        } catch (error) {
            return error;
        }
    },

   createAssinatura: async (camposJson) => {
    try {
        const [result] = await pool.query(
            "INSERT INTO ASSINATURAS SET ?",
            [camposJson]
        );
        console.log("Resultado do insert:", result); 
        return result; 
    } catch (error) {
        console.log("Erro no insert:", error);
        throw error;
    }
},



    // Atualizar assinatura existente (por usuário)
    updateAssinatura: async (camposJson, usuarioId) => {
        try {
            const [resultados] = await pool.query(
                "UPDATE ASSINATURAS SET ? WHERE USUARIO_ID = ?",
                [camposJson, usuarioId]
            );
            return resultados;
        } catch (error) {
            return error;
        }
    },

    // Deletar (ou inativar) assinatura
    deleteAssinatura: async (id) => {
        try {
            const [resultados] = await pool.query(
                "DELETE FROM ASSINATURAS WHERE ID_ASSINATURA = ?",
                [id]
            );
            return resultados;
        } catch (error) {
            return error;
        }
    },

    
};

module.exports = pagamentoModel; 
