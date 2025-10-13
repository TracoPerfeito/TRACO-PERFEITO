var pool = require("../../config/pool_conexoes");

const usuariosModel = {

 
   findAll: async () => {     
    try {
        const [linhas] = await
            pool.query("SELECT * FROM USUARIOS WHERE STATUS_USUARIO = 'ativo'");
    
        console.log(linhas);
        return linhas;
    } catch (error) {
        console.log(error);
        return error;
    }

},




   

    create: async (dadosForm) => {
        try {
            const [linhas, campos] = await pool.query('INSERT INTO USUARIOS SET ?', [dadosForm])
            console.log(linhas);
            console.log(campos);
            
            return linhas;
        } catch (error) {
            console.log(error);
            return null;
        }  
    },


    createProfissional: async (dadosForm) => {
    try {
        // dadosForm é { ID_USUARIO: idUsuario }
        const [linhas, campos] = await pool.query('INSERT INTO USUARIO_PROFISSIONAL SET ?', [dadosForm]);
        console.log(linhas);
        console.log(campos);

        return linhas;
    } catch (error) {
        console.log(error);
        return null;
    }
},

    










    delete: async (id) => {
        try {
            const [linhas,campos] = await pool.query('UPDATE USUARIOS SET STATUS_USUARIO = "inativo"  WHERE ID_USUARIO = ?', [id])
            return linhas;
          
        } catch (error) {
            console.log(error);
            return error;
            
        }  
    },

        findCampoCustom: async (criterioWhere) => {
            try {
                const [resultados] = await pool.query(
                    "SELECT count(*) totalReg FROM USUARIOS WHERE ?",
                    [criterioWhere]
                )
                return resultados[0].totalReg;
            } catch (error) {
                console.log(error);
                return error;
            }
        },



          findUserCustom: async (criterioWhere) => {
            try {
                const [resultados] = await pool.query(
                    "SELECT *  FROM USUARIOS WHERE ?",
                    [criterioWhere]
                )
                return resultados;
            } catch (error) {
                console.log(error);
                return error;
            }
        },


        verSeEAssinante: async (idUsuario) => {
    try {
        const sql = `
            SELECT 1 
            FROM ASSINATURAS
            WHERE ID_USUARIO = ?
              AND STATUS_PAGAMENTO = 'approved'
              AND NOW() BETWEEN DATA_INICIO AND DATA_FIM
            LIMIT 1
        `;
        const [linhas] = await pool.query(sql, [idUsuario]);

        // retorna true se achou algum registro, false se não
        return linhas.length > 0;
    } catch (error) {
        console.error('Erro no model ao verificar assinatura PRO:', error);
        return false; // se der erro, assume que não é assinante
    }
},


findId: async (id) => {
    try {
        const [linhas] = await pool.query(
            'SELECT * FROM USUARIOS WHERE ID_USUARIO = ?',
            [id]
        );

        if (!linhas || linhas.length === 0) {
            throw new Error("Usuário não encontrado");
        }

        linhas[0].img_perfil_banco = linhas[0].FOTO_PERFIL_BANCO_USUARIO
            ? `data:image/jpeg;base64,${linhas[0].FOTO_PERFIL_BANCO_USUARIO.toString('base64')}`
            : null;

        linhas[0].img_capa_banco = linhas[0].IMG_BANNER_BANCO_USUARIO
            ? `data:image/jpeg;base64,${linhas[0].IMG_BANNER_BANCO_USUARIO.toString('base64')}`
            : null;

        return linhas; // mantém array
    } catch (error) {
        console.log(error);
        return [];
    }
},



    findProfissional: async (id) => {
    try {
        const [linhas] = await pool.query(
            'SELECT * FROM USUARIO_PROFISSIONAL WHERE ID_USUARIO = ?',
            [id]
        );
        return linhas;
    } catch (error) {
        console.log(error);
        return error;
    }
},



   
        update: async (camposForm, id) => {
            try {
                const [resultados] = await pool.query(
                    "UPDATE USUARIOS SET ? " +
                    " WHERE ID_USUARIO = ?",
                    [camposForm, id]
                )
                return resultados;
            } catch (error) {
                console.log(error);
                return error;
            }
        },

        
        updateProfissional: async (camposForm, id) => {
            try {
                const [resultados] = await pool.query(
                    "UPDATE USUARIO_PROFISSIONAL SET ? " +
                    " WHERE ID_USUARIO = ?",
                    [camposForm, id]
                )
                return resultados;
            } catch (error) {
                console.log(error);
                return error;
            }
        },













    

    findUserEmail: async (camposForm) => {
            try {
                const [resultados] = await pool.query(
                    "SELECT * FROM USUARIOS WHERE EMAIL_USUARIO = ?",
                    [camposForm.email]
                )
                return resultados;
            } catch (error) {
                console.log(error);
                return error;
            }
        },


    verificarDuplicidade: async (email, celular, nomeUsuario, idAtual) => {
  try {
    const sql = `
      SELECT * FROM USUARIOS 
      WHERE 
        (EMAIL_USUARIO = ? OR CELULAR_USUARIO = ? OR USER_USUARIO = ?)
        AND ID_USUARIO != ?
    `;
    const [result] = await pool.query(sql, [email, celular, nomeUsuario, idAtual]);

    return result.length > 0 ? result : null;
  } catch (error) {
    console.error(error);
    return error; 
  }
},

 findInativoId: async (id) => {
    try {
        const [resultados] = await pool.query(
            `SELECT ID_USUARIO, NOME_USUARIO, USER_USUARIO, TIPO_USUARIO, STATUS_USUARIO
             FROM USUARIOS
             WHERE STATUS_USUARIO = 'pendente' AND ID_USUARIO = ?`,
            [id]
        );
        return resultados;
    } catch (error) {
        console.log(error);
        return error;
    }
},






        



    
   
};
    

module.exports = usuariosModel;