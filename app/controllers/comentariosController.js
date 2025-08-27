const comentariosModel = require("../models/comentariosModel");
const listagensModel = require("../models/listagensModel");
const { body, validationResult } = require("express-validator");

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
      const { conteudo, idPublicacao } = req.body;

      if (!erros.isEmpty()) {
        const publicacao = await listagensModel.findIdPublicacao(idPublicacao);
        const comentarios = await comentariosModel.listarComentarios(idPublicacao);
        return res.render('pages/publicacao', {
          listaErros: erros.array(),
          dadosNotificacao: { titulo: 'Erro', mensagem: 'Comentário inválido', tipo: 'error' },
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

      const publicacao = await listagensModel.findIdPublicacao(idPublicacao);
      const comentarios = await comentariosModel.listarComentarios(idPublicacao);

      return res.render('pages/publicacao', {
        listaErros: null,
        dadosNotificacao: { titulo: 'Comentário enviado', mensagem: 'Seu comentário foi salvo', tipo: 'success' },
        publicacao: publicacao || {},
        comentarios,
        usuario: req.session.autenticado || null,
        autenticado: !!req.session.autenticado
      });

    } catch (erro) {
      console.error("Erro ao criar comentário:", erro);
      return res.render('pages/publicacao', {
        listaErros: [{ msg: 'Erro ao criar comentário' }],
        dadosNotificacao: { titulo: 'Erro', mensagem: 'Não foi possível salvar o comentário', tipo: 'error' },
        publicacao: {},
        comentarios: [],
        usuario: req.session.autenticado || null,
        autenticado: !!req.session.autenticado
      });
    }
  },

  // Excluir comentário
  // Excluir comentário
excluirComentario: async (req, res) => {
  try {
    const { id_comentario, idPublicacao } = req.body; // nomes do form

    if (!id_comentario || !idPublicacao) {
      return res.status(400).send("ID do comentário ou da publicação não enviado.");
    }

    const idUsuario = req.session.autenticado.id;
    const isAdmin = req.session.autenticado.tipo === 'administrador';

    const resultado = await comentariosModel.excluirComentario(id_comentario, idUsuario, isAdmin);

    const publicacao = await listagensModel.findIdPublicacao(idPublicacao);
    const comentarios = await comentariosModel.listarComentarios(idPublicacao);

    return res.render('pages/publicacao', {
      listaErros: null,
      dadosNotificacao: resultado.error
        ? { titulo: 'Erro', mensagem: resultado.error, tipo: 'error' }
        : { titulo: 'Comentário excluído', mensagem: 'Comentário excluído com sucesso', tipo: 'success' },
      publicacao,
      comentarios,
      usuario: req.session.autenticado || null,
      autenticado: !!req.session.autenticado
    });

  } catch (erro) {
    console.error("Erro ao excluir comentário:", erro);
    const { idPublicacao } = req.body;
    const publicacao = await listagensModel.findIdPublicacao(idPublicacao) || {};
    const comentarios = await comentariosModel.listarComentarios(idPublicacao);

    return res.render('pages/publicacao', {
      listaErros: [{ msg: 'Erro ao excluir comentário' }],
      dadosNotificacao: { titulo: 'Erro', mensagem: 'Não foi possível excluir o comentário', tipo: 'error' },
      publicacao,
      comentarios,
      usuario: req.session.autenticado || null,
      autenticado: !!req.session.autenticado
    });
  }
}
};


module.exports = comentariosController;
