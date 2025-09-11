const comentariosModel = require("../models/comentariosModel");
const listagensModel = require("../models/listagensModel");
const listagensController = require("../controllers/listagensController");
const denunciasModel = require("../models/denunciasModel");
const notificacoesModel = require("../models/notificacoesModel");
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
        const publicacao = await listagensModel.findIdPublicacao(idPublicacao, req.session.autenticado.id);
        const comentarios = await comentariosModel.listarComentarios(idPublicacao);
        return res.render('pages/publicacao', {
          listaErros: erros.array(),
          dadosNotificacao: { titulo: 'Erro no preenchimento!', mensagem: 'Comentário inválido. Verifique os campos.', tipo: 'error' },
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

      // const publicacao = await listagensModel.findIdPublicacao(idPublicacao);
      // const comentarios = await comentariosModel.listarComentarios(idPublicacao);

      // return res.render('pages/publicacao', {
      //   listaErros: null,
      //   dadosNotificacao: { titulo: 'Comentário enviado!', mensagem: 'Seu comentário foi salvo.', tipo: 'success' },
      //   publicacao: publicacao || {},
      //   comentarios,
      //   usuario: req.session.autenticado || null,
      //   autenticado: !!req.session.autenticado
      // });


      console.log("Comentario salvo iupiii!");

      req.params.id = idPublicacao;
      req.session.dadosNotificacao = {
         titulo: 'Comentário enviado!', 
         mensagem: 'Seu comentário foi salvo.', 
         tipo: 'success' };
  
         return res.redirect("/publicacao/" + req.params.id); 
    } catch (erro) {
      console.error("Erro ao criar comentário:", erro);
      return res.render('pages/publicacao', {
        listaErros: [{ msg: 'Erro ao criar comentário' }],
        dadosNotificacao: { titulo: 'Ocorreu um erro.', mensagem: 'Não foi possível salvar seu comentário.', tipo: 'error' },
        publicacao: {},
        comentarios: [],
        usuario: req.session.autenticado || null,
        autenticado: !!req.session.autenticado
      });
    }
  },

  // Excluir comentário
 
excluirComentario: async (req, res) => {
  try {
    const {  idComentario, idPublicacao } = req.body; // nomes do form

    if (!idComentario || !idPublicacao) {
      return res.status(400).send("ID do comentário ou da publicação não enviado.");
    }


    const idUsuario = req.session.autenticado.id;
    const isAdmin = req.session.autenticado.tipo === 'administrador';

    // Buscar o comentário para pegar o ID do autor e o ID da publicação
    const comentario = await comentariosModel.pegarComentarioPorId(idComentario);
    if (!comentario) {
      return res.status(404).send("Comentário não encontrado.");
    }

    // Buscar o dono da publicação
    const publicacaoDono = await listagensModel.findIdPublicacao(idPublicacao);
    if (!publicacaoDono) {
      return res.status(404).send("Publicação não encontrada.");
    }

    // Permitir exclusão se for: autor do comentário, admin, ou dono da publicação
    const podeExcluir = (comentario.ID_USUARIO === idUsuario) || isAdmin || (publicacaoDono.ID_USUARIO === idUsuario);
    if (!podeExcluir) {
      return res.status(403).send("Você não tem permissão para excluir este comentário.");
    }

    const resultado = await comentariosModel.excluirComentario(idComentario);

    // const publicacao = await listagensModel.findIdPublicacao(idPublicacao);
    // const comentarios = await comentariosModel.listarComentarios(idPublicacao);

    // return res.render('pages/publicacao', {
    //   listaErros: null,
    //   dadosNotificacao: resultado.error
    //     ? { titulo: 'Erro', mensagem: resultado.error, tipo: 'error' }
    //     : { titulo: 'Comentário excluído.', mensagem: 'Seu comentário foi excluído com sucesso.', tipo: 'success' },
    //   publicacao,
    //   comentarios,
    //   usuario: req.session.autenticado || null,
    //   autenticado: !!req.session.autenticado
    // });


    if(resultado.error){

      console.log("Deu ruim !");

    req.params.id = idPublicacao;
    req.session.dadosNotificacao ={ titulo: 'Erro', mensagem: resultado.error, tipo: 'error' };
    
       return res.redirect("/publicacao/" + req.params.id); 

    }

    console.log("Comentario excluido!");

    req.params.id = idPublicacao;
    req.session.dadosNotificacao = { 
      titulo: 'Comentário excluído.',
       mensagem: 'Seu comentário foi excluído com sucesso.',
       tipo: 'success' };

       return res.redirect("/publicacao/" + req.params.id); 

  } catch (erro) {
    console.error("Erro ao excluir comentário:", erro);
    const { idPublicacao } = req.body;
    const publicacao = await listagensModel.findIdPublicacao(idPublicacao) || {};
    const comentarios = await comentariosModel.listarComentarios(idPublicacao);

    return res.render('pages/publicacao', {
      listaErros: [{ msg: 'Erro ao excluir comentário' }],
      dadosNotificacao: { titulo: 'Ocorreu um erro.', mensagem: 'Não foi possível excluir o comentário.', tipo: 'error' },
      publicacao,
      comentarios,
      usuario: req.session.autenticado || null,
      autenticado: !!req.session.autenticado
    });
  }

  },

  // Denunciar comentário
  denunciarComentario: async (req, res) => {
    try {
      const { idComentario, idPublicacao, motivo } = req.body;
      const idUsuario = req.session.autenticado.id;
      // Salva a denúncia no banco
      await denunciasModel.criarDenuncia({ idComentario, idUsuario, motivo });
      // Notifica os administradores
      await notificacoesModel.notificarAdmins(`Novo comentário denunciado! Motivo: ${motivo}`);
      return res.status(200).json({ sucesso: true, mensagem: "Denúncia registrada com sucesso!" });
    } catch (erro) {
      console.error("Erro ao denunciar comentário:", erro);
      return res.status(500).json({ erro: "Erro ao registrar denúncia." });
    }
  }
};


module.exports = comentariosController;
