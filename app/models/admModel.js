//FAZER TUDOOOOO

var pool = require("../../config/pool_conexoes");
const { listarDenunciasPublicacoes } = require("./denunciasModel");

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


 totalUsuariosPorStatus: async () => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN STATUS_USUARIO = 'ativo' THEN 1 ELSE 0 END) AS ativos,
                SUM(CASE WHEN STATUS_USUARIO = 'pendente' THEN 1 ELSE 0 END) AS pendentes,
                SUM(CASE WHEN STATUS_USUARIO = 'inativo' THEN 1 ELSE 0 END) AS inativos,
                SUM(CASE WHEN STATUS_USUARIO = 'suspenso' THEN 1 ELSE 0 END) AS suspensos
            FROM USUARIOS
        `);
        return rows;
    } catch (error) {
        console.log("Erro ao contar usuários por status:", error);
        return [{ total: 0, ativos: 0, pendentes: 0, inativos: 0, suspensos: 0 }];
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
    LEFT JOIN USUARIOS u ON DATE(u.DATA_CADASTRO) = d.data
    GROUP BY d.data
    ORDER BY d.data ASC;
  `);
  return resultado;
  }catch(error){
     console.log(error);
        return error; 
  }
},

contarCadastrosSemanaAnterior: async () => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE(DATA_CADASTRO) AS data, COUNT(*) AS total
      FROM USUARIOS
      WHERE DATA_CADASTRO >= CURDATE() - INTERVAL 14 DAY
        AND DATA_CADASTRO < CURDATE() - INTERVAL 7 DAY
      GROUP BY DATE(DATA_CADASTRO)
      ORDER BY data ASC;
    `);
    return rows;
  } catch (error) {
    console.error("Erro em contarCadastrosSemanaAnterior:", error);
    return [];
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

// Pegar usuários de um tipo, paginados
listarUsuariosPorTipoPaginado: async (tipo, inicio, regPagina) => {
  try {
    const [rows] = await pool.query(
      "SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, USER_USUARIO, TIPO_USUARIO, STATUS_USUARIO, FOTO_PERFIL_BANCO_USUARIO FROM USUARIOS WHERE TIPO_USUARIO = ? LIMIT ?, ?",
      [tipo, inicio, regPagina]
    );

    // converter blob de foto
    const usuarios = rows.map(p => ({
      ...p,
      FOTO_PERFIL_BANCO_USUARIO: p.FOTO_PERFIL_BANCO_USUARIO
        ? `data:image/png;base64,${p.FOTO_PERFIL_BANCO_USUARIO.toString('base64')}`
        : null
    }));

    return usuarios;

  } catch (error) {
    console.log(error);
    return [];
  }
},

// Total de registros de um tipo
totalRegUsuariosPorTipo: async (tipo) => {
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total FROM USUARIOS WHERE TIPO_USUARIO = ?",
      [tipo]
    );
    return rows[0].total;
  } catch (error) {
    console.log(error);
    return 0;
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




    
    findPageListagemAssinantes: async (inicio, total) => {
  try {
    const [linhas] = await pool.query(`
      SELECT 
        u.*,
        a.PLANO,
        a.DATA_INICIO,
        a.DATA_FIM,
        a.STATUS_PAGAMENTO
      FROM USUARIOS u
      INNER JOIN ASSINATURAS a 
        ON u.ID_USUARIO = a.ID_USUARIO
      WHERE 
        a.STATUS_PAGAMENTO = 'pago'
        AND NOW() BETWEEN a.DATA_INICIO AND IFNULL(a.DATA_FIM, NOW())
      GROUP BY u.ID_USUARIO
      ORDER BY a.DATA_INICIO DESC
      LIMIT ?, ?
    `, [inicio, total]);

    const usuarios = linhas.map(p => ({
      ...p,
      FOTO_PERFIL_BANCO_USUARIO: p.FOTO_PERFIL_BANCO_USUARIO
        ? `data:image/png;base64,${p.FOTO_PERFIL_BANCO_USUARIO.toString('base64')}`
        : null
    }));

    return usuarios;
  } catch (error) {
    console.error("Erro em findPageListagemAssinantes:", error);
    return [];
  }
},



totalRegListagemAssinantes: async () => {
  try {
    const [linhas] = await pool.query(`
      SELECT COUNT(DISTINCT u.ID_USUARIO) AS TOTAL
      FROM USUARIOS u
      INNER JOIN ASSINATURAS a 
        ON u.ID_USUARIO = a.ID_USUARIO
      WHERE 
        a.STATUS_PAGAMENTO = 'pago'
        AND NOW() BETWEEN a.DATA_INICIO AND IFNULL(a.DATA_FIM, NOW())
    `);
    return linhas[0]?.TOTAL || 0;
  } catch (error) {
    console.error("Erro em totalRegListagemAssinantes:", error);
    return 0;
  }
},



totalGanhosAssinaturas: async () => {
  try {
    const [rows] = await pool.query(`
      SELECT SUM(
        CASE
          WHEN LOWER(a.PLANO) = 'semanal' THEN 10
          WHEN LOWER(a.PLANO) = 'mensal' THEN 30
          WHEN LOWER(a.PLANO) = 'anual' THEN 300
          ELSE 0
        END
      ) AS total_ganho
      FROM ASSINATURAS a
      WHERE a.STATUS_PAGAMENTO = 'pago'
        AND a.DATA_INICIO <= NOW()
        AND (a.DATA_FIM IS NULL OR a.DATA_FIM >= NOW())
    `);
    return rows[0]?.total_ganho || 0;
  } catch (err) {
    console.error("Erro totalGanhosAssinaturas:", err);
    return 0;
  }
},

// retorna contagem por plano (apenas assinaturas ativas/pagas)
contagemAssinantesPorPlano: async () => {
  try {
    const [rows] = await pool.query(`
      SELECT LOWER(a.PLANO) AS plano, COUNT(DISTINCT a.ID_USUARIO) AS total
      FROM ASSINATURAS a
      WHERE a.STATUS_PAGAMENTO = 'pago'
        AND a.DATA_INICIO <= NOW()
        AND (a.DATA_FIM IS NULL OR a.DATA_FIM >= NOW())
      GROUP BY LOWER(a.PLANO);
    `);

    // transforma em objeto { semanal: X, mensal: Y, anual: Z }
    const mapa = { semanal: 0, mensal: 0, anual: 0 };
    rows.forEach(r => {
      if (r.plano === 'semanal') mapa.semanal = Number(r.total);
      if (r.plano === 'mensal')   mapa.mensal = Number(r.total);
      if (r.plano === 'anual')    mapa.anual = Number(r.total);
    });
    return mapa;
  } catch (err) {
    console.error("Erro contagemAssinantesPorPlano:", err);
    return { semanal: 0, mensal: 0, anual: 0 };
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

  listarDenunciasPublicacoes: async () => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        dp.ID_DENUNCIA,
        dp.ID_USUARIO_DENUNCIANTE,
        u_denunciante.NOME_USUARIO AS NOME_DENUNCIANTE,
        
        pp.ID_USUARIO AS ID_USUARIO_DENUNCIADO,
        u_denunciado.NOME_USUARIO AS NOME_DENUNCIADO,

        dp.ID_PUBLICACAO,
        dp.MOTIVO,
        dp.STATUS,
        dp.DATA_DENUNCIA,
        
        cpp.IMG_PUBLICACAO,
        pp.NOME_PUBLICACAO,
        pp.DATA_PUBLICACAO
      FROM DENUNCIAS_PUBLICACOES dp
      INNER JOIN CONTEUDOS_PUBLICACAO_PROFISSIONAL cpp 
          ON dp.ID_PUBLICACAO = cpp.ID_PUBLICACAO
      INNER JOIN PUBLICACOES_PROFISSIONAL pp
          ON cpp.ID_PUBLICACAO = pp.ID_PUBLICACAO
      INNER JOIN USUARIOS u_denunciante
          ON dp.ID_USUARIO_DENUNCIANTE = u_denunciante.ID_USUARIO
      INNER JOIN USUARIOS u_denunciado
          ON pp.ID_USUARIO = u_denunciado.ID_USUARIO
    `);
    return rows;
  } catch (error) {
    console.error("Erro ao buscar denúncias de publicações:", error);
    return [];
  }
},


 listarDenunciasPropostas: async () => {
  try {
    const [denuncias_projetos] = await pool.query(
      `SELECT 
          dp.ID_DENUNCIA,
          dp.ID_USUARIO_DENUNCIANTE,
          u_denunciante.NOME_USUARIO AS NOME_DENUNCIANTE,

          pp.ID_USUARIO AS ID_USUARIO_DENUNCIADO,
          u_denunciado.NOME_USUARIO AS NOME_DENUNCIADO,

          dp.ID_PROJETO,
          dp.MOTIVO,
          dp.STATUS,
          dp.DATA_DENUNCIA,

          pp.TITULO_PROPOSTA,
          pp.DESCRICAO_PROPOSTA,
          pp.DATA_PROPOSTA

       FROM DENUNCIAS_PROJETOS dp
       INNER JOIN PROPOSTA_PROJETO pp 
           ON dp.ID_PROJETO = pp.ID_PROPOSTA
       INNER JOIN USUARIOS u_denunciante 
           ON dp.ID_USUARIO_DENUNCIANTE = u_denunciante.ID_USUARIO
       INNER JOIN USUARIOS u_denunciado 
           ON pp.ID_USUARIO = u_denunciado.ID_USUARIO`
    );
    return denuncias_projetos;
  } catch (error) {
    console.error(error);
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