const pool = require("../../config/pool_conexoes");

async function processExpiredPenalties() {
  try {
    const [rows] = await pool.query(
      `SELECT ID_PENALIDADE_USUARIO, ID_USUARIO, ID_PENALIDADE, DATA_FIM
       FROM PENALIDADES_USUARIOS
       WHERE STATUS = 'ativa' AND DATA_FIM IS NOT NULL AND DATA_FIM <= NOW()`
    );
    if (!rows.length) return;

    for (const p of rows) {
      try {
        await pool.query(
          `UPDATE PENALIDADES_USUARIOS SET STATUS = 'expirada' WHERE ID_PENALIDADE_USUARIO = ?`,
          [p.ID_PENALIDADE_USUARIO]
        );

        const [other] = await pool.query(
          `SELECT COUNT(*) AS cnt FROM PENALIDADES_USUARIOS WHERE ID_USUARIO = ? AND STATUS = 'ativa'`,
          [p.ID_USUARIO]
        );
        const activeCount = other[0] ? other[0].cnt : 0;

        if (activeCount === 0) {
          await pool.query(
            `UPDATE USUARIOS SET STATUS_USUARIO = 'ativo' WHERE ID_USUARIO = ?`,
            [p.ID_USUARIO]
          );
        }

        try {
          await pool.query(
            `INSERT INTO NOTIFICACOES (ID_USUARIO, TITULO, MENSAGEM, DATA_CRIACAO)
             VALUES (?, ?, ?, NOW())`,
            [p.ID_USUARIO, 'Penalidade expirada', 'Sua penalidade expirou e seu status foi atualizado.']
          );
        } catch (nErr) {
          console.warn(JSON.stringify({ event: 'notificacao_nao_criada_expiracao', user: p.ID_USUARIO, error: nErr.message || nErr }));
        }

        console.log(JSON.stringify({
          event: 'penalidade_expirada',
          id_penalidade_usuario: p.ID_PENALIDADE_USUARIO,
          id_usuario: p.ID_USUARIO,
          activeRemain: activeCount,
          timestamp: new Date().toISOString()
        }));
      } catch (innerErr) {
        console.error(JSON.stringify({ event: 'erro_processar_penalidade', item: p, error: innerErr.message || innerErr }));
      }
    }
  } catch (err) {
    console.error(JSON.stringify({ event: 'erro_scheduler', error: err.message || err }));
  }
}

let intervalHandle = null;
function startPenaltyScheduler({ intervalMs = 60 * 1000 } = {}) {
  processExpiredPenalties().catch(err => console.error(JSON.stringify({ event: 'erro_scheduler_start', error: err.message || err })));
  if (intervalHandle) clearInterval(intervalHandle);
  intervalHandle = setInterval(() => processExpiredPenalties().catch(err => console.error(JSON.stringify({ event: 'erro_scheduler_interval', error: err.message || err }))), intervalMs);
  console.log(JSON.stringify({ event: 'scheduler_iniciado', intervalMs, timestamp: new Date().toISOString() }));
}

function stopPenaltyScheduler() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}

module.exports = { startPenaltyScheduler, stopPenaltyScheduler };