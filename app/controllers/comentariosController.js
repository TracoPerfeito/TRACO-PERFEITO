const comentariosModel = require("../models/comentariosModel");
const listagensModel = require("../models/listagensModel");
const denunciasModel = require("../models/denunciasModel");
const notificacoesModel = require("../models/notificacoesModel");


const { body, validationResult } = require("express-validator");
const pool = require('../../config/pool_conexoes');

const comentariosController = {

  // Middleware de validação
  regrasValidacaoComentario: [
    body('conteudo')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('O comentário deve ter no mínimo 1 caractere e no máximo 2000')
  ],

  // Criar comentário
  criarComentario: async (req, res) => {
    try {
      const erros = validationResult(req);
      const { conteudo, idPublicacao, donoPublicacao, nomePublicacao } = req.body;

      if (!erros.isEmpty()) {
        const publicacao = await listagensModel.findIdPublicacao(idPublicacao, req.session.autenticado.id);
        const comentarios = await comentariosModel.listarComentarios(idPublicacao);
        return res.render('pages/publicacao', {
          listaErros: erros.array(),
          dadosNotificacao: { titulo: 'Erro no preenchimento!', mensagem: 'Comentário inválido.', tipo: 'error' },
          publicacao: publicacao || {},
          comentarios,
          usuario: req.session.autenticado || null,
          autenticado: !!req.session.autenticado
        });
      }

      const idUsuario = req.session.autenticado.id;

      await comentariosModel.criarComentario({
        ID_USUARIO: idUsuario,
        ID_PUBLICACAO: idPublicacao,
        CONTEUDO_COMENTARIO: conteudo,
        DATA_COMENTARIO: new Date()
      });


      if(req.session.autenticado.id != donoPublicacao){
      const idNotificacao = await notificacoesModel.criarNotificacao({
        idUsuario: donoPublicacao,
        titulo: "Novo comentário!",
        preview:`Seu post "${nomePublicacao}" recebeu um comentário de ${req.session.autenticado.nome}.`,
        conteudo: `
  <p>Seu post "<strong>${nomePublicacao}</strong>" recebeu um comentário de 
  <strong class="nome-comentador">${req.session.autenticado.nome}</strong>!</p>
  <p class="comentario-texto">Comentário: "${conteudo}"</p>
  <a href="/publicacao/${idPublicacao}" class="btn-ver-comentario">Ir para a publicação</a>
`,

        categoria: "COMENTARIO"
      });

      

    console.log("Notificação criada com ID:", idNotificacao);

      }

      req.session.dadosNotificacao = {
        titulo: 'Comentário enviado!',
        mensagem: 'Seu comentário foi salvo.',
        tipo: 'success'
      };





      return res.redirect("/publicacao/" + idPublicacao);

    } catch (erro) {
      console.error("Erro ao criar comentário:", erro);
      const publicacao = await listagensModel.findIdPublicacao(req.body.idPublicacao) || {};
      const comentarios = await comentariosModel.listarComentarios(req.body.idPublicacao);
      return res.render('pages/publicacao', {
        listaErros: [{ msg: 'Erro ao criar comentário' }],
        dadosNotificacao: { titulo: 'Ocorreu um erro.', mensagem: 'Não foi possível salvar seu comentário.', tipo: 'error' },
        publicacao,
        comentarios,
        usuario: req.session.autenticado || null,
        autenticado: !!req.session.autenticado
      });
    }
  },

  // Excluir comentário
  excluirComentario: async (req, res) => {
    try {
      const { idComentario, idPublicacao } = req.body;

      if (!idComentario || !idPublicacao) {
        return res.status(400).send("ID do comentário ou da publicação não enviado.");
      }

      const idUsuario = req.session.autenticado.id;
      const isAdmin = req.session.autenticado.tipo === 'administrador';

      const comentario = await comentariosModel.pegarComentarioPorId(idComentario);
      if (!comentario) return res.status(404).send("Comentário não encontrado.");

      const publicacaoDono = await listagensModel.findIdPublicacao(idPublicacao);
      if (!publicacaoDono) return res.status(404).send("Publicação não encontrada.");

      const podeExcluir = (comentario.ID_USUARIO === idUsuario) || isAdmin || (publicacaoDono.ID_USUARIO === idUsuario);
      if (!podeExcluir) return res.status(403).send("Você não tem permissão para excluir este comentário.");

      await pool.query('DELETE FROM DENUNCIAS_COMENTARIOS WHERE ID_COMENTARIO = ?', [idComentario]);
      const resultado = await comentariosModel.excluirComentario(idComentario);

      if (!resultado.success) {
        req.session.dadosNotificacao = { titulo: 'Erro', mensagem: resultado.error, tipo: 'error' };
      } else {
        req.session.dadosNotificacao = { titulo: 'Comentário excluído', mensagem: 'Seu comentário foi excluído com sucesso.', tipo: 'success' };
      }

      return res.redirect("/publicacao/" + idPublicacao);

    } catch (erro) {
      console.error("Erro ao excluir comentário:", erro);
      req.session.dadosNotificacao = { titulo: 'Erro', mensagem: 'Não foi possível excluir o comentário.', tipo: 'error' };
      return res.redirect("/publicacao/" + req.body.idPublicacao);
    }
  },

  // Denunciar comentário
  denunciarComentario: async (req, res) => {
    try {
      const { idComentario, idPublicacao, motivo } = req.body;
      const idUsuario = req.session.autenticado.id;

      const resultado = await denunciasModel.criarDenunciaComentario({ idComentario, idUsuario, motivo });

      if (resultado?.error) {
        req.session.dadosNotificacao = { titulo: 'Erro', mensagem: resultado.error, tipo: 'error' };
        return res.redirect("/publicacao/" + idPublicacao);
      }

      await notificacoesModel.notificarAdmins(`Novo comentário denunciado! Motivo: ${motivo}`);

      req.session.dadosNotificacao = {
        titulo: 'Denúncia enviada',
        mensagem: 'Seu comentário foi denunciado com sucesso.',
        tipo: 'success'
      };

      return res.redirect("/publicacao/" + idPublicacao);

    } catch (erro) {
      console.error("Erro ao denunciar comentário:", erro);
      req.session.dadosNotificacao = { titulo: 'Erro', mensagem: 'Não foi possível registrar a denúncia.', tipo: 'error' };
      return res.redirect("/publicacao/" + req.body.idPublicacao);
    }
  }

};

module.exports = comentariosController;
