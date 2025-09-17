// function injetarLocais(req, res, next) {
//   res.locals.tipo_usuario = req.session.autenticado?.tipo || null;
//   res.locals.valores = req.session.autenticado || {};
//   next();
// }
 
// module.exports = injetarLocais;
 
 
function injetarLocais(req, res, next) {
  if (req.session.autenticado) {
    res.locals.autenticado = req.session.autenticado || {};
 
    res.locals.tipo_usuario = req.session.autenticado.tipo;
    res.locals.status_usuario = req.session.autenticado.status;
    res.locals.nome_usuario = req.session.autenticado.nome; 
    res.locals.id_usuario = req.session.autenticado.id; 
    res.locals.user_usuario = req.session.autenticado.user;
    res.locals.email_usuario = req.session.autenticado.email;  
    res.locals.celular_usuario = req.session.autenticado.celular;
    res.locals.img_perfil_banco = req.session.autenticado?.img_perfil_banco || "/imagens/foto-perfil.png";
    res.locals.img_capa_banco = req.session.autenticado?.img_capa_banco || "/imagens/bg.jpg";
    res.locals.descricao_perfil = req.session.autenticado.descricao_perfil;
    res.locals.linkedin = req.session.autenticado.linkedin;
    res.locals.pinterest = req.session.autenticado.pinterest;
    res.locals.instagram = req.session.autenticado.instagram;
    res.locals.whatsapp = req.session.autenticado.whatsapp;
  } else {
    res.locals.tipo_usuario = null;
    res.locals.status_usuario = null;
    res.locals.nome_usuario = null;
    res.locals.id_usuario = null;
    res.locals.user_usuario = null;
    res.locals.email_usuario = null;
    res.locals.celular_usuario = null;
    res.locals.img_perfil_banco = null;
    res.locals.img_capa_banco = null;
    res.locals.descricao_perfil = null;
    res.locals.linkedin = null;
    res.locals.linkedin = null;
    res.locals.pinterest = null;
    res.locals.instagram = null;
    res.locals.whatsapp = null;

  }
  next();
}
 
 
module.exports = injetarLocais;