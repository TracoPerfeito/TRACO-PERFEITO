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


// findId: async (id) => {
//     try {
//         const [linhas] = await pool.query(
//             'SELECT * FROM USUARIOS WHERE ID_USUARIO = ?',
//             [id]
//         );

//         if (!linhas || linhas.length === 0) {
//             throw new Error("Usuário não encontrado");
//         }

//         linhas[0].img_perfil_banco = linhas[0].FOTO_PERFIL_BANCO_USUARIO
//             ? `data:image/jpeg;base64,${linhas[0].FOTO_PERFIL_BANCO_USUARIO.toString('base64')}`
//             : null;

//         linhas[0].img_capa_banco = linhas[0].IMG_BANNER_BANCO_USUARIO
//             ? `data:image/jpeg;base64,${linhas[0].IMG_BANNER_BANCO_USUARIO.toString('base64')}`
//             : null;

//         return linhas; // mantém array
//     } catch (error) {
//         console.log(error);
//         return [];
//     }
// },

findId: async (id) => {
  try {
    const [linhas] = await pool.query(`
      SELECT 
        u.ID_USUARIO,
        u.NOME_USUARIO,
        u.USER_USUARIO,
          u.DATA_NASC_USUARIO,
            u.CELULAR_USUARIO,
              u.EMAIL_USUARIO,
                u.WHATSAPP_USUARIO,
                  u.LINKEDIN_USUARIO,
                    u.PINTEREST_USUARIO,
                      u.INSTAGRAM_USUARIO,
        u.TIPO_USUARIO,
        u.FOTO_PERFIL_BANCO_USUARIO,
        u.IMG_BANNER_BANCO_USUARIO,
        u.DESCRICAO_PERFIL_USUARIO,
        u.DATA_CADASTRO,
        up.ESPECIALIZACAO_DESIGNER,
        IFNULL(s.QUANT_SEGUIDORES, 0) AS QTD_SEGUIDORES,
        IFNULL(p.QUANT_PUBLICACOES, 0) AS QTD_PUBLICACOES,
        IFNULL(port.QTD_PORTFOLIOS, 0) AS QTD_PORTFOLIOS,
        IFNULL(a.MEDIA_NOTA, 0) AS MEDIA_NOTA,
        IFNULL(a.QTD_AVALIACOES, 0) AS QTD_AVALIACOES,
        IFNULL(c.CONTRATOS_FINALIZADOS, 0) AS CONTRATOS_FINALIZADOS
      FROM USUARIOS u
      LEFT JOIN USUARIO_PROFISSIONAL up ON up.ID_USUARIO = u.ID_USUARIO
      LEFT JOIN (
          SELECT ID_SEGUIDO, COUNT(*) AS QUANT_SEGUIDORES
          FROM SEGUINDO
          WHERE STATUS_SEGUINDO = 1
          GROUP BY ID_SEGUIDO
      ) s ON s.ID_SEGUIDO = u.ID_USUARIO
      LEFT JOIN (
          SELECT ID_USUARIO, COUNT(*) AS QUANT_PUBLICACOES
          FROM PUBLICACOES_PROFISSIONAL
          GROUP BY ID_USUARIO
      ) p ON p.ID_USUARIO = u.ID_USUARIO
      LEFT JOIN (
          SELECT ID_USUARIO, COUNT(*) AS QTD_PORTFOLIOS
          FROM PORTFOLIOS
          GROUP BY ID_USUARIO
      ) port ON port.ID_USUARIO = u.ID_USUARIO
      LEFT JOIN (
          SELECT 
              ID_PROFISSIONAL, 
              ROUND(AVG(NOTA), 1) AS MEDIA_NOTA,  
              COUNT(*) AS QTD_AVALIACOES
          FROM AVALIACOES_PROFISSIONAL
          GROUP BY ID_PROFISSIONAL
      ) a ON a.ID_PROFISSIONAL = u.ID_USUARIO
      LEFT JOIN (
          SELECT ID_PROFISSIONAL, COUNT(*) AS CONTRATOS_FINALIZADOS
          FROM CONTRATACOES
          WHERE STATUS = 'FINALIZADA'
          GROUP BY ID_PROFISSIONAL
      ) c ON c.ID_PROFISSIONAL = u.ID_USUARIO
      WHERE u.ID_USUARIO = ?
    `, [id]);

    if (linhas.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    const usuario = linhas[0];

    // Conversão das imagens para base64
    usuario.FOTO_PERFIL_BANCO_USUARIO = usuario.FOTO_PERFIL_BANCO_USUARIO
      ? `data:image/png;base64,${usuario.FOTO_PERFIL_BANCO_USUARIO.toString('base64')}`
      : null;

    usuario.IMG_BANNER_BANCO_USUARIO = usuario.IMG_BANNER_BANCO_USUARIO
      ? `data:image/png;base64,${usuario.IMG_BANNER_BANCO_USUARIO.toString('base64')}`
      : null;
console.log("Resultado model", usuario)
    return usuario; // retorna um objeto único
  } catch (error) {
    console.log("Erro em findId:", error);
    return null;
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






findIdAntigo: async (id) => {
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