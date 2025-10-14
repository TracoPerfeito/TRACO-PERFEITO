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


 contarCadastrosRecentes: async () => {
  try{const [resultado] = await pool.query(`
    WITH dias AS (
      SELECT CURDATE() AS data
      UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 1 DAY)
      UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 2 DAY)
      UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 3 DAY)
      UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 4 DAY)
      UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 5 DAY)
      UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    )
    SELECT 
      DATE_FORMAT(d.data, '%Y-%m-%d') AS data,
      COUNT(u.ID_USUARIO) AS total
    FROM dias d
    LEFT JOIN usuarios u ON DATE(u.DATA_CADASTRO) = d.data
    GROUP BY d.data
    ORDER BY d.data ASC;
  `);
  return resultado;
  }catch(error){
     console.log(error);
        return error; 
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
                c.ID_USUARIO AS ID_USUARIO_DENUNCIADO,
                c.CONTEUDO_COMENTARIO,
                c.DATA_COMENTARIO
            FROM DENUNCIAS_COMENTARIOS dc
            INNER JOIN COMENTARIOS c ON dc.ID_COMENTARIO = c.ID_COMENTARIO`
        );
        return denuncias_comentarios;
    } catch (error) {
        console.log(error);
        return [];
    }
},
    
    listarDenunciasUsuarios: async () => {
        try{
            const [denuncias_usuarios] = await pool.query(
                "SELECT ID_DENUNCIA, ID_USUARIO_DENUNCIANTE, ID_USUARIO_DENUNCIADO, MOTIVO, STATUS, DATA_DENUNCIA FROM DENUNCIAS_USUARIOS ORDER BY DATA_DENUNCIA DESC"
            );
            return denuncias_usuarios;
        } catch (error) {
            console.log(error);
            return [];
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

    // SOBRE A DENUNCIA DE COMENTARIO
    listarPenalidades: async () => {
        try {
            const [rows] = await pool.query(
                "SELECT ID_PENALIDADE, NOME_PENALIDADE FROM TIPOS_PENALIDADES ORDER BY NOME_PENALIDADE"
            );
            return rows;
        } catch (err) {
            console.error("Erro listarPenalidades:", err);
            return [];
        }
    },

    // cria penalidade, notifica usuário e loga resultado em JSON
    aplicarPenalidade: async (idUsuario, idTipoPenalidade, motivo, dataFim) => {
        try {
            // normaliza dataFim para MySQL DATETIME ou null
            let dataFimValue = null;
            let status = 'ativa';
            if (dataFim) {
                const fimDate = new Date(dataFim);
                if (!isNaN(fimDate.getTime())) {
                    const yyyy = fimDate.getFullYear();
                    const mm = String(fimDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(fimDate.getDate()).padStart(2, '0');
                    const hh = String(fimDate.getHours()).padStart(2, '0');
                    const mi = String(fimDate.getMinutes()).padStart(2, '0');
                    const ss = String(fimDate.getSeconds()).padStart(2, '0');
                    dataFimValue = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
                    if (new Date(dataFim) < new Date()) status = 'expirada';
                }
            }

            const [insertResult] = await pool.query(
                `INSERT INTO PENALIDADES_USUARIOS (ID_USUARIO, ID_PENALIDADE, MOTIVO_PENALIDADE, DATA_INICIO, DATA_FIM, STATUS)
                 VALUES (?, ?, ?, NOW(), ?, ?)`,
                [idUsuario, idTipoPenalidade, motivo, dataFimValue, status]
            );

            // pega nome do tipo para decidir comportamento
            const [tipoRows] = await pool.query(
                `SELECT NOME_PENALIDADE FROM TIPOS_PENALIDADES WHERE ID_PENALIDADE = ?`,
                [idTipoPenalidade]
            );
            const nomeTipo = (tipoRows[0] && tipoRows[0].NOME_PENALIDADE || '').toUpperCase();

            // se for SUSPENSÃO, bloqueia o usuário
            if (nomeTipo === 'SUSPENSÃO') {
                await pool.query(
                    `UPDATE USUARIOS SET STATUS_USUARIO = 'suspenso' WHERE ID_USUARIO = ?`,
                    [idUsuario]
                );
            }

            // tenta criar notificação (se tabela existir)
            try {
                const titulo = nomeTipo === 'SUSPENSÃO' ? 'Você foi suspenso' : 'Advertência aplicada';
                const mensagem = nomeTipo === 'SUSPENSÃO'
                    ? `Você foi suspenso até ${dataFimValue || 'indefinidamente'}. Motivo: ${motivo}`
                    : `Advertência: ${motivo}`;
                await pool.query(
                    `INSERT INTO NOTIFICACOES (ID_USUARIO, TITULO, MENSAGEM, DATA_CRIACAO)
                     VALUES (?, ?, ?, NOW())`,
                    [idUsuario, titulo, mensagem]
                );
            } catch (nErr) {
                // notificação é opcional — loga aviso em JSON
                console.warn(JSON.stringify({
                    event: 'notificacao_nao_criada',
                    user: idUsuario,
                    reason: nErr.message || nErr
                }));
            }

            console.log(JSON.stringify({
                event: 'penalidade_aplicada',
                sucesso: true,
                id_penalidade_usuario: insertResult.insertId,
                id_usuario: idUsuario,
                tipo: nomeTipo,
                data_fim: dataFimValue,
                timestamp: new Date().toISOString()
            }));

            return insertResult.insertId;
        } catch (err) {
            console.error(JSON.stringify({
                event: 'erro_aplicar_penalidade',
                sucesso: false,
                id_usuario: idUsuario,
                error: err.message || err,
                timestamp: new Date().toISOString()
            }));
            throw err;
        }
    },

    // checa se usuário está suspenso por penalidade ativa do tipo SUSPENSÃO
    verificarBloqueioUsuario: async (idUsuario) => {
        try {
            const [rows] = await pool.query(
                `SELECT pu.ID_PENALIDADE_USUARIO, pu.DATA_FIM, tp.NOME_PENALIDADE
                 FROM PENALIDADES_USUARIOS pu
                 JOIN TIPOS_PENALIDADES tp ON pu.ID_PENALIDADE = tp.ID_PENALIDADE
                 WHERE pu.ID_USUARIO = ? AND pu.STATUS = 'ativa' AND UPPER(tp.NOME_PENALIDADE) = 'SUSPENSÃO'
                 ORDER BY pu.DATA_INICIO DESC
                 LIMIT 1`,
                [idUsuario]
            );

            if (!rows || !rows.length) return { bloqueado: false };

            const r = rows[0];
            return {
                bloqueado: true,
                id_penalidade_usuario: r.ID_PENALIDADE_USUARIO,
                data_fim: r.DATA_FIM,
                tipo: r.NOME_PENALIDADE
            };
        } catch (err) {
            console.error(JSON.stringify({
                event: 'erro_verificar_bloqueio',
                id_usuario: idUsuario,
                error: err.message || err,
                timestamp: new Date().toISOString()
            }));
            // Em caso de erro, não bloqueia por segurança (mas loga)
            return { bloqueado: false, error: err.message || err };
        }
    },

    descartarDenuncia: async (idDenuncia, tabela) => {
        try {
            // Mapeamento simples de status aceitáveis por tabela
            const mapping = {
                DENUNCIAS_COMENTARIOS: 'resolvido',
                DENUNCIAS_PUBLICACOES: 'resolvido',
                DENUNCIAS_USUARIOS: 'resolvido',
                DENUNCIAS_PROJETOS: 'rejeitada'
            };
            const status = mapping[tabela] || 'resolvido';
            const sql = `UPDATE ${tabela} SET STATUS = ? WHERE ID_DENUNCIA = ?`;
            const [result] = await pool.query(sql, [status, idDenuncia]);
            return result.affectedRows;
        } catch (err) {
            console.error("Erro descartarDenuncia:", err);
            throw err;
        }
    },

    // lista denúncias de usuários com detalhes dos usuários envolvidos
    listarDenunciasUsuariosDetalhadas: async () => {
        try {
            const [denuncias] = await pool.query(`
                SELECT 
                    du.ID_DENUNCIA,
                    du.ID_USUARIO_DENUNCIANTE,
                    du.ID_USUARIO_DENUNCIADO,
                    du.MOTIVO,
                    du.STATUS,
                    du.DATA_DENUNCIA,
                    u1.NOME_USUARIO AS NOME_DENUNCIANTE,
                    u2.NOME_USUARIO AS NOME_DENUNCIADO
                FROM DENUNCIAS_USUARIOS du
                JOIN USUARIOS u1 ON du.ID_USUARIO_DENUNCIANTE = u1.ID_USUARIO
                JOIN USUARIOS u2 ON du.ID_USUARIO_DENUNCIADO = u2.ID_USUARIO
                ORDER BY du.DATA_DENUNCIA DESC
            `);
            return denuncias;
        } catch (error) {
            console.error("Erro ao listar denúncias de usuários:", error);
            return [];
        }
    },

    // atualiza o status de uma denúncia de usuário
    atualizarStatusDenunciaUsuario: async (idDenuncia, novoStatus) => {
        try {
            const [result] = await pool.query(
                "UPDATE DENUNCIAS_USUARIOS SET STATUS = ? WHERE ID_DENUNCIA = ?",
                [novoStatus, idDenuncia]
            );
            return result.affectedRows;
        } catch (error) {
            console.error("Erro ao atualizar status da denúncia:", error);
            throw error;
        }
    },

    // suspende o usuário denunciado
    suspenderUsuarioDenunciado: async (idUsuario) => {
        try {
            const [result] = await pool.query(
                "UPDATE USUARIOS SET STATUS_USUARIO = 'suspenso' WHERE ID_USUARIO = ?",
                [idUsuario]
            );
            return result.affectedRows;
        } catch (error) {
            console.error("Erro ao suspender usuário:", error);
            throw error;
        }
    },

    
    







};

module.exports = admModel;