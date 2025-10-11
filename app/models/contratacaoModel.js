var pool = require("../../config/pool_conexoes");

const contratacaoModel = {

    // Buscar todas as contratações
    findAll: async () => {
        try {
            const [resultados] = await pool.query("SELECT * FROM CONTRATACOES");
            return resultados;
        } catch (error) {
            return error;
        }
    },

 // Buscar contratação por ID com dados dos usuários
findId: async (id) => {
  try {
    const [resultados] = await pool.query(
      `SELECT 
          c.*,
          u_contratante.NOME_USUARIO AS NOME_CONTRATANTE,
          u_contratante.CPF_USUARIO AS CPF_CONTRATANTE,
          u_contratante.EMAIL_USUARIO AS EMAIL_CONTRATANTE,
          u_contratante.CELULAR_USUARIO AS CELULAR_CONTRATANTE,
          u_profissional.NOME_USUARIO AS NOME_PROFISSIONAL,
          u_profissional.CPF_USUARIO AS CPF_PROFISSIONAL,
          u_profissional.EMAIL_USUARIO AS EMAIL_PROFISSIONAL,
          u_profissional.CELULAR_USUARIO AS CELULAR_PROFISSIONAL
       FROM CONTRATACOES c
       JOIN USUARIOS u_contratante ON c.ID_CLIENTE = u_contratante.ID_USUARIO
       JOIN USUARIOS u_profissional ON c.ID_PROFISSIONAL = u_profissional.ID_USUARIO
       WHERE c.ID_CONTRATACAO = ?`,
      [id]
    );
    return resultados[0]; // retorna apenas um objeto, já que ID é único
  } catch (error) {
    return error;
  }
},

findByUsuarioDetalhado: async (usuarioId) => {
  try {
    const [resultados] = await pool.query(
      `SELECT 
   c.*,
   uCliente.NOME_USUARIO AS NOME_CLIENTE,
   uCliente.EMAIL_USUARIO AS EMAIL_CLIENTE,
   uCliente.USER_USUARIO AS USER_CLIENTE,
   uProfissional.NOME_USUARIO AS NOME_PROFISSIONAL,
   uProfissional.EMAIL_USUARIO AS EMAIL_PROFISSIONAL,
   uProfissional.USER_USUARIO AS USER_PROFISSIONAL,
   c.CONFIRMACAO_CLIENTE,
   c.CONFIRMACAO_PROFISSIONAL,
   CASE 
     WHEN c.ID_CLIENTE = ? THEN 'cliente'
     ELSE 'profissional'
   END AS tipoUsuario
FROM CONTRATACOES c
LEFT JOIN USUARIOS uCliente ON c.ID_CLIENTE = uCliente.ID_USUARIO
LEFT JOIN USUARIOS uProfissional ON c.ID_PROFISSIONAL = uProfissional.ID_USUARIO
WHERE c.ID_CLIENTE = ? OR c.ID_PROFISSIONAL = ?
`,
      [usuarioId, usuarioId, usuarioId]
    );

    // Processar cada registro para adicionar tempo restante e status amigável
    const hoje = new Date();
    const contratacoes = resultados.map(c => {
      const dataEntrega = new Date(c.DATA_ENTREGA);
      const diffMs = dataEntrega - hoje;
      const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      console.log(" Resultado :", contratacoes)
      return {
        ...c,
        tipoUsuario: c.tipoUsuario,
        diasRestantes: diffDias >= 0 ? diffDias : 0,
        statusAmigavel: c.STATUS.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
      };
    });

    return contratacoes;
  } catch (error) {
    console.error("Erro em findByUsuarioDetalhado:", error);
    throw error;
  }
},


    // Buscar contratações de um usuário (como cliente ou profissional)
    findByUsuario: async (usuarioId) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM CONTRATACOES WHERE ID_CLIENTE = ? OR ID_PROFISSIONAL = ?",
                [usuarioId, usuarioId]
            );
            return resultados;
        } catch (error) {
            return error;
        }
    },

    // Criar uma nova contratação
    createContratacao: async (camposJson) => {
        try {
            const [result] = await pool.query(
                "INSERT INTO CONTRATACOES SET ?",
                [camposJson]
            );
            console.log("Resultado do insert:", result);
            return result;
        } catch (error) {
            console.log("Erro no insert:", error);
            throw error;
        }
    },

    // Atualizar contratação existente por ID
    updateContratacao: async (camposJson, idContratacao) => {
        try {
            const [resultados] = await pool.query(
                "UPDATE CONTRATACOES SET ? WHERE ID_CONTRATACAO = ?",
                [camposJson, idContratacao]
            );
            return resultados;
        } catch (error) {
            return error;
        }
    },

    // Deletar (ou inativar) contratação
    deleteContratacao: async (id) => {
        try {
            const [resultados] = await pool.query(
                "DELETE FROM CONTRATACOES WHERE ID_CONTRATACAO = ?",
                [id]
            );
            return resultados;
        } catch (error) {
            return error;
        }
    },


  
createPagamentoContratacao: async (camposPagamento) => {
    try {
        const [result] = await pool.query(
            "INSERT INTO PAGAMENTOS_CONTRATACOES SET ?",
            [camposPagamento]
        );
        console.log("Pagamento de contratação inserido:", result);
        return result;
    } catch (error) {
        console.log("Erro ao inserir pagamento de contratação:", error);
        throw error;
    }
},



criaAvaliacao: async (dados) => {
    try{
            const [result] = await pool.query(
            "INSERT INTO AVALIACOES_PROFISSIONAL SET ?",
            [dados]
        );
         console.log("Avaliação de profissional salva:", result);
        return result;
    }catch (error){
 
        console.log("Ocorreu um erro no model:", error);
        throw error;
    }
},


};

module.exports = contratacaoModel;
