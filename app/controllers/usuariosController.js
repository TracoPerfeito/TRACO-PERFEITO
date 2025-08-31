const usuariosModel = require("../models/usuariosModel");
const listagensModel = require("../models/listagensModel");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);
const {removeImg} = require("../util/removeImg");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const https = require('https');
const jwt = require("jsonwebtoken");
const { enviarEmail } = require("../util/email");

const emailAtivarConta = require("../util/email-ativar-conta");


const { verificadorCelular, validarCPF } = require("../helpers/validacoes");


const usuariosController = {

    regrasValidacaoCadastro: [


body("nome").isLength({ min: 3, max: 50 }).withMessage('O nome deve ter de 3 a 50 caracteres.')
      .custom(nome => {
        if (/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/.test(nome)) {
            throw new Error('O nome deve conter apenas letras.');
        }
        return true; 
      }),
    body("usuario").isLength({ min: 4, max: 20 }).withMessage('O usuario deve ter de 6 a 20 caracteres.'),

    body("email").isEmail().withMessage('Insira um e-mail válido.'),

    body('celular').isLength({ min: 10, max: 14 } ).withMessage('Número de celular inválido.')

       .custom(celular => verificadorCelular(celular)).withMessage('Número de celular inválido.'),

    body('cpf').isLength({ min: 11, max: 14 }).withMessage('CPF inválido.')

    .custom((cpf) => {
        if (validarCPF(cpf)) {
          return true;
        } else {
          throw new Error('CPF inválido.');
        }
    }),

    body('password').isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres.'),
    body('confirmpassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('As senhas não coincidem.');
        }
        return true;
    })

   

],

regrasValidacaoLogin: [
        body("email")
            .isEmail().withMessage('Insira um email válido.'),
        body("password")
             .notEmpty().withMessage('Insira sua senha.')
    ],


    regrasValidacaoGeneroData: [
        body("genero")
            .notEmpty().withMessage("O campo gênero é obrigatório."),

            body("data_nasc")
            .notEmpty().withMessage("A data de nascimento é obrigatória.")
            .isISO8601().withMessage("Data de nascimento inválida.")
            .custom((value) => {
                const dataNasc = new Date(value);
                const hoje = new Date();
                const idade = hoje.getFullYear() - dataNasc.getFullYear();
                const m = hoje.getMonth() - dataNasc.getMonth();
                const dia = hoje.getDate() - dataNasc.getDate();

                
                const idadeReal = (m < 0 || (m === 0 && dia < 0)) ? idade - 1 : idade;

                if (idadeReal < 18) {
                throw new Error("Você deve ter no mínimo 18 anos.");
                }
                if (idadeReal > 100) {
                throw new Error("Idade máxima permitida é de 100 anos.");
                }

                return true;
            }),


    ],

    regrasValidacaoPerfil: [
    body("nome_usu")
        .isLength({ min: 3, max: 50 })
        .withMessage("O nome deve ter entre 3 e 50 caracteres."),


         

    body("nomeusu_usu")
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage("O nome de usuário deve ter entre 4 e 20 caracteres.")
        .matches(/^[a-zA-Z0-9._]+$/)
        .withMessage("O nome de usuário só pode conter letras, números, pontos e underlines."),


    body("email_usu")
        .isEmail()
        .withMessage("Digite um e-mail válido."),

     body('celular_usu')
     .isLength({ min: 10, max: 14 } )
     .withMessage('Número de celular inválido.')

       .custom(celular => verificadorCelular(celular)).withMessage('Número de celular inválido.'),

    body("especializacao")
  .custom((value, { req }) => {
    const opcoesFixas = [
      "Design de Logotipo", "Design Gráfico", "Ilustração", "Arte Digital", 
      "Design UX/UI", "Design para Web", "Modelagem 3D", "Design de Personagens",
      "Arte para Games", "Arte Conceitual", "Storyboard", "Direção de Arte",
      "Branding", "Design de Embalagens", "Animação e Modelagem 2D / 3D", "Outro"
    ];

    if (!value) return true; // Campo não obrigatório

    if (value === "Outro") {
      const personalizada = req.body.customSpecialization;
      if (!personalizada || personalizada.trim() === "") {
        throw new Error("Você precisa informar sua especialização personalizada.");
      }
      if (personalizada.length > 70) {
        throw new Error("A especialização personalizada deve ter no máximo 70 caracteres.");
      }
    } else if (!opcoesFixas.includes(value)) {
      throw new Error("Especialização inválida.");
    }

    return true;
  }),


    body("descricao_perfil")
        .optional({ checkFalsy: true })
        .isLength({ max: 500 })
        .withMessage("A descrição deve ter no máximo 500 caracteres."),

   

    verificarUsuAutorizado(["profissional", "comum"], "pages/acesso-negado"),
],


regrasValidacaoSenha: [
  body("senhaAtual")
    .notEmpty().withMessage("Digite sua senha atual."),

  body("novaSenha")
    .notEmpty().withMessage("Digite a nova senha.")
    .isStrongPassword().withMessage("A nova senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos."),

  body("confirmarNovaSenha")
    .notEmpty().withMessage("Confirme a nova senha.")
    .custom((value, { req }) => {
      if (value !== req.body.novaSenha) {
        throw new Error("A confirmação da senha não coincide com a nova senha.");
      }
      return true;
    }),

  verificarUsuAutorizado(["profissional", "comum"], "pages/acesso-negado"),
],

  regrasValidacaoFormNovaSenha: [
    body("senha_usu")
      .isStrongPassword()
      .withMessage(
        "A senha deve ter no mínimo 8 caracteres (mínimo 1 letra maiúscula, 1 caractere especial e 1 número)"
      )
      .custom(async (value, { req }) => {
        if (value !== req.body.csenha_usu) {
          throw new Error("As senhas não são iguais!");
        }
      }),
    body("csenha_usu")
      .isStrongPassword()
      .withMessage(
        "A senha deve ter no mínimo 8 caracteres (mínimo 1 letra maiúscula, 1 caractere especial e 1 número)"
      ),
  ],

  regrasValidacaoFormRecSenha: [
    body("email_usu")
      .isEmail()
      .withMessage("Digite um e-mail válido!")
      .custom(async (value) => {
        const nomeUsu = await usuariosModel.findCampoCustom({ email_usuario: value });
        if (nomeUsu == 0) {
          throw new Error("E-mail não encontrado");
        }
      }),
  ],







cadastrarUsuario: async (req, res) => {
        
        const errors = validationResult(req);

        if(!errors.isEmpty()){

            console.log(errors);
            return res.render("pages/cadastro", {
                valores: req.body,
                listaErros: errors,
            });
        }
    
   
        var dadosForm = {
            nome_usuario: req.body.nome,
            email_usuario: req.body.email,
            celular_usuario: req.body.celular,
            senha_usuario: bcrypt.hashSync(req.body.password, salt),
            cpf_usuario: req.body.cpf.replace(/[^\d]/g, ''),
            data_nasc_usuario: req.body.data_nasc,
            genero_usuario: req.body.genero,
            tipo_usuario: req.body.tipo_conta,
            user_usuario: req.body.usuario
             
        }; 
        
        try {

        const resultado = await usuariosModel.create(dadosForm);
        console.log("Usuário criado com sucesso.");


        // resultado.insertId é o ID do usuário recém criado
        const idUsuario = resultado.insertId;

        // Se for profissional, insere na tabela USUARIO_PROFISSIONAL
        if (dadosForm.tipo_usuario === 'profissional') {
            await usuariosModel.createProfissional({ ID_USUARIO: idUsuario });
            console.log("Usuário profissional inserido na tabela USUARIO_PROFISSIONAL.");
        }

     
            req.session.autenticado = {
            autenticado: true,
            id: idUsuario,
            tipo: dadosForm.tipo_usuario,
            nome: dadosForm.nome_usuario,
            user: dadosForm.user_usuario
        };

        const nome = dadosForm.nome_usuario;
        
        const token = jwt.sign(
        { userId: resultado.insertId },
        process.env.SECRET_KEY
      );
      console.log(token);
      const html = require('../util/email-ativar-conta')(process.env.URL_BASE, token, nome);
      

       enviarEmail(dadosForm.email_usuario, "Confirme seu e-mail no Traço Perfeito", null, html, ()=>{
         req.session.dadosNotificacao = {
            titulo: "Sucesso!",
             mensagem: `Cadastro realizado com sucesso. Bem-vindo(a), ${nome}! Enviamos um e-mail de confirmação para ${dadosForm.email_usuario}.`,
            tipo: "success"
            };
            res.redirect("/");

      });
       

        } catch (error) {
            console.log(error);
            res.json({ erro: "Falha ao acessar dados" });
           
        }
          

    },




 logar: (req, res) => {
    const autenticado = req.session.autenticado;

    
    

    if (autenticado && autenticado.autenticado !== null) {
        // Redireciona com base no tipo do usuário
        if (autenticado.tipo === "comum") {
            console.log("🔄 Redirecionando para página comum.");
            return res.redirect("/");
        } else if (autenticado.tipo === "profissional") {
            console.log("🔄 Redirecionando para página profissional.");
            return res.redirect("/");
        } else {
            console.log("⚠️ Tipo de usuário desconhecido.");
            return res.redirect("/");
        }
    } else {
        console.log("❌ Usuário não autenticado. Erro no login.");
        return res.render("pages/login", {
            valores: req.body,
            errosLogin: [],
            retorno: "E-mail ou senha inválidos."
        });
    }
},



    mostrarPerfil: async (req, res) => {
    try {
        let results = await usuariosModel.findId(req.session.autenticado.id);
        const dadosProfissional = await usuariosModel.findProfissional(req.session.autenticado.id);
        const publicacoes = await listagensModel.listarPublicacoesUsuarioLogado(req.session.autenticado.id);
      


        let campos = {


          

           id_usu: results[0].ID_USUARIO,
            nome_usu: results[0].NOME_USUARIO,
            email_usu: results[0].EMAIL_USUARIO,
            celular_usu: results[0].CELULAR_USUARIO, 
            img_perfil_pasta: results[0].FOTO_PERFIL_PASTA_USUARIO,
            img_perfil_banco: results[0].FOTO_PERFIL_BANCO_USUARIO != null
                ? `data:image/jpeg;base64,${results[0].FOTO_PERFIL_BANCO_USUARIO.toString('base64')}`
                : null,
             img_capa_pasta: results[0].IMG_BANNER_PASTA_USUARIO, 
             img_capa_banco: results[0].IMG_BANNER_BANCO_USUARIO != null
                ? `data:image/jpeg;base64,${results[0].IMG_BANNER_BANCO_USUARIO.toString('base64')}`
                : null,
                nomeusu_usu: results[0].USER_USUARIO,
            especializacao: dadosProfissional?.[0]?.ESPECIALIZACAO_DESIGNER || "",
            linkedin: results[0].LINKEDIN_USUARIO || "",
            pinterest: results[0].PINTEREST_USUARIO || "",
            instagram: results[0].INSTAGRAM_USUARIO || "",
            whatsapp: results[0].WHATSAPP_USUARIO || "", 
            senha_usu: ""
        };

         const notificacao = req.session.notificacao || null;
         delete req.session.notificacao; 

        console.log("Resultado da consulta:", results);
        res.render("pages/meu-perfil-artista", { listaErros: null, dadosNotificacao: notificacao,  valores: campos, msgErro: null, publicacoes });
    } catch (e) {
        console.log(e);
        res.render("pages/meu-perfil-artista", {
           listaErros:  [],
            valores: {
                nome_usu: "", email_usu: "", celular_usu: "",
                img_perfil_pasta: "", img_perfil_banco: "",
                nomeusu_usu: "", senha_usu: "", especializacao: "", linkedin: "",
                pinterest: "", instagram: "", whatsapp: ""
            },
            dadosNotificacao: null,
            msgErro: "Erro ao carregar perfil",
            publicacoes: [] 
        });
    }
},































gravarPerfil: async (req, res) => {
    console.log("Arquivo recebido:", req.file);
    console.log("Chegou no gravarPerfil");
    console.log("Body:", req.body);

    console.log("FILES:", req.files);

    console.log(req.body.descricao_perfil.length)
    const erros = validationResult(req);
    const erroMulter = req.session.erroMulter;

    if (!erros.isEmpty() || erroMulter != null) {
        let lista = !erros.isEmpty() ? erros : { formatter: null, errors: [] };
        if (erroMulter != null) lista.errors.push(erroMulter);
        console.log("Deu erro!");
        console.log("Erros de validação:", erros.array());
        console.log("Erro do multer:", erroMulter);

        return res.render("pages/editar-perfil", { 
            listaErros: lista,
            dadosNotificacao: {
              titulo: "Ocorreu um erro.",
              mensagem: "Verifique se todos os campos estão preenchidos corretamente.",
              tipo: "error"
            },
            valores: req.body,
            abaAtiva: "dados-pessoais"
        });
        
    }

    try {
        let dadosForm = {};
//para aqui

       
        if (req.body.nomeusu_usu) dadosForm.USER_USUARIO = req.body.nomeusu_usu;
        if (req.body.nome_usu) dadosForm.NOME_USUARIO = req.body.nome_usu;
        if (req.body.email_usu) dadosForm.EMAIL_USUARIO = req.body.email_usu;
        if (req.body.celular_usu) dadosForm.CELULAR_USUARIO = req.body.celular_usu;
        if (req.body.img_perfil_pasta) dadosForm.FOTO_PERFIL_PASTA_USUARIO = req.body.img_perfil_pasta;
        if (req.body.img_capa_pasta) dadosForm.IMG_BANNER_PASTA_USUARIO = req.body.img_capa_pasta;
        if (typeof req.body.descricao_perfil !== "undefined") {
  dadosForm.DESCRICAO_PERFIL_USUARIO = req.body.descricao_perfil;
}
        if (typeof req.body.linkedin !== "undefined") {
        dadosForm.LINKEDIN_USUARIO = req.body.linkedin;
        }
        if (typeof req.body.pinterest !== "undefined") {
        dadosForm.PINTEREST_USUARIO = req.body.pinterest;
        }
        if (typeof req.body.instagram !== "undefined") {
        dadosForm.INSTAGRAM_USUARIO = req.body.instagram;
        }
        if (typeof req.body.whatsapp !== "undefined") {
        dadosForm.WHATSAPP_USUARIO = req.body.whatsapp;
        }




let especializacaoFinal = req.body.especializacao;

if (especializacaoFinal === "Outro") {
  especializacaoFinal = req.body.customSpecialization?.trim() || "";
}

console.log("Especialização final enviada:", especializacaoFinal);

// Atualizar especialização no banco
if (especializacaoFinal) {
  const resultUpdateProfissional = await usuariosModel.updateProfissional(
    { ESPECIALIZACAO_DESIGNER: especializacaoFinal },
    req.session.autenticado.id
  );
  console.log("Profissional atualizado:", resultUpdateProfissional);
}




// Imagem de perfil
if (req.files && req.files['img_perfil']) {
    const novaImgPerfil = "imagens/perfil/" + req.files['img_perfil'][0].filename;

    // Remove imagem anterior se não for a padrão
    const antigaImgPerfil = req.session.autenticado.img_perfil_pasta;
    if (antigaImgPerfil && antigaImgPerfil !== "imagens/perfil/default_user.jpg") {
        removeImg(antigaImgPerfil.replace(/^\//, "")); 
    }

    dadosForm.FOTO_PERFIL_PASTA_USUARIO = novaImgPerfil;
    dadosForm.FOTO_PERFIL_BANCO_USUARIO = null;
    req.session.autenticado.img_perfil_pasta = novaImgPerfil;
    req.session.autenticado.img_perfil_banco = null;
}

// Imagem de capa/banner
if (req.files && req.files['img_capa']) {
    const novaImgCapa = "imagens/perfil/" + req.files['img_capa'][0].filename;

    // Remove imagem anterior se não for a padrão
    const antigaImgCapa = req.session.autenticado.img_capa_pasta;
    if (antigaImgCapa && antigaImgCapa !== "imagens/perfil/default_background.jpg") {
        removeImg(antigaImgCapa.replace(/^\//, ""));
    }

    dadosForm.IMG_BANNER_PASTA_USUARIO = novaImgCapa;
    req.session.autenticado.img_capa_pasta = novaImgCapa;
}

const { nome_usu, email_usu, celular_usu, nomeusu_usu } = req.body;
const idAtual = req.session.autenticado.id;

const duplicado = await usuariosModel.verificarDuplicidade(email_usu, celular_usu, nomeusu_usu, idAtual);

if (duplicado) {
  let listaErros = [];

  duplicado.forEach(user => {
    if (user.EMAIL_USUARIO === email_usu) {
      listaErros.push({ msg: "Este e-mail já está em uso.", path: "email_usu" });
    }
    if (user.CELULAR_USUARIO === celular_usu) {
      listaErros.push({ msg: "Este número de celular já está em uso.", path: "celular_usu" });
    }
    if (user.USER_USUARIO === nomeusu_usu) {
      listaErros.push({ msg: "Este nome de usuário já está em uso.", path: "nomeusu_usu" });
    }
  });

  return res.render("pages/editar-perfil", {
    listaErros: { errors: listaErros },
     dadosNotificacao: {
              titulo: "Ocorreu um erro.",
              mensagem: "Não foi possível atualizar seu perfil.",
              tipo: "error"
            },
            valores: req.body,
            abaAtiva: "dados-pessoais"
  });
}



        
        if (Object.keys(dadosForm).length === 0) {
            return res.render("pages/meu-perfil-artista", {
                 listaErros: { errors: [{ msg: "Nenhum dado para atualizar." }] },
                valores: req.body,
                console: console.log("Nenhum dado para atualizar."),
                 dadosNotificacao: null
            });
        }


        console.log("Campos para update:", dadosForm);
      console.log("ID do usuário:", req.session.autenticado.id);
    
      
const resultUpdateUsuario = await usuariosModel.update(dadosForm, req.session.autenticado.id);

let resultUpdateProfissional = null;
if (especializacaoFinal) {
  resultUpdateProfissional = await usuariosModel.updateProfissional(
    { ESPECIALIZACAO_DESIGNER: especializacaoFinal },
    req.session.autenticado.id
  );
  console.log("Profissional atualizado:", resultUpdateProfissional);
}

console.log("Usuário atualizado:", resultUpdateUsuario);

      
        req.session.autenticado.nome = req.body.nome_usu;
        req.session.autenticado.user = req.body.nomeusu_usu;
        req.session.autenticado.email = req.body.email_usu;
        req.session.autenticado.celular = req.body.celular_usu;
        req.session.autenticado.descricao_perfil = req.body.descricao_perfil;
        req.session.autenticado.especializacao = especializacaoFinal;
        req.session.autenticado.linkedin = req.body.linkedin;
        req.session.autenticado.pinterest = req.body.pinterest;
        req.session.autenticado.instagram = req.body.instagram;
        req.session.autenticado.whatsapp = req.body.whatsapp;


const usuarioSucesso = resultUpdateUsuario.affectedRows > 0;
const profissionalSucesso = resultUpdateProfissional ? resultUpdateProfissional.affectedRows > 0 : false;

console.log("Resultado updateProfissional:", resultUpdateProfissional);

if (usuarioSucesso || profissionalSucesso) {
  
  if (dadosForm.nome_usu) req.session.autenticado.nome = dadosForm.nome_usu;
  if (dadosForm.nomeusu_usu) req.session.autenticado.user = dadosForm.nomeusu_usu;
  if (dadosForm.email_usu) req.session.autenticado.email = dadosForm.email_usu;
  if (dadosForm.celular_usu) req.session.autenticado.celular = dadosForm.celular_usu;
  if (dadosForm.descricao_perfil) req.session.autenticado.descricao_perfil = dadosForm.descricao_perfil;
  
  if (especializacaoFinal) req.session.autenticado.especializacao = especializacaoFinal;
  
  if (dadosForm.linkedin) req.session.autenticado.linkedin = dadosForm.linkedin;
  if (dadosForm.pinterest) req.session.autenticado.pinterest = dadosForm.pinterest;
  if (dadosForm.instagram) req.session.autenticado.instagram = dadosForm.instagram;
  if (dadosForm.whatsapp) req.session.autenticado.whatsapp = dadosForm.whatsapp;

  req.session.notificacao = {
    titulo: "Perfil atualizado!",
    mensagem: "Seus dados foram salvos e já estão visíveis no seu perfil.",
    tipo: "success"
  };

  req.session.save(() => {
    res.redirect("/meu-perfil-artista");
  });
} else {
  // nenhuma alteração em nenhuma tabela
  res.render("pages/meu-perfil-artista", {
    listaErros: [{ msg: "Nada foi alterado." }],
    dadosNotificacao: {
      titulo: "Ocorreu um erro.",
      mensagem: "Não foi possível atualizar seu perfil.",
      tipo: "error"
    },
    valores: req.body,
    abaAtiva: "dados-pessoais"
  });
}

    } catch (e) {
        console.log(e);
        res.render("pages/editar-perfil", {
           listaErros:  [{ msg: "Ocorreu um erro ao salvar as alterações." }],
            dadosNotificacao: {
              titulo: "Ocorreu um erro.",
              mensagem: "Não foi possível atualizar seu perfil.",
              tipo: "error"
            },
            valores: req.body,
            abaAtiva: "dados-pessoais"
          });
    }
},





























gravarGeneroData: async (req, res) => {

     console.log("Chegou no gravar Genero e data");
    console.log("Body:", req.body);



     const erros = validationResult(req);
        if (!erros.isEmpty()) {
          console.log("Erro na validação inicial.")
        return res.render("pages/editar-perfil", {
          listaErros: erros.array(),
          dadosNotificacao: {
            titulo: "Erro ao alterar dados pessoais!",
            mensagem: "Insira apenas valores válidos.",
            tipo: "error"
          },
          valores: req.body,
          abaAtiva: "conta"
        });
        }


  try {
    const { genero, data_nasc } = req.body;
    const idUsuario = req.session.autenticado.id;

    if (!genero && !data_nasc) {
      return res.render("pages/editar-perfil", {
        listaErros: erros.array(),
            dadosNotificacao: {
              titulo: "Erro ao atualizar dados pessoais!",
              mensagem: "Há campos vazios.",
              tipo: "error"
            },
            valores: req.body,
            abaAtiva: "conta"
      });
    }

    const dadosAtualizar = {};
    if (genero) dadosAtualizar.GENERO_USUARIO = genero;
    if (data_nasc) dadosAtualizar.DATA_NASC_USUARIO = data_nasc;

    const resultado = await usuariosModel.update(dadosAtualizar, idUsuario);

    
    if (resultado.changedRows === 1) {
      req.session.autenticado.genero = genero;
      req.session.autenticado.data_nasc = data_nasc;
      console.log("✅ Dados atualizados com sucesso!");
      return res.render("pages/editar-perfil", {
    listaErros: null,
    dadosNotificacao: {
      titulo: "Dados alterados!",
      mensagem: "Seus dados foram atualizados com sucesso.",
      tipo: "success"
    },
    valores: {},
    abaAtiva: "conta"
  });
  
    } else {
      res.render("pages/editar-perfil", {
       listaErros: erros.array(),
          dadosNotificacao: {
            titulo: "Ocorreu um erro.",
            mensagem: "Não foi possível atualizar seus dados pessoais.",
            tipo: "error"
          },
          valores: req.body,
          abaAtiva: "conta"
      });
    }
  } catch (error) {
    console.error("Erro ao atualizar gênero/data:", error);
    res.render("pages/editar-perfil", {
     listaErros: erros.array(),
      dadosNotificacao: {
        titulo: "Ocorreu um erro.",
        mensagem: "Não foi possível atualizar seus dados pessoais.",
        tipo: "error"
      },
      valores: req.body,
      abaAtiva: "conta"
    });
  }
},






























gravarNovaSenha: async (req, res) => {
  console.log("🔐 Chegou no gravarNovaSenha");
  console.log("Body recebido:", req.body);


  const erros = validationResult(req);
if (!erros.isEmpty()) {
 return res.render("pages/editar-perfil", {
  listaErros: erros.array(),
  dadosNotificacao: {
    titulo: "Erro ao alterar senha",
    mensagem: "Preencha os campos corretamente para alterar a sua senha.",
    tipo: "error"
  },
  valores: req.body,
  abaAtiva: "senha"
});
}

  const { senhaAtual, novaSenha, confirmarNovaSenha } = req.body;
  const idUsuario = req.session.autenticado.id;

  // Verificação de campos obrigatórios
  if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
   return res.render("pages/editar-perfil", {
  listaErros: erros.array(),
  dadosNotificacao: {
    titulo: "Erro ao alterar senha",
    mensagem: "Preencha todos os campos para alterar a senha.",
    tipo: "error"
  },
  valores: req.body,
  abaAtiva: "senha"
});
  }

  try {
    // Busca usuário no banco
    console.log("🔍 Buscando usuário no banco...");
    const userDb = await usuariosModel.findId(req.session.autenticado.id);
    const senhaHashArmazenada = userDb?.[0]?.SENHA_USUARIO;

    console.log(userDb);
    console.log(senhaHashArmazenada)
    if (!senhaHashArmazenada) {
      return res.render("pages/editar-perfil", {
        listaErros: erros.array(),
        dadosNotificacao: {
          titulo: "Erro ao alterar senha",
          mensagem: "Ocorreu um erro.",
          tipo: "error"
        },
        valores: req.body,
        abaAtiva: "senha"
      });
    }

    // Verifica se a senha atual bate com a do banco 
    const senhaCorreta = await bcrypt.compare(senhaAtual, senhaHashArmazenada);
   
    console.log(senhaCorreta);
    if (!senhaCorreta) {
      console.log('A senha atual ta errada')
     return res.render("pages/editar-perfil", {
  listaErros: [{ path: "senhaAtual", msg: "A senha atual está incorreta." }],
  dadosNotificacao: {
    titulo: "Erro ao alterar senha",
    mensagem: "A senha atual está incorreta.",
    tipo: "error"
  },
  valores: req.body,
  abaAtiva: "senha"
});
    }

    // Confirma se nova senha bate com a confirmação 
    if (novaSenha !== confirmarNovaSenha) {
      console.log("Ta errado fi as senhas nao bate")
      return res.render("pages/editar-perfil", {
        listaErros: [{ path: "confirmarNovaSenha", msg: "A nova senha e a confirmação não coincidem." }],
         dadosNotificacao: {
            titulo: "Erro ao alterar senha",
            mensagem: "As senhas não coincidem.",
            tipo: "error"
          },
        valores: req.body,
        abaAtiva: "senha"
      });
    }

    // Criptografa e atualiza senha
    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
    const result = await usuariosModel.update({ SENHA_USUARIO: senhaCriptografada }, idUsuario);

    if (result.changedRows === 1) {
      console.log("✅ Senha atualizada com sucesso!");
      return res.render("pages/editar-perfil", {
    listaErros: null,
    dadosNotificacao: {
      titulo: "Senha alterada!",
      mensagem: "Sua senha foi atualizada com sucesso.",
      tipo: "success"
    },
    valores: {},
    abaAtiva: "senha"
  });
    } else {
      console.warn("⚠️ Nenhuma alteração foi feita no banco.");
      res.render("pages/editar-perfil", {
        listaErros: [{ msg: "Nada foi alterado." }],
        dadosNotificacao: null,
        valores: req.body,
        abaAtiva: "senha"
      });
    }

  } catch (erro) {
    console.error("❌ Erro ao atualizar senha:", erro);
    res.render("pages/editar-perfil", {
      listaErros: [{ msg: "Ocorreu um erro ao salvar as alterações." }],
       dadosNotificacao: {
          titulo: "Erro ao alterar senha",
          mensagem: "Não foi possível alterar a senha.",
          tipo: "error"
        },
      valores: req.body,
      abaAtiva: "senha"
    });
  }
},




























mostrarPerfilEditar: async (req, res) => {
    try {
        let results = await usuariosModel.findId(req.session.autenticado.id);
         const dadosProfissional = await usuariosModel.findProfissional(req.session.autenticado.id);

 
        let campos = {
            nome_usu: results[0].NOME_USUARIO,
            email_usu: results[0].EMAIL_USUARIO,
            celular_usu: results[0].CELULAR_USUARIO,
            data_nasc_usu: results[0].DATA_NASC_USUARIO,
            genero_usu: results[0].GENERO_USUARIO,
            img_perfil_pasta: results[0].FOTO_PERFIL_PASTA_USUARIO,
            img_perfil_banco: results[0].FOTO_PERFIL_BANCO_USUARIO != null
                ? `data:image/jpeg;base64,${results[0].FOTO_PERFIL_BANCO_USUARIO.toString('base64')}`
                : null,
            img_capa_pasta: results[0].IMG_BANNER_PASTA_USUARIO, 
            img_capa_banco: results[0].IMG_BANNER_BANCO_USUARIO != null
                ? `data:image/jpeg;base64,${results[0].IMG_BANNER_BANCO_USUARIO.toString('base64')}`
                : null,
            nomeusu_usu: results[0].USER_USUARIO,
            especializacao: dadosProfissional?.[0]?.ESPECIALIZACAO_DESIGNER || "",
            descricao_perfil: results[0].DESCRICAO_PERFIL_USUARIO || "",
            linkedin: results[0].LINKEDIN_USUARIO || "",
            pinterest: results[0].PINTEREST_USUARIO || "",
            instagram: results[0].INSTAGRAM_USUARIO || "",
            whatsapp: results[0].WHATSAPP_USUARIO || "",
            senha_usu: ""
        };
 
        res.render("pages/editar-perfil", { listaErros: null, dadosNotificacao: null,  valores: campos });
    } catch (e) {
    console.log(e);
    res.render("pages/editar-perfil", {
        listaErros: [],
        dadosNotificacao: null, 
        valores: {
            nome_usu: "", email_usu: "", celular_usu: "",
            img_perfil_pasta: "", img_perfil_banco: "",
            nomeusu_usu: "", senha_usu: "", linkedin: "", pinterest: "", 
            instagram: "", whatsapp: ""
        }
    });
}
},


































alterarTipoUsuario: async (req, res) => {

     console.log("Chegou no alterar tipo usuário");
     console.log("Body:", req.body);
  



  try {
    const { tipo_usuario } = req.body;
    const idUsuario = req.session.autenticado.id;

  
    const dadosAtualizar = {};
    if (tipo_usuario) dadosAtualizar.TIPO_USUARIO = tipo_usuario;
    
    const resultado = await usuariosModel.update(dadosAtualizar, idUsuario);

    
    if (resultado.changedRows === 1) {
      req.session.autenticado.tipo_usuario = tipo_usuario;
  
      console.log("✅ Tipo de perfil atualizado com sucesso!");

      
      return res.render("pages/editar-perfil", {
        autenticado: req.session.autenticado,
        listaErros: null,
        dadosNotificacao: {
          titulo: "Tipo de perfil atualizado!",
          mensagem: "Seu perfil agora é profissional. Você pode publicar seus trabalhos e encontrar Propostas de Projeto.",
          tipo: "success"
        },
        valores: {},
        abaAtiva: "conta",
        mostrarModalLogout: true,
  });

     
    } else {
      res.render("pages/editar-perfil", {
      autenticado: req.session.autenticado,
           listaErros: [{ msg: "Não foi possível mudar seu tipo de conta." }],
          dadosNotificacao: {
            titulo: "Ocorreu um erro.",
            mensagem: "Não foi possível mudar seu tipo de conta",
            tipo: "error"
          },
          valores: req.body,
          abaAtiva: "conta"
      });
    }
  } catch (error) {
    console.error("Erro ao atualizar tipo de conta.", error);
    res.render("pages/editar-perfil", {
      autenticado: req.session.autenticado,
      listaErros: [{ msg: "Não foi possível mudar seu tipo de conta." }],
      dadosNotificacao: {
        titulo: "Ocorreu um erro.",
        mensagem: "Não foi possível alterar seu tipo de conta.",
        tipo: "error"
      },
      valores: req.body,
      abaAtiva: "conta"
    });
  }
},






enviarEmailparaAtivarConta: async (req, res) => {
  console.log("Chegou no enviarEmailparaAtivarConta")

  try {
  const idUsuario = req.session.autenticado.id;
const usuario = await usuariosModel.findId(idUsuario); 
if (!usuario) {
  console.log("Usuário não encontrado no DB:", idUsuario);
 res.redirect(redirectTo);
}
console.log("Email do usuário:", usuario[0].EMAIL_USUARIO,);



    const token = jwt.sign(
      { userId: usuario[0].ID_USUARIO },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    const html = require('../util/email-ativar-conta')(process.env.URL_BASE, token, usuario[0].NOME_USUARIO);

    enviarEmail(usuario[0].EMAIL_USUARIO, "Confirme seu e-mail no Traço Perfeito", null, html, () => {
      req.session.dadosNotificacao = {
        titulo: "Sucesso!",
        mensagem: `Enviamos um e-mail de confirmação para ${usuario[0].EMAIL_USUARIO}.`,
        tipo: "success"
      };
      
      const redirectTo = req.get('referer') || '/';
      console.log("Redirecionando para:", redirectTo);
      res.redirect(redirectTo); // volta para a página que chamou a função
    });

  } catch (error) {
    console.error("Erro ao enviar e-mail de ativação:", error);
     req.session.dadosNotificacao = {
      titulo: "Erro!",
      mensagem: "Não foi possível enviar o e-mail de ativação. Tente novamente mais tarde.",
      tipo: "error"
    };
    res.redirect(req.get('referer') || '/');
  
  }
},









desativarConta: async (req, res) => {
  console.log("Chegou no desativarConta");

  try {
    const { tipo_usuario } = req.body;
    const idUsuario = req.session.autenticado.id;

      const inativo = {
    STATUS_USUARIO: 'inativo'
  };


    const resultado = await usuariosModel.update(inativo, idUsuario);

    if (resultado.changedRows === 1) {
      console.log("✅ Conta marcada como inativa com sucesso!");

      req.session.destroy(() => {
        res.redirect('/');
      });

    } else {
      res.render("pages/editar-perfil", {
        autenticado: req.session.autenticado,
        listaErros: [{ msg: "Não foi possível inativar sua conta." }],
        dadosNotificacao: {
          titulo: "Ocorreu um erro.",
          mensagem: "Não foi possível inativar sua conta.",
          tipo: "error"
        },
        valores: [],
        abaAtiva: "conta"
      });
    }

  } catch (error) {
    console.error("Erro ao inativar conta.", error);
    res.render("pages/editar-perfil", {
      autenticado: req.session.autenticado,
      listaErros: [{ msg: "Não foi possível inativar sua conta." }],
      dadosNotificacao: {
        titulo: "Ocorreu um erro.",
        mensagem: "Não foi possível inativar sua conta.",
        tipo: "error"
      },
       valores: [],
      abaAtiva: "conta"
    });
  }
},





ativarConta: async (req, res) => {
  try {
    const token = req.query.token;
    console.log(token);

    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => { // coloquei async aqui
      console.log(decoded);
      if (err) {
        console.log({ message: "Token inválido ou expirado" });
      } else {
        // Espera a Promise resolver
        const resultados = await usuariosModel.findInativoId(decoded.userId);
        const user = resultados[0]; // pega o primeiro resultado

        if (!user) {
          console.log({ message: "Usuário não encontrado" });
        } else {
          await usuariosModel.update({ STATUS_USUARIO: 'ativo' }, decoded.userId);
          console.log({ message: "Conta ativada" });

          req.session.autenticado = {
            autenticado: true,
            id: user.ID_USUARIO,
            tipo: user.TIPO_USUARIO,
            nome: user.NOME_USUARIO,
            user: user.USER_USUARIO
          };

          const nome = req.session.autenticado.nome;

          req.session.dadosNotificacao = {
            titulo: "Sua conta foi ativada!",
            mensagem: `Conta ativada com sucesso, ${nome}! Agora você pode acessar seu perfil e aproveitar todos os recursos da plataforma.`,
            tipo: "success"
          };

          res.redirect("/");
        }
      }
    });
  } catch (e) {
    console.log(e);
  }
},







recuperarSenha: async (req, res) => {
    const erros = validationResult(req);
    console.log(erros);
    if (!erros.isEmpty()) {
      return res.render("pages/rec-senha", {
        listaErros: erros,
        dadosNotificacao: null,
        valores: req.body,
      });
    }




    try {
      //logica do token
      user = await usuariosModel.findUserCustom({
        email_usuario: req.body.email_usu,
      });
     const token = jwt.sign(
  { userId: user[0].ID_USUARIO },
  process.env.SECRET_KEY,
  { expiresIn: "40m" } 
);

       const nomeUsuario = user[0].NOME_USUARIO;
      //enviar e-mail com link usando o token
      const html = require("../util/email-reset-senha")(process.env.URL_BASE, token, nomeUsuario)
      enviarEmail(req.body.email_usu, "Pedido de recuperação de senha", null, html, ()=>{
         res.redirect("/");
      });

    } catch (e) {
      console.log(e);
    }
  },




  validarTokenNovaSenha: async (req, res) => {
    //receber token da URL

    const token = req.query.token;
    console.log(token);
    //validar token
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        res.render("pages/rec-senha", {
          listaErros: null,
          dadosNotificacao: { titulo: "Link expirado!", mensagem: "Insira seu e-mail para iniciar o reset de senha.", tipo: "error", },
          valores: req.body
        });
      } else {
        res.render("pages/resetar-senha", {
          listaErros: null,
          autenticado: req.session.autenticado,
          id_usuario: decoded.userId,
          dadosNotificacao: null,
          
          
        });
      }
    });
  },

  resetarSenha: async (req, res) => {
  const erros = validationResult(req);
  console.log("Body recebido:", req.body);


  if (!erros.isEmpty()) {

    console.log("Erros encontrados:", erros);
      return res.render("pages/resetar-senha", {
        listaErros: erros.array(),
        dadosNotificacao: null,
        valores: req.body,
        id_usuario: req.body.id_usuario,
        dadosNotificacao: null,
       
       
      });
    }


  try {
    const senha = bcrypt.hashSync(req.body.senha_usu);
    const resetar = await usuariosModel.update({ SENHA_USUARIO: senha }, req.body.id_usuario);
    console.log(resetar);

    res.render("pages/login", {
      errosLogin: null,
      retorno: null,
      valores: { email: "", password: "" },
      dadosNotificacao: {
        titulo: "Perfil alterado!",
        mensagem: "Sua nova senha foi registrada com sucesso!",
        tipo: "success",
      },
    });

  } catch (e) {
    console.log(e);
  }
}












 
 


 
 

}


   



  



module.exports = usuariosController;
           

