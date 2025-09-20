const moment = require("moment");
const pool = require("../../config/pool_conexoes");

const seguidoresModel = {
  
  findAll: async () => {
    try {
      const [resultados] = await pool.query("SELECT * FROM SEGUINDO");
      return resultados;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  findID: async (idUsuario, idSeguido) => {
    try {
      const [resultados] = await pool.query(
        "SELECT * FROM SEGUINDO WHERE ID_USUARIO = ? AND ID_SEGUIDO = ?",
        [idUsuario, idSeguido]
      );
      return resultados;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  create: async (camposJson) => {
    try {
      const [resultados] = await pool.query("INSERT INTO SEGUINDO SET ?", camposJson);
      return resultados;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  update: async (camposJson, idUsuario, idSeguido) => {
    try {
      const [resultados] = await pool.query(
        "UPDATE SEGUINDO SET ? WHERE ID_USUARIO = ? AND ID_SEGUIDO = ?",
        [camposJson, idUsuario, idSeguido]
      );
      return resultados;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  countSeguidores: async (idSeguido) => {
    try {
      const [rows] = await pool.query(
        "SELECT COUNT(*) AS totalSeguidores FROM SEGUINDO WHERE ID_SEGUIDO = ? AND STATUS_SEGUINDO = 1",
        [idSeguido]
      );
      return rows[0].totalSeguidores;
    } catch (error) {
      console.error("Erro ao contar seguidores:", error);
      return 0;
    }
  },

  delete: async (idUsuario, idSeguido) => {
    try {
      const [resultados] = await pool.query(
        "UPDATE SEGUINDO SET STATUS_SEGUINDO = 0 WHERE ID_USUARIO = ? AND ID_SEGUIDO = ?",
        [idUsuario, idSeguido]
      );
      return resultados;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  seguirUsuario: async (dadosSeguidor) => {
    try {
      const { idUsuario, idSeguido, situacao } = dadosSeguidor;

      if (situacao === "seguindo") {
        // deixar de seguir
        return await seguidoresModel.update({ STATUS_SEGUINDO: 0 }, idUsuario, idSeguido);
      } else {
        // seguir
        const result = await seguidoresModel.findID(idUsuario, idSeguido);
        if (result.length === 0) {
          // criar novo registro
          return await seguidoresModel.create({
            ID_USUARIO: idUsuario,
            ID_SEGUIDO: idSeguido,
            DT_INCLUSAO_SEGUINDO: moment().format("YYYY-MM-DD"),
            STATUS_SEGUINDO: 1
          });
        } else {
          // já existe → atualizar status
          return await seguidoresModel.update({ STATUS_SEGUINDO: 1, DT_INCLUSAO_SEGUINDO: moment().format("YYYY-MM-DD") }, idUsuario, idSeguido);
        }
      }

    } catch (error) {
      console.log(error);
      return error;
    }
  }
};

module.exports = seguidoresModel;
