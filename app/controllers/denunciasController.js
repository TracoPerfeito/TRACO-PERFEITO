const denunciasModel = require("../models/denunciasModel");
const listagensModel = require("../models/listagensModel");
const comentariosModel = require("../models/comentariosModel");
const listagensController = require("../controllers/listagensController");

// Exemplo de função para enviar notificação ao admin
const enviarNotificacaoAdmin = async (email, mensagem) => {
    console.log("Enviando notificação para admin:", email, mensagem);
    // Aqui você chamaria o serviço de envio de email
};

const denunciasController = {

  // =========================
  // DENÚNCIAS DE PROPOSTA
  // =========================
  criarDenunciaProposta: async (req, res) => {
    console.log("Entrou em criarDenunciaProposta");
    try {
      const { idProposta, motivo } = req.body;
      const idUsuario = req.session.autenticado?.ID_USUARIO || req.session.autenticado?.id;

      console.log("Dados recebidos:", { idProposta, motivo, idUsuario });

      if (!idProposta || !motivo) {
        console.log("Campos faltando, redirecionando com erro");
        req.session.dadosNotificacao = {
          titulo: "Erro ao denunciar proposta",
          mensagem: "Preencha todos os campos.",
          tipo: "error"
        };
        return res.redirect(req.get('referer') || "/");
      }

      const resultado = await denunciasModel.criarDenunciaProposta({ idProposta, motivo, idUsuario });
      console.log("Resultado do insert:", resultado);

     
     const previousUrl = req.get("Referer") || "/";
 
req.session.dadosNotificacao = {
  titulo: "Denúncia enviada.",
  mensagem: "Nossa equipe irá analisar a proposta de projeto suspeita.",
  tipo: "success"
};

    return res.redirect(previousUrl);

    } catch (error) {
      console.error("Erro ao denunciar proposta:", error);
      req.session.dadosNotificacao = {
        titulo: "Erro ao denunciar proposta",
        mensagem: "Ocorreu um erro ao registrar sua denúncia.",
        tipo: "error"
      };
      return res.redirect(req.get('referer') || "/");
    }
  },

  // =========================
  // DENÚNCIAS DE COMENTÁRIO
  // =========================
  criarDenunciaComentario: async (req, res) => {
    console.log("Entrou em criarDenunciaComentario");
    try {
      const { idComentario, motivo, idPublicacao } = req.body;
      const idUsuario = req.session.autenticado?.ID_USUARIO || null;

      console.log("Dados recebidos:", { idComentario, motivo, idPublicacao, idUsuario });

      if (!idComentario || !motivo) {
        console.log("Campos inválidos, renderizando erro na página");
        return res.render("pages/publicacao", {
          dadosNotificacao: {
            titulo: "Erro",
            mensagem: "Parâmetros inválidos",
            tipo: "error"
          },
          idPublicacao
        });
      }

      const insertId = await denunciasModel.criarDenunciaComentario({ idUsuario, idComentario, motivo });
      console.log("Denúncia de comentário criada, insertId:", insertId);

      const emailAdmin = 'tracoperfeito2024@outlook.com';
      await enviarNotificacaoAdmin(emailAdmin, `Novo comentário denunciado! Motivo: ${motivo}`);
      console.log("Notificação enviada para admin");

      return res.render("pages/publicacao", {
        dadosNotificacao: {
          titulo: "Sucesso",
          mensagem: "Denúncia criada com sucesso!",
          tipo: "success"
        },
        idPublicacao
      });

    } catch (error) {
      console.error('Erro ao criar denúncia comentário:', error);
      
      
     const previousUrl = req.get("Referer") || "/";
 
req.session.dadosNotificacao = {
  titulo: "Ocorreu um erro.",
  mensagem: "Não foi possível salvar sua denúncia. Tente novamente mais tarde.",
  tipo: "error"
};

    return res.redirect(previousUrl);

    }
  },

  listarDenunciasComentarios: async (req, res) => {
    console.log("Entrou em listarDenunciasComentarios");
    try {
      const { status } = req.query;
      console.log("Status recebido:", status);

      const denuncias = await denunciasModel.listarDenunciasComentarios(status);
      console.log("Denúncias retornadas:", denuncias);

      res.json(denuncias);
    } catch (error) {
      console.error('Erro ao listar denúncias comentários:', error);
      res.status(500).render('pages/erro-conexao', { mensagem: "Não foi possível acessar o banco de dados." });
    }
  },

  atualizarStatusDenunciaComentario: async (req, res) => {
    console.log("Entrou em atualizarStatusDenunciaComentario");
    try {
      const { idDenuncia } = req.params;
      const { novoStatus } = req.body;
      console.log("Dados recebidos:", { idDenuncia, novoStatus });

      if (!novoStatus) return res.status(400).json({ error: 'Status é obrigatório' });

      const resultado = await denunciasModel.atualizarStatusDenunciaComentario(idDenuncia, novoStatus);
      console.log("Resultado update:", resultado);

      res.json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar status denúncia comentário:', error);
      res.status(500).render('pages/erro-conexao', { mensagem: "Não foi possível acessar o banco de dados." });
    }
  },

  listarDenunciasComentariosView: async (req, res) => {
    console.log("Entrou em listarDenunciasComentariosView");
    try {
      const { status } = req.query;
      console.log("Status recebido:", status);

      const denuncias = await denunciasModel.listarDenunciasComentarios(status);
      console.log("Denúncias retornadas:", denuncias);

      res.render('pages/adm-lista-denuncias', { denuncias, tipo: 'comentarios' });
    } catch (error) {
      console.error('Erro ao renderizar denúncias comentários:', error);
      res.status(500).render('pages/erro-conexao', { mensagem: "Não foi possível acessar o banco de dados." });
    }
  },

  // =========================
  // DENÚNCIAS DE PUBLICAÇÃO
  // =========================
 criarDenunciaPublicacao: async (req, res) => {
  console.log("Entrou em criarDenunciaPublicacao");
  try {
    const { idPublicacao, motivo } = req.body;
    let idUsuario = req.session.autenticado?.id || 0; // se não logado, usa 0

    console.log("Dados recebidos:", { idPublicacao, motivo, idUsuario });

    if (!idPublicacao || !motivo) {
      console.log("Campos inválidos");

      const previousUrl = req.get("Referer") || "/";
     
      
        req.session.dadosNotificacao = {
          titulo: "Campos inválidos!",
          mensagem: "Selecione o motivo para a denúncia.",
          tipo: "error"
        };
     
       return res.redirect(previousUrl || "/");


    }

    const insertId = await denunciasModel.criarDenunciaPublicacao({ idUsuario, idPublicacao, motivo });
    console.log("Denúncia de publicação criada, insertId:", insertId);


     const previousUrl = req.get("Referer") || "/";
 
req.session.dadosNotificacao = {
  titulo: "Denúncia enviada.",
  mensagem: "Nossa equipe irá analisar a publicação suspeita.",
  tipo: "success"
};

    return res.redirect(previousUrl || "/");

  } catch (error) {
    console.error('Erro ao criar denúncia publicação:', error);
  

    
     const previousUrl = req.get("Referer") || "/";
      
      req.session.dadosNotificacao = {
        titulo: "Ocorreu um erro.",
        mensagem: "Não foi possível salvar sua denúncia. Tente novamente mais tarde.",
        tipo: "error"
      };

          return res.redirect(previousUrl || "/");



  }
},


  listarDenunciasPublicacoes: async (req, res) => {
    console.log("Entrou em listarDenunciasPublicacoes");
    try {
      const { status } = req.query;
      console.log("Status recebido:", status);

      const denuncias = await denunciasModel.listarDenunciasPublicacoes(status);
      console.log("Denúncias retornadas:", denuncias);

      res.json(denuncias);
    } catch (error) {
      console.error('Erro ao listar denúncias publicações:', error);
      res.status(500).render('pages/erro-conexao', { mensagem: "Não foi possível acessar o banco de dados." });
    }
  },

  atualizarStatusDenunciaPublicacao: async (req, res) => {
    console.log("Entrou em atualizarStatusDenunciaPublicacao");
    try {
      const { idDenuncia } = req.params;
      const { novoStatus } = req.body;
      console.log("Dados recebidos:", { idDenuncia, novoStatus });

      if (!novoStatus) return res.status(400).json({ error: 'Status é obrigatório' });

      const resultado = await denunciasModel.atualizarStatusDenunciaPublicacao(idDenuncia, novoStatus);
      console.log("Resultado update:", resultado);

      res.json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar status denúncia publicação:', error);
      res.status(500).render('pages/erro-conexao', { mensagem: "Não foi possível acessar o banco de dados." });
    }
  },

  listarDenunciasPublicacoesView: async (req, res) => {
    console.log("Entrou em listarDenunciasPublicacoesView");
    try {
      const { status } = req.query;
      console.log("Status recebido:", status);

      const denuncias = await denunciasModel.listarDenunciasPublicacoes(status);
      console.log("Denúncias retornadas:", denuncias);

      res.render('pages/adm-lista-denuncias', { denuncias, tipo: 'publicacoes' });
    } catch (error) {
      console.error('Erro ao renderizar denúncias publicações:', error);
      res.status(500).render('pages/erro-conexao', { mensagem: "Não foi possível acessar o banco de dados." });
    }
  },

  // =========================
  // DENÚNCIAS DE USUÁRIOS
  // =========================
  criarDenunciaUsuario: async (req, res) => {
    console.log("Entrou em criarDenunciaUsuario");
    try {
      const idUsuarioDenunciante = req.session.autenticado?.id;
      const { idUsuarioDenunciado, motivo } = req.body;

      console.log("Dados recebidos:", { idUsuarioDenunciante, idUsuarioDenunciado, motivo });

      if (!idUsuarioDenunciante || !idUsuarioDenunciado || !motivo) {
        console.log("Campos inválidos");
       
          const previousUrl = req.get("Referer") || "/";
     
      
        req.session.dadosNotificacao = {
          titulo: "Campos inválidos!",
          mensagem: "Selecione o motivo para a denúncia.",
          tipo: "error"
        };
     
       return res.redirect(previousUrl || "/");

      }

      const insertId = await denunciasModel.criarDenunciaUsuario({ idUsuarioDenunciante, idUsuarioDenunciado, motivo });
      console.log("Denúncia de usuário criada, insertId:", insertId);


      

     const previousUrl = req.get("Referer") || "/";
 
req.session.dadosNotificacao = {
  titulo: "Denúncia enviada.",
  mensagem: "Nossa equipe irá analisar o usuário suspeito.",
  tipo: "success"
};

    return res.redirect(previousUrl);




    } catch (error) {
      console.error('Erro ao criar denúncia de usuário:', error);
     


      
     const previousUrl = req.get("Referer") || "/";
 
req.session.dadosNotificacao = {
  titulo: "Ocorreu um erro.",
  mensagem: "Não foi possível salvar sua denúncia. Tente novamente mais tarde.",
  tipo: "error"
};

    return res.redirect(previousUrl);

    }
  },

  listarDenunciasUsuarios: async (req, res) => {
    console.log("Entrou em listarDenunciasUsuarios");
    try {
      const { status } = req.query;
      console.log("Status recebido:", status);

      const denuncias = await denunciasModel.listarDenunciasUsuarios(status);
      console.log("Denúncias retornadas:", denuncias);

      res.json(denuncias);
    } catch (error) {
      console.error('Erro ao listar denúncias de usuários:', error);
      res.status(500).json({ erro: 'Erro interno' });
    }
  },

  atualizarStatusDenunciaUsuario: async (req, res) => {
    console.log("Entrou em atualizarStatusDenunciaUsuario");
    try {
      const { idDenuncia } = req.params;
      const { novoStatus } = req.body;
      console.log("Dados recebidos:", { idDenuncia, novoStatus });

      if (!novoStatus) return res.status(400).json({ erro: 'Status é obrigatório' });

      const resultado = await denunciasModel.atualizarStatusDenunciaUsuario(idDenuncia, novoStatus);
      console.log("Resultado update:", resultado);

      res.json({ sucesso: true, message: 'Status atualizado' });
    } catch (error) {
      console.error('Erro ao atualizar status denúncia de usuário:', error);
      res.status(500).json({ erro: 'Erro interno' });
    }
  },

  // =========================
  // DENÚNCIAS DE PROJETO
  // =========================
  criarDenunciaProjeto: async (req, res) => {
    console.log("Entrou em criarDenunciaProjeto");
    try {
      const { idProjeto, motivo } = req.body;
      const idUsuario = req.session.autenticado?.id;

      console.log("Dados recebidos:", { idProjeto, motivo, idUsuario });

      const resultado = await denunciasModel.criarDenunciaProjeto({ idProjeto, idUsuario, motivo });
      console.log("Resultado insert projeto:", resultado);

      if (resultado.error) {
        req.session.dadosNotificacao = { titulo: 'Erro', mensagem: resultado.error, tipo: 'erro' };
        console.log("Erro ao criar denúncia:", resultado.error);
      } else {
        req.session.dadosNotificacao = { titulo: 'Sucesso', mensagem: 'Denúncia enviada com sucesso!', tipo: 'sucesso' };
        console.log("Denúncia de projeto criada com sucesso");
      }

      res.redirect('/projetos');
    } catch (error) {
      console.error('Erro ao criar denúncia de projeto:', error);
      res.status(500).render('pages/erro-conexao', { mensagem: "Não foi possível acessar o banco de dados." });
    }
  },

  listarDenunciasProjetos: async (req, res) => {
    console.log("Entrou em listarDenunciasProjetos");
    try {
      const denuncias = await denunciasModel.listarDenunciasProjetos();
      console.log("Denúncias de projetos retornadas:", denuncias);

      res.render('denuncias/listaProjetos', { denuncias });
    } catch (error) {
      console.error('Erro ao listar denúncias de projetos:', error);
      res.status(500).render('pages/erro-conexao', { mensagem: "Não foi possível acessar o banco de dados." });
    }
  },

  atualizarStatusProjeto: async (req, res) => {
    console.log("Entrou em atualizarStatusProjeto");
    try {
      const { idDenuncia, novoStatus } = req.body;
      console.log("Dados recebidos:", { idDenuncia, novoStatus });

      const resultado = await denunciasModel.atualizarStatusDenunciaProjeto(idDenuncia, novoStatus);
      console.log("Resultado update:", resultado);

      if (resultado && resultado.affectedRows > 0) {
        req.session.dadosNotificacao = { titulo: 'Sucesso', mensagem: 'Status atualizado!', tipo: 'sucesso' };
        console.log("Status da denúncia atualizado com sucesso");
      } else {
        req.session.dadosNotificacao = { titulo: 'Erro', mensagem: 'Não foi possível atualizar o status.', tipo: 'erro' };
        console.log("Falha ao atualizar status da denúncia");
      }

      res.redirect('/denuncias-projetos');
    } catch (error) {
      console.error('Erro ao atualizar status da denúncia de projeto:', error);
      res.status(500).render('pages/erro-conexao', { mensagem: "Não foi possível acessar o banco de dados." });
    }
  }

};

module.exports = denunciasController;
