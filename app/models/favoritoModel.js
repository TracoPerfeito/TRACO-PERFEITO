const moment = require("moment");
var pool = require("../../config/pool_conexoes");

const favoritoModel = {
    findAll: async () => {
        try {
            const [resultados] = await pool.query("SELECT * FROM FAVORITOS");
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    findID: async (idPublicacao, idUsuario) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM FAVORITOS where ID_PUBLICACAO = ? and ID_USUARIO = ? ",
                [idPublicacao, idUsuario]);
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    create: async (camposJson) => {
        try {
            const [resultados] = await pool.query("insert into FAVORITOS set ?", camposJson);
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    update: async (camposJson, idPublicacao, idUsuario) => {
        try {
            const [resultados] = await pool.query(
                "UPDATE FAVORITOS SET ? WHERE ID_PUBLICACAO = ? and ID_USUARIO = ? ", 
                [camposJson, idPublicacao, idUsuario])
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }

    },


   countCurtidas: async (idPublicacao) => {
    try {
      const [rows] = await pool.query(
        `SELECT COUNT(*) AS totalCurtidas 
         FROM FAVORITOS 
         WHERE ID_PUBLICACAO = ? 
           AND STATUS_FAVORITO = 1`,
        [idPublicacao]
      );
      return rows[0].totalCurtidas;
    } catch (error) {
      console.error("Erro ao contar curtidas:", error);
      return 0;
    }
  },


    delete: async (id) => {
        try {
            const [resultados] = await pool.query(
                "UPDATE FAVORITOS SET STATUS_FAVORITO = 0 WHERE ID_PUBLICACAO = ? and ID_USUARIO = ?", 
                [idPublicacao, idUsuario]);
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    // favoritar: async (dadosFavorito) => {
    //     try {
    //         if (dadosFavorito.situacao == "favorito") {
    //             const resultados = await favoritoModel.update(
    //                 { status_favorito: 0 }, dadosFavorito.idPublicacao, dadosFavorito.idUsuario
    //             );
    //         } else if (dadosFavorito.situacao == "favoritar") {
    //             const result = await favoritoModel.findID(
    //                 dadosFavorito.idPublicacao, dadosFavorito.idUsuario
    //             );
    //             var total = Object.keys(result).length;
    //             if (total == 0) {
    //                 let obj = {
    //                     ID_PUBLICACAO: dadosFavorito.idPublicacao,
    //                     ID_USUARIO: dadosFavorito.idUsuario,
    //                     DT_INCLUSAO_FAVORITO: moment().format("YYYY/MM/DD"),
    //                     STATUS_FAVORITO: 1
    //                 }
    //                 const resultados = await favoritoModel.create(obj);
    //             } else {
    //                 const resultados = await favoritoModel.update(
    //                     { STATUS_FAVORITO: 1 }, dadosFavorito.idPublicacao, dadosFavorito.idUsuario
    //                 );
    //             }

    //         }
    //     } catch (error) {
    //         console.log(error);
    //         return error;
    //     }
    // }



    favoritar: async (dadosFavorito) => {
  try {
    if (dadosFavorito.situacao == "favorito") {
      // descurtindo
      await favoritoModel.update(
        { STATUS_FAVORITO: 0 }, 
        dadosFavorito.idPublicacao, 
        dadosFavorito.idUsuario
      );
      return { mudou: true, status: 0 }; // retornando que mudou
    } else if (dadosFavorito.situacao == "favoritar") {
      const result = await favoritoModel.findID(
        dadosFavorito.idPublicacao, 
        dadosFavorito.idUsuario
      );

      if (result.length === 0) {
        // nunca existiu curtida -> criar
        let obj = {
          ID_PUBLICACAO: dadosFavorito.idPublicacao,
          ID_USUARIO: dadosFavorito.idUsuario,
          DT_INCLUSAO_FAVORITO: moment().format("YYYY/MM/DD"),
          STATUS_FAVORITO: 1
        };
        await favoritoModel.create(obj);
        return { mudou: true, status: 1 };
      } else {
        const jaCurtido = result[0].STATUS_FAVORITO === 1;
        if (!jaCurtido) {
          // estava descurtido → agora curtiu
          await favoritoModel.update(
            { STATUS_FAVORITO: 1 }, 
            dadosFavorito.idPublicacao, 
            dadosFavorito.idUsuario
          );
          return { mudou: true, status: 1 };
        }
        // já estava curtido, não mudou nada
        return { mudou: false, status: 1 };
      }
    }
  } catch (error) {
    console.log(error);
    return { mudou: false, error };
  }
}


}

module.exports = { favoritoModel };