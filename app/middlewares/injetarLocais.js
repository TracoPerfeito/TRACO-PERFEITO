// function injetarLocais(req, res, next) {
//   res.locals.tipo_usuario = req.session.autenticado?.tipo || null;
//   res.locals.valores = req.session.autenticado || {};
//   next();
// }
 
// module.exports = injetarLocais;
 
function injetarLocais(req, res, next) {
  const user = req.session.autenticado;

  if (user) {
    // Só passa os dados simples do usuário para as views
    res.locals.autenticado = {
      id: user.id,
      nome: user.nome,
      user: user.user,
      email: user.email,
      celular: user.celular,
      tipo: user.tipo,
      status: user.status_usuario,
      cpf: user.cpf,
      img_perfil_banco: user.img_perfil_banco || "/imagens/foto-perfil.png",
      img_capa_banco: user.img_capa_banco || "/imagens/bg.jpg",
      descricao_perfil: user.descricao_perfil,
      linkedin: user.linkedin,
      pinterest: user.pinterest,
      instagram: user.instagram,
      whatsapp: user.whatsapp,
      pro: user.isPro,
      
    };

    // E também mantém os "atalhos" que você já usa
    res.locals.tipo_usuario = user.tipo;
    res.locals.status_usuario = user.status_usuario;
    res.locals.cpf_usuario = user.cpf;
    res.locals.nome_usuario = user.nome;
    res.locals.id_usuario = user.id;
    res.locals.user_usuario = user.user;
    res.locals.email_usuario = user.email;
    res.locals.celular_usuario = user.celular;
    res.locals.img_perfil_banco = user.img_perfil_banco || "/imagens/foto-perfil.png";
    res.locals.img_capa_banco = user.img_capa_banco || "/imagens/bg.jpg";
    res.locals.descricao_perfil = user.descricao_perfil;
    res.locals.linkedin = user.linkedin;
    res.locals.pinterest = user.pinterest;
    res.locals.instagram = user.instagram;
    res.locals.whatsapp = user.whatsapp;
    res.locals.pro = user.isPro;
  } else {
    res.locals.autenticado = null;
    res.locals.tipo_usuario = null;
    res.locals.status_usuario = null;
    res.locals.cpf_usuario = null;
    res.locals.nome_usuario = null;
    res.locals.id_usuario = null;
    res.locals.user_usuario = null;
    res.locals.email_usuario = null;
    res.locals.celular_usuario = null;
    res.locals.img_perfil_banco = null;
    res.locals.img_capa_banco = null;
    res.locals.descricao_perfil = null;
    res.locals.linkedin = null;
    res.locals.pinterest = null;
    res.locals.instagram = null;
    res.locals.whatsapp = null;
    res.locals.pro = null;
  }

  next();
}


 
 
module.exports = injetarLocais;