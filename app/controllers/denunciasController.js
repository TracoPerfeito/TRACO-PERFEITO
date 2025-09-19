const comentariosModel = require("../models/comentariosModel");
const listagensModel = require("../models/listagensModel");
const listagensController = require("../controllers/listagensController");
const denunciasModel = require("../models/denunciasModel");

const { body, validationResult } = require("express-validator");

const denunciasController = {
  // Criar denúncia de comentário
  async criarDenunciaComentario(req, res) {
    try {
      const { idUsuario, idComentario, motivo } = req.body;
      if (!idUsuario || !idComentario || !motivo) {
        return res.status(400).json({ error: 'Parâmetros inválidos' });
      }

      // Inserir denúncia no banco
      const insertId = await denunciasModel.criarDenunciaComentario({ idUsuario, idComentario, motivo });

      res.status(201).json({ message: 'Denúncia criada com sucesso', id: insertId });
    } catch (error) {
      console.error('Erro ao criar denúncia comentário:', error);
      res.status(500).json({ error: 'Erro interno' });
    }
  },

  // Listar denúncias de comentários (API JSON)
  async listarDenunciasComentarios(req, res) {
    try {
      const { status } = req.query;
      const denuncias = await denunciasModel.listarDenunciasComentarios(status);
      res.json(denuncias);
    } catch (error) {
      console.error('Erro ao listar denúncias comentários:', error);
      res.status(500).json({ error: 'Erro interno' });
    }
  },

  // Atualizar status de denúncia de comentário
  async atualizarStatusDenunciaComentario(req, res) {
    try {
      const { idDenuncia } = req.params;
      const { novoStatus } = req.body;
      if (!novoStatus) {
        return res.status(400).json({ error: 'Status é obrigatório' });
      }
      await denunciasModel.atualizarStatusDenunciaComentario(idDenuncia, novoStatus);
      res.json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar status denúncia comentário:', error);
      res.status(500).json({ error: 'Erro interno' });
    }
  },

  // Criar denúncia de publicação
  async criarDenunciaPublicacao(req, res) {
    try {
      const { idPublicacao, motivo } = req.body;
      const idUsuario = req.session.autenticado.id;

      if (!idUsuario || !idPublicacao || !motivo) {
        return res.status(400).json({ error: 'Parâmetros inválidos' });
      }

      const insertId = await denunciasModel.criarDenunciaPublicacao({ idUsuario, idPublicacao, motivo });

      res.status(201).json({ message: 'Denúncia criada com sucesso', id: insertId });
    } catch (error) {
      console.error('Erro ao criar denúncia publicação:', error);
      res.status(500).json({ error: 'Erro interno' });
    }
  },

  // Listar denúncias de publicações (API JSON)
  async listarDenunciasPublicacoes(req, res) {
    try {
      const { status } = req.query;
      const denuncias = await denunciasModel.listarDenunciasPublicacoes(status);
      res.json(denuncias);
    } catch (error) {
      console.error('Erro ao listar denúncias publicações:', error);
      res.status(500).json({ error: 'Erro interno' });
    }
  },

  // Atualizar status de denúncia de publicação
  async atualizarStatusDenunciaPublicacao(req, res) {
    try {
      const { idDenuncia } = req.params;
      const { novoStatus } = req.body;
      if (!novoStatus) {
        return res.status(400).json({ error: 'Status é obrigatório' });
      }
      await denunciasModel.atualizarStatusDenunciaPublicacao(idDenuncia, novoStatus);
      res.json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar status denúncia publicação:', error);
      res.status(500).json({ error: 'Erro interno' });
    }
  },

  // Renderizar view de denúncias de comentários
  async listarDenunciasComentariosView(req, res) {
    try {
      const { status } = req.query;
      const denuncias = await denunciasModel.listarDenunciasComentarios(status);
      res.render('pages/adm-lista-denuncias', { denuncias, tipo: 'comentarios' });
    } catch (error) {
      console.error('Erro ao renderizar denúncias comentários:', error);
      res.status(500).send('Erro interno');
    }
  },

  // Renderizar view de denúncias de publicações
  async listarDenunciasPublicacoesView(req, res) {
    try {
      const { status } = req.query;
      const denuncias = await denunciasModel.listarDenunciasPublicacoes(status);
      res.render('pages/adm-lista-denuncias', { denuncias, tipo: 'publicacoes' });
    } catch (error) {
      console.error('Erro ao renderizar denúncias publicações:', error);
      res.status(500).send('Erro interno');
    }
  },

async criarDenunciaUsuario(req, res) {
  try {
    const idUsuarioDenunciante = req.session.autenticado.id;
    const { idUsuarioDenunciado, motivo } = req.body;

    if (!idUsuarioDenunciante || !idUsuarioDenunciado || !motivo) {
      return res.status(400).json({ erro: 'Parâmetros inválidos' });
    }

    const insertId = await denunciasModel.criarDenunciaUsuario({
      idUsuarioDenunciante,
      idUsuarioDenunciado,
      motivo
    });

    res.json({ sucesso: true, id: insertId });
  } catch (error) {
    console.error('Erro ao criar denúncia de usuário:', error);
    res.status(500).json({ erro: 'Erro interno' });
  }
},

// Listar denúncias de usuários
async listarDenunciasUsuarios(req, res) {
  try {
    const { status } = req.query;
    const denuncias = await denunciasModel.listarDenunciasUsuarios(status);
    res.json(denuncias);
  } catch (error) {
    console.error('Erro ao listar denúncias de usuários:', error);
    res.status(500).json({ erro: 'Erro interno' });
  }
},

// Atualizar status de denúncia de usuário
async atualizarStatusDenunciaUsuario(req, res) {
  try {
    const { idDenuncia } = req.params;
    const { novoStatus } = req.body;

    if (!novoStatus) return res.status(400).json({ erro: 'Status é obrigatório' });

    await denunciasModel.atualizarStatusDenunciaUsuario(idDenuncia, novoStatus);
    res.json({ sucesso: true, message: 'Status atualizado' });
  } catch (error) {
    console.error('Erro ao atualizar status denúncia de usuário:', error);
    res.status(500).json({ erro: 'Erro interno' });
  }
}

};

module.exports = denunciasController;
