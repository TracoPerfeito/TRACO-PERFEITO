const moment = require("moment");
var pool = require("../../config/pool_conexoes");

const mensagemModel = {

    // Buscar todas as mensagens entre dois usuários
    findAll: async (usuarioId1, usuarioId2) => {
        try {
            const [resultados] = await pool.query(
                `SELECT m.ID_MENSAGEM, 
                        u1.NOME_USUARIO AS REMETENTE, 
                        u2.NOME_USUARIO AS DESTINATARIO, 
                        m.CONTEUDO, 
                        m.STATUS,
                        DATE_FORMAT(m.DATA_ENVIO, '%Y-%m-%d %H:%i:%s') AS DATA_ENVIO
                 FROM MENSAGEM m
                 JOIN USUARIOS u1 ON m.REMETENTE_ID = u1.ID_USUARIO
                 JOIN USUARIOS u2 ON m.DESTINATARIO_ID = u2.ID_USUARIO
                 WHERE (m.REMETENTE_ID = ? AND m.DESTINATARIO_ID = ?)
                    OR (m.REMETENTE_ID = ? AND m.DESTINATARIO_ID = ?)
                 ORDER BY m.DATA_ENVIO ASC`,
                [usuarioId1, usuarioId2, usuarioId2, usuarioId1]
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    // Buscar mensagem por ID
    findID: async (id) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM MENSAGEM WHERE ID_MENSAGEM = ?", [id]
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    // Buscar mensagens pendentes (não entregues) de um usuário
    findPendentes: async (usuarioId) => {
        try {
            const [resultados] = await pool.query(
                `SELECT m.ID_MENSAGEM, m.REMETENTE_ID, u1.NOME_USUARIO AS REMETENTE, 
                        m.CONTEUDO, m.DATA_ENVIO, m.STATUS
                 FROM MENSAGEM m
                 JOIN USUARIOS u1 ON m.REMETENTE_ID = u1.ID_USUARIO
                 WHERE m.DESTINATARIO_ID = ? AND m.STATUS = 'ENVIADA'
                 ORDER BY m.DATA_ENVIO ASC`,
                [usuarioId]
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    // Criar nova mensagem
   // mensagemModel.js
create: async (camposJson) => {
    try {
        // Só adiciona STATUS se quiser
        camposJson.STATUS = "ENVIADA"; 
        const [resultados] = await pool.query(
            "INSERT INTO MENSAGEM SET ?", camposJson
        );
        return resultados;
    } catch (error) {
        console.log(error);
        return error;
    }
},


    // Atualizar conteúdo da mensagem
    update: async (camposJson, id) => {
        try {
            const [resultados] = await pool.query(
                "UPDATE MENSAGEM SET ? WHERE ID_MENSAGEM = ?", [camposJson, id]
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    // Atualizar status da mensagem (ex: 'ENTREGUE', 'LIDA')
    updateStatus: async (idMensagem, novoStatus) => {
        try {
            const [resultados] = await pool.query(
                "UPDATE MENSAGEM SET STATUS = ? WHERE ID_MENSAGEM = ?",
                [novoStatus, idMensagem]
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    // Deletar mensagem 
    delete: async (id) => {
        try {
            const [resultados] = await pool.query(
                "DELETE FROM MENSAGEM WHERE ID_MENSAGEM = ?", [id]
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    // Buscar todas as conversas entre dois usuários
    findConversas: async (usuarioId, destinatarioId) => {
        try {
            const [resultados] = await pool.query(
                `SELECT 
                    m.ID_MENSAGEM,
                    m.REMETENTE_ID,
                    m.DESTINATARIO_ID,
                    m.CONTEUDO,
                    m.DATA_ENVIO,
                    m.STATUS,
                    u1.NOME_USUARIO AS REMETENTE_NOME,
                    u2.NOME_USUARIO AS DESTINATARIO_NOME
                FROM MENSAGEM m
                INNER JOIN USUARIOS u1 ON u1.ID_USUARIO = m.REMETENTE_ID
                INNER JOIN USUARIOS u2 ON u2.ID_USUARIO = m.DESTINATARIO_ID
                WHERE 
                    (m.REMETENTE_ID = ? AND m.DESTINATARIO_ID = ?) 
                    OR 
                    (m.REMETENTE_ID = ? AND m.DESTINATARIO_ID = ?)
                ORDER BY m.DATA_ENVIO ASC;`,
                [usuarioId, destinatarioId, destinatarioId, usuarioId]
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
    
    // Contar mensagens entre dois usuários
    countMensagens: async (usuarioId1, usuarioId2) => {
        try {
            const [resultados] = await pool.query(
                `SELECT COUNT(*) AS TOTAL 
                 FROM MENSAGEM 
                 WHERE (REMETENTE_ID = ? AND DESTINATARIO_ID = ?)
                    OR (REMETENTE_ID = ? AND DESTINATARIO_ID = ?)`,
                [usuarioId1, usuarioId2, usuarioId2, usuarioId1]
            );
            return resultados[0].TOTAL;
        } catch (error) {
            console.log(error);
            return error;
        }
    },


marcarComoLidas: async ({ idUsuario, idUsuLogado }) => {
    try {
        const [resultado] = await pool.query(
           `UPDATE MENSAGEM 
            SET STATUS = 'LIDA'
            WHERE DESTINATARIO_ID = ? 
              AND REMETENTE_ID = ? 
              AND STATUS = 'ENVIADA'`,
            [idUsuLogado, idUsuario] // <- invertido: destinatário = usuário logado, remetente = outro usuário
        );
        console.log(resultado);
        return resultado;
    } catch (error) {
        console.log(error);
        return error;
    }
},


// Contar mensagens não lidas para cada contato do usuário logado
countMensagensNaoLidas: async (idUsuarioLogado) => {
    try {
        const [resultados] = await pool.query(
            `SELECT REMETENTE_ID, COUNT(*) AS TOTAL
             FROM MENSAGEM
             WHERE DESTINATARIO_ID = ? AND STATUS = 'ENVIADA'
             GROUP BY REMETENTE_ID`,
            [idUsuarioLogado]
        );

        // Transformar em objeto { remetenteId: total }
        const naoLidas = {};
        resultados.forEach(r => {
            naoLidas[r.REMETENTE_ID] = r.TOTAL;
        });

        return naoLidas;
    } catch (error) {
        console.log(error);
        return {};
    }
},

encontrarConversas: async (idUsuario) => {
  try {
    const [linhas] = await pool.query(
      `
      SELECT 
        u.ID_USUARIO AS OUTRO_USUARIO_ID,
        u.NOME_USUARIO AS OUTRO_NOME,
        u.FOTO_PERFIL_BANCO_USUARIO AS OUTRO_IMG,
        u.TIPO_USUARIO AS OUTRO_TIPO,  
        m.CONTEUDO AS ULTIMA_MENSAGEM,
        m.DATA_ENVIO AS DATA_ULTIMA_MENSAGEM,
        m.STATUS AS STATUS_ULTIMA,
        m.REMETENTE_ID AS REMETENTE_ULTIMA, 
        COALESCE(nl.TOTAL, 0) AS NAO_LIDAS
      FROM MENSAGEM m
      JOIN USUARIOS u 
        ON u.ID_USUARIO = CASE 
          WHEN m.REMETENTE_ID = ? THEN m.DESTINATARIO_ID
          ELSE m.REMETENTE_ID
        END
      LEFT JOIN (
        SELECT REMETENTE_ID, COUNT(*) AS TOTAL
        FROM MENSAGEM
        WHERE DESTINATARIO_ID = ? AND STATUS = 'ENVIADA'
        GROUP BY REMETENTE_ID
      ) nl
      ON nl.REMETENTE_ID = u.ID_USUARIO
      WHERE (m.REMETENTE_ID = ? OR m.DESTINATARIO_ID = ?)
        AND u.ID_USUARIO != ?
        AND m.ID_MENSAGEM = (
          SELECT MAX(m2.ID_MENSAGEM)
          FROM MENSAGEM m2
          WHERE 
            (m2.REMETENTE_ID = m.REMETENTE_ID AND m2.DESTINATARIO_ID = m.DESTINATARIO_ID)
            OR 
            (m2.REMETENTE_ID = m.DESTINATARIO_ID AND m2.DESTINATARIO_ID = m.REMETENTE_ID)
        )
      ORDER BY m.DATA_ENVIO DESC
      `,
      [idUsuario, idUsuario, idUsuario, idUsuario, idUsuario]
    );

    const resultado = linhas.map(p => {
      return {
        ...p,
        FOTO_PERFIL_BANCO_USUARIO: p.OUTRO_IMG
          ? `data:image/png;base64,${p.OUTRO_IMG.toString('base64')}`
          : null,
      };
    });

    return resultado || [];
  } catch (error) {
    console.log(error);
    return [];
  }
},




countMsgsNovasDetalhado: async (idUsuario) => {
  try {
    // Consulta principal: total de mensagens não lidas por remetente
    const [resultados] = await pool.query(
      `
      SELECT 
          m.REMETENTE_ID,
          u.NOME_USUARIO AS REMETENTE_NOME,
          COUNT(m.ID_MENSAGEM) AS TOTAL,
          MAX(m.ID_MENSAGEM) AS ULTIMA_MSG_ID
      FROM MENSAGEM m
      JOIN USUARIOS u ON u.ID_USUARIO = m.REMETENTE_ID
      WHERE m.DESTINATARIO_ID = ? 
        AND m.STATUS = 'ENVIADA'
      GROUP BY m.REMETENTE_ID, u.NOME_USUARIO
      `,
      [idUsuario]
    );

    // Buscar detalhes da última mensagem de cada remetente
    const mensagensDetalhadas = [];
    for (let r of resultados) {
      const [ultimaMsg] = await pool.query(
        `SELECT CONTEUDO, DATA_ENVIO
         FROM MENSAGEM
         WHERE ID_MENSAGEM = ?`,
        [r.ULTIMA_MSG_ID]
      );

      mensagensDetalhadas.push({
        remetenteId: r.REMETENTE_ID,
        remetenteNome: r.REMETENTE_NOME,
        totalNaoLidas: r.TOTAL,
        ultimaMensagem: ultimaMsg[0]?.CONTEUDO || null,
        dataUltimaMensagem: ultimaMsg[0]?.DATA_ENVIO || null
      });
    }

    // Calcular total geral
    const totalGeral = resultados.reduce((acc, r) => acc + r.TOTAL, 0);

    return {
      totalGeral,
      porRemetente: mensagensDetalhadas
    };
  } catch (err) {
    console.error("Erro no countMsgsNovasDetalhado:", err);
    return { totalGeral: 0, porRemetente: [] };
  }
}




}

module.exports = mensagemModel;
                