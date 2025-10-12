

var express = require("express");
var router = express.Router();

const { body, validationResult } = require("express-validator");
const usuariosController = require("../controllers/usuariosController");
const listagensController = require("../controllers/listagensController");
const publicacoesController = require("../controllers/publicacoesController");
const comentariosController = require("../controllers/comentariosController");
const denunciasController = require('../controllers/denunciasController');
const pesquisasController = require('../controllers/pesquisasController');
const pagamentoController = require("../controllers/pagamentoController");
const notificacoesController = require("../controllers/notificacoesController");
const contratacaoController = require("../controllers/contratacaoController");
const {mensagemController} = require("../controllers/mensagemController");
const admController = require("../controllers/admController");

const db = require('../../config/pool_conexoes');

// Denunciar proposta de projeto
router.post('/denunciar-proposta', denunciasController.criarDenunciaProposta);

// SDK do Mercado Pago
const { MercadoPagoConfig, Preference } = require('mercadopago');
// Adicione credenciais
const client = new MercadoPagoConfig({ accessToken: process.env.accessToken });


const {
  verificarUsuAutenticado,
  limparSessao,
  gravarUsuAutenticado,
  verificarUsuAutorizado,
} = require("../models/autenticador_middleware");
// const { listenerCount } = require("../../config/pool_conexoes");

const uploadFile = require("../util/uploader");

router.get("/", verificarUsuAutenticado, function (req, res) {
  const dadosNotificacao = req.session.dadosNotificacao || null;
  req.session.dadosNotificacao = null;

  listagensController.listarPublicacoes(req, res, dadosNotificacao);
});


// rota GET
router.get("/pesquisar", function(req, res) {

   const dadosNotificacao = req.session.dadosNotificacao || null;
  req.session.dadosNotificacao = null;

  pesquisasController.pesquisar(req, res);
});





router.get(
  "/contratar", //contratar 
  async function (req, res) {
    listagensController.listarProfissionais(req, res);
  }
);




router.get("/pesquisar-profissionais", function(req, res) {

   const dadosNotificacao = req.session.dadosNotificacao || null;
  req.session.dadosNotificacao = null;

  pesquisasController.pesquisarProfissionais(req, res);
});




router.get("/index", function (req, res) { //index
    res.render('pages/index')
 
});


router.get("/quemsomos", function (req, res) { //quemsomos
    res.render('pages/quemsomos')
 
});

router.post( "/entraremcontato", admController.regrasValidacaoContato, function (req, res) {
    admController.enviarMensagemQuemSomos(req, res);
}
)

router.get("/perfil/:id", function (req, res) { //perfil-alheio
  const dadosNotificacao = req.session.dadosNotificacao || null;
  req.session.dadosNotificacao = null;

    listagensController.exibirPerfil(req, res, dadosNotificacao);
  
 
});




router.post( "/enviar-avaliacao", contratacaoController.regrasValidacaoAvaliacao, function (req, res) {
    contratacaoController.avaliarUsuario(req, res);
}
)



router.get(
  "/listar-seguidores", //listar seguidores
  async function (req, res) {
    listagensController.listarSeguidoresESeguindo(req, res);
  }
);



router.get("/publicacoes-perfil", function (req, res) { //publicações de um perfil
    res.render('pages/publicacoes-perfil')
 
});


router.get("/favoritar", verificarUsuAutenticado, function (req, res) {
  publicacoesController.favoritar(req, res);
});


router.get("/seguir-usuario", verificarUsuAutenticado, function (req, res) {
  usuariosController.seguir(req, res);
});


router.get("/publicacao/:id", function (req, res) { //publicacao
  const dadosNotificacao = req.session.dadosNotificacao || null;
  req.session.dadosNotificacao = null;
    listagensController.exibirPublicacao(req, res, dadosNotificacao);

});

router.post(
  "/denunciar-publicacao",
  denunciasController.criarDenunciaPublicacao
);

router.post(
  "/editar-publicacao", 

  publicacoesController.regrasValidacaoEditarPublicacao, // validações
  publicacoesController.editarPublicacao              // controller)};
);
 

router.post(
  "/editar-proposta", 

  publicacoesController.regrasValidacaoEditarProposta, // validações
  publicacoesController.editarProposta              // controller)};
);

router.post(
  "/salvarcomentario",
  comentariosController.regrasValidacaoComentario,
  comentariosController.criarComentario
);

// Excluir comentário
router.post(
  "/excluir-comentario",
  comentariosController.excluirComentario
);

// Denunciar comentário
router.post(
  "/denunciar-comentario",
  comentariosController.denunciarComentario
);


router.post("/denunciar-publicacao", denunciasController.criarDenunciaPublicacao);

router.post('/denunciar-usuario', denunciasController.criarDenunciaUsuario);






router.get("/pagamentos",
  
   verificarUsuAutorizado(["profissional"], "pages/acesso-negado"),
  async function (req, res){ 
    res.render('pages/pagamentos')
  }
);


router.post("/create-preference", async function (req, res) {
    const preference = new Preference(client);
    console.log("Criando preferência de pagamento com dados:", req.body);

    const { plano } = req.body;
    console.log("Plano selecionado:", plano);

   
    const planos = {
        semanal: { title: "Plano Semanal Traço Perfeito", preco: 10 },
        mensal: { title: "Plano Mensal Traço Perfeito", preco: 30 },
        anual: { title: "Plano Anual Traço Perfeito", preco: 300 }
    };

    if (!planos[plano]) {
        return res.status(400).json({ error: "Plano inválido" });
    }

    const idPedido = Date.now().toString(); //de teste mermo

    preference.create({
        body: {
            items: [
                {
                    title: planos[plano].title,
                    quantity: 1,
                    unit_price: planos[plano].preco
                }
            ],
                external_reference: `${idPedido}_${plano}`, 
            back_urls: {
                success: process.env.URL_BASE + "/feedback",
                failure: process.env.URL_BASE + "/feedback",
                pending: process.env.URL_BASE + "/feedback"
            },
            auto_return: "approved"
        }
    })
    .then((value) => {
        console.log("Preferência criada com sucesso:", value);
        res.json(value);
    })
    .catch(err => {
        console.error("Erro ao criar preferência:", err);
        res.status(500).json({ erro: "Erro ao criar preferência" });
    });
});



router.get("/feedback", function (req, res) {
  pagamentoController.gravarPagamento(req, res);
});

 
router.get(
  "/meu-perfil-artista",
  verificarUsuAutorizado(["profissional", "comum"], "pages/acesso-negado"),
  async function (req, res) {
    usuariosController.mostrarPerfil(req, res);
  }
);


 
router.get(
  "/contratacoes",
  verificarUsuAutorizado(["profissional", "comum"], "pages/acesso-negado"),
  async function (req, res) {
    contratacaoController.listarContratacoes(req, res);
  }
);


router.post(
  "/contratacoes/aceitar/:id",function(req, res){
  // verificarUsuAutorizado(["profissional"]),
 contratacaoController.aceitarContratacao(req, res);
  
});


router.post(
  "/contratacoes/recusar/:id", function(req, res){
  // verificarUsuAutorizado(["profissional"]),
 contratacaoController.recusarContratacao(req, res);
  
});



router.post(
  "/contratacoes/confirmarFinalizacao/:id",function(req, res){
  // verificarUsuAutorizado(["profissional"]),
 contratacaoController.confirmarEntrega(req, res);
  
});



router.get("/pagarcontratacao/:id", function(req, res){
  contratacaoController.exibirPagamento(req, res)
});

// // Exibir página de pagamento da contratação
// router.get("/pagar-contratacao/:id", 
  
//     async (req, res) => {
//         const contratacaoId = req.params.id;
//         const usuarioLogadoId = req.session.autenticado.id;

//         // Buscar contratação no model
//         const contratacao = await contratacaoModel.findId(contratacaoId);

//         if (!contratacao) return res.status(404).send("Contratação não encontrada.");

//         if (Number(contratacao.ID_CLIENTE) !== usuarioLogadoId) {
//             return res.status(403).send("Você não tem permissão para acessar esta contratação.");
//         }

//         res.render("pages/pagarcontratacao", { contratacao });
//     }
// );

// Criar preferência Mercado Pago
router.post("/contratacoes/create-preference", async (req, res) => {
    const preference = new Preference(client);
    const { idContratacao, valor, nomeProjeto } = req.body;

    console.log("Criando preferência para contratação:", req.body);

    const idPedido = Date.now().toString();

    preference.create({
        body: {
            items: [
                {
                    title: `Pagamento da contratação: ${nomeProjeto}`,
                    quantity: 1,
                    unit_price: Number(valor)
                }
            ],
            external_reference: `${idContratacao}`,
            back_urls: {
                success: process.env.URL_BASE + "/feedback-contratacao",
                failure: process.env.URL_BASE + "/feedback-contratacao",
                pending: process.env.URL_BASE + "/feedback-contratacao"
            },
            auto_return: "approved"
        }
    })
    .then(value => res.json(value))
    .catch(err => {
        console.error("Erro ao criar preferência:", err);
        res.status(500).json({ erro: "Erro ao criar preferência" });
    });
});



router.get("/feedback-contratacao", function (req, res) {
  pagamentoController.gravarPagamentoContratacao(req, res);
});




router.get(
  "/chat",
  verificarUsuAutorizado(["profissional", "comum", "administrador"], "pages/acesso-negado"),
  async function (req, res) {
    mensagemController.mostrarChat(req, res);
  }
);


router.get("/procurarFoto/:id", listagensController.procurarFoto);


router.get("/atualizarbarralateral", mensagemController.atualizarbarralateral);

router.post("/marcarcomolida", mensagemController.marcarcomolida);



router.post("/chat",
  mensagemController.regrasValidacaoMensagem,
  verificarUsuAutorizado(["profissional", "comum", "administrador"], "pages/acesso-negado"),
  async function (req, res) {
    mensagemController.enviarMensagem(req, res);
  }
);


router.get(
  "/chat/mensagens/:id",
  verificarUsuAutorizado(["profissional", "comum", "administrador"], "pages/acesso-negado"),
  async function (req, res) {
    mensagemController.mostrarConversas(req, res);
  }
);


router.get("/teste", function (req, res) {
    res.render('pages/teste')
 
});


router.get("/menu", function (req, res) { //menu
    res.render('pages/menu')
 
});


router.get("/pedido", function (req, res) { //pedido (publicacao do oportunidades)
    res.render('pages/pedido')
 
});






router.get(
  "/meu-perfil-artista",
  verificarUsuAutorizado(["profissional", "comum"], "pages/acesso-negado"),
  async function (req, res) {
    usuariosController.mostrarPerfil(req, res);
  }
);




router.post(
  "/meu-perfil-artista",
 uploadFile().multi([
  { name: "img_perfil", maxCount: 1 },
  { name: "img_capa", maxCount: 1 }
]),
  usuariosController.regrasValidacaoPerfil,
  async function (req, res) {
    usuariosController.gravarPerfil(req, res);
  }
);




router.post(
  "/atualizardtg",
  usuariosController.regrasValidacaoGeneroData,
  async function (req, res) {
    usuariosController.gravarGeneroData(req, res);
  }
);


router.post(
  "/atualizarsenha",
  usuariosController.regrasValidacaoSenha,
  async function (req, res) {
    usuariosController.gravarNovaSenha(req, res);
  }
);

router.post(
  "/alterar-tipo-usuario",
  async function (req, res) {
    usuariosController.alterarTipoUsuario(req, res);
  }
);


router.post(
  "/desativar-conta",
  async function (req, res) {
    usuariosController.desativarConta(req, res);
  }
);




router.get(
    "/editar-perfil",
    verificarUsuAutorizado(["profissional", "comum"], "pages/acesso-negado"),
    async function (req, res) {
        usuariosController.mostrarPerfilEditar(req, res);
    }
  );
 
 
 

// router.post(
//   "editar-perfil",
//   uploadFile("img_perfil"),                  
//   usuariosController.regrasValidacaoPerfil,  
//   async function (req, res) {
//     usuariosController.gravarPerfil(req, res);
//   }
// );



router.get("/explorar-logado", function (req, res) { //inicial logado
    res.render('pages/explorar-logado', req.session.autenticado)
 
});


router.get(
  "/notificacoes",function (req, res) {
     const dadosNotificacao = req.session.dadosNotificacao || null;
  req.session.dadosNotificacao = null;
     notificacoesController.listar(req, res, dadosNotificacao);
  }
);



router.post("/excluir-notificacoes", function (req, res) {
 
    notificacoesController.excluirNotificacoes(req, res);
});


router.get("/notificacoes/count", notificacoesController.countNaoLidas);

router.get("/messagescount", mensagemController.temNovasMsgs);




router.get(
  "/notificacao/:id",function (req, res) {
    const idSelecionado = req.params.id;
   notificacoesController.exibir(req, res);

  }
);











router.get("/contratacoes", function (req, res) { 

    const dadosNotificacao = req.session.dadosNotificacao || null;
  req.session.dadosNotificacao = null;

    res.render('pages/contratacoes', { dadosNotificacao });
 
});



router.get(
  "/criar-contratacao",
  (req, res, next) => {
    // 👇 Checa se o usuário está logado
    if (!req.session.autenticado || !req.session.autenticado.id) {
      req.session.dadosNotificacao = {
        titulo: "Acesso restrito",
        mensagem: "Faça login para acessar esta página.",
        tipo: "error"
      };
      return res.redirect("/login");
    }
    next(); // segue para os próximos middlewares
  },
  verificarUsuAutenticado,
  verificarUsuAutorizado(["comum", "profissional"], "pages/acesso-negado"),
  (req, res) => {
    const dadosNotificacao = req.session.dadosNotificacao || null;
    req.session.dadosNotificacao = null;

    contratacaoController.mostrarPagina(req, res);
  }
);



router.post(
  "/salvarcontratacao",
 contratacaoController.regrasValidacaoCriarContratacao,
  async function (req, res) {
    contratacaoController.criarContratacao(req, res);
  }
);



router.post(
  "/enviar-publicacao",
 uploadFile().multi([
   { name: "images", maxCount: 10 }
]),
 publicacoesController.regrasValidacaoCriarPublicacao,
  async function (req, res) {
    publicacoesController.criarPublicacao(req, res);
  }
);

router.get("/nova-publicacao", function (req, res) {
   const dadosNotificacao = req.session.dadosNotificacao || null;
   req.session.dadosNotificacao = null;

   res.render('pages/nova-publicacao', { dadosNotificacao });
});




router.post(
  "/enviar-publicacao",
 uploadFile().multi([
   { name: "images", maxCount: 10 }
]),
 publicacoesController.regrasValidacaoCriarPublicacao,
  async function (req, res) {
    publicacoesController.criarPublicacao(req, res);
  }
);

// router.post(
//   "/excluir-publicacao",
//   publicacoesController.excluirPublicacao
// );



router.get("/nova-publi-pedido", function (req, res) { 
    res.render('pages/nova-publi-pedido', {
        dadosNotificacao: null,
        listaErros: null
    });
});







router.post(
  "/enviar-proposta-projeto",
 publicacoesController.regrasValidacaoCriarPropostaProjeto,
  async function (req, res) {
    publicacoesController.criarPropostadeProjeto(req, res);
  }
);

router.get("/", verificarUsuAutenticado, function (req, res) {
  const dadosNotificacao = req.session.dadosNotificacao || null;
  req.session.dadosNotificacao = null;

  listagensController.listarPublicacoes(req, res, dadosNotificacao);
});



router.get("/novo-portfolio", async function (req, res) {
  const dadosNotificacao = req.session.dadosNotificacao || null;
  req.session.dadosNotificacao = null;

  listagensController.listarPublicacoesParaColocarNoPortfolio(req, res, dadosNotificacao);
});


router.post(
  "/criar-portfolio",
 publicacoesController.regrasValidacaoCriarPortfolio,
  async function (req, res) {
    publicacoesController.criarPortfolio(req, res);
  }
);

router.get("/portfolio/:id/editar-portfolio", verificarDonoPortfolio, function (req, res) {
  res.render("editar-portfolio", { usuario: req.session.autenticado });
});


router.post(
  "/excluir-portfolio",
  publicacoesController.excluirPortfolio
);

router.post(
  "/editar-portfolio",
 publicacoesController.regrasValidacaoEditarPortfolio,
  async function (req, res) {
    publicacoesController.editarPortfolio(req, res);
  }
);







router.get("/propostadeprojeto/:id", function (req, res){ //pagina de proposta de projeto
  const dadosNotificacao = req.session.dadosNotificacao || null;
  req.session.dadosNotificacao = null;
    listagensController.exibirProposta(req, res, dadosNotificacao);

});


router.get("/avaliacoes", function (req, res) { //pagina das avaliações
    res.render('pages/avaliacoes')
 
});










router.get("/tabela-pagamentos", function (req, res) { //Tabela de pagamentos
    res.render('pages/tabela-pagamentos')
 
});





router.get("/planos", function (req, res) { //planos
    res.render('pages/planos');

 
});

router.get("/quemcadastra", function (req, res) { //quem cadastra
    res.render('pages/quemcadastra');
})

router.get("/pagamento", function (req, res) { //pagamentos
    res.render('pages/pagamento');

 
});



router.get("/contacomum", function (req, res) {
    res.render('pages/contacomum');

 
});

router.get("/cadastroArtista", function (req, res) {
    res.render('pages/cadastroArtista');

 
});

router.get("/escolher-assinatura", function (req, res) {
    res.render('pages/escolher-assinatura');

 
});


router.get("/oportunidades", function (req, res) { //oportunidades logado
   listagensController.listarPropostas(req, res);
 
});


router.get("/pesquisar-propostas", function(req, res) {

   const dadosNotificacao = req.session.dadosNotificacao || null;
  req.session.dadosNotificacao = null;

  pesquisasController.pesquisarPropostas(req, res);
});






router.get("/adm-inicial", function (req, res) { //index adm teste
    res.render('pages/adm-inicial');

 
});

router.get("/adm-lista-usuarios", function (req, res) { // adm teste
    res.render('pages/adm-lista-usuarios');

 
});

router.get("/adm-lista-denuncias", function (req, res) { //adm teste
    res.render('pages/adm-lista-denuncias');

 
});




router.get("/portfolios/:id", function (req, res) { //portfolios

    listagensController.listarPortfoliosdoUsuario(req, res);

});


router.get("/portfolio/:id", function (req, res) { //portfolio

  let dadosNotificacao = [];
  listagensController.exibirPortfolio(req, res, dadosNotificacao);


});



router.get("/api/publicacoes", publicacoesController.getPublicacoesUsuario);



router.post("/adicionar-publis-portfolio", function (req, res) {
    publicacoesController.adicionarPublicacoesAoPortfolio(req, res);
});


router.post("/remover-publis-portfolio", function (req, res) {
    publicacoesController.removerPublicacoesDoPortfolio(req, res);
});



router.get("/planos-assinaturas", function (req, res) { //planos
    res.render('pages/planos-assinaturas');

 
});


router.get("/cadastro-antigo", function (req, res) { 
    res.render('pages/cadastro-antigo', {retorno: null, valores: {nome: "", usuario: "", email: "", celular: "", password: "", confirmpassword: ""}, listaErros: null});
 

 
});




router.get("/cadastro", function (req, res) { //cadastrar
    res.render('pages/cadastro', {retorno: null, valores: {nome: "", usuario: "", email: "", celular: "", password: "", confirmpassword: ""}, listaErros: null});
 
});



router.post( "/teste-cadastro", usuariosController.regrasValidacaoCadastro, function (req, res) {
    usuariosController.cadastrarUsuario(req, res);
}

    
);


router.get("/login", function (req, res) { //login
    res.render('pages/login',  {retorno: null, valores: {email: "", password: ""}, errosLogin: null,   dadosNotificacao:  null});

 
});



router.post( //validações login
    "/login",

   usuariosController.regrasValidacaoLogin, 
   gravarUsuAutenticado,
   admController.verificarBloqueioSessaoMiddleware,
   function (req, res) {
     usuariosController.logar(req, res);
   }
);

router.get("/logout", limparSessao, function (req, res) {
  res.redirect("/");
});

router.get('/enviaremail', (req, res) => {
  usuariosController.enviarEmailparaAtivarConta(req, res);
});

router.get(
  "/ativar-conta",
  verificarUsuAutenticado,
  async function (req, res) {
    usuariosController.ativarConta(req, res);
  }
);

router.get("/recuperar-senha", 
  verificarUsuAutenticado, 
  function(req, res){
    res.render("pages/rec-senha",
      { listaErros: null, dadosNotificacao: null });
});

router.post("/recuperar-senha",
  verificarUsuAutenticado,
  usuariosController.regrasValidacaoFormRecSenha, 
  function(req, res){
    usuariosController.recuperarSenha(req, res);
});

router.get("/resetar-senha", 
  function(req, res){
    usuariosController.validarTokenNovaSenha(req, res);
  });
  
router.post("/reset-senha", 
    usuariosController.regrasValidacaoFormNovaSenha,
  function(req, res){
    usuariosController.resetarSenha(req, res);
});



router.get('/verificar', async (req, res) => { //jogar essa validação para o usuariosController
  const { campo, valor } = req.query;
  let query;

  switch (campo) {
    case 'email':
      query = 'SELECT * FROM USUARIOS WHERE EMAIL_USUARIO = ?';
      break;
    case 'cpf':
      query = 'SELECT * FROM USUARIOS WHERE CPF_USUARIO = ?';
      break;
    case 'celular':
      query = 'SELECT * FROM USUARIOS WHERE CELULAR_USUARIO = ?';
      break;
    case 'username':
      query = 'SELECT * FROM USUARIOS WHERE USER_USUARIO = ?';
      break;
    default:
      return res.status(400).json({ existe: false });
  }

  try {
    const [resultado] = await db.execute(query, [valor]);
    res.json({ existe: resultado.length > 0 });
  } catch (err) {
    console.error(err);
     res.status(500).render('erro-conexao', {
      mensagem: "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
    });
  }
});


// Excluir publicação (apenas dono)
router.post(
  "/excluir-publicacao",
  async function (req, res) {
    const publicacoesController = require("../controllers/publicacoesController");
    publicacoesController.excluirPublicacao(req, res);
  }
);

router.post('/excluir-proposta', publicacoesController.excluirProposta);


router.get(
  '/adm/denuncias',
  verificarUsuAutorizado(['administrador'], 'pages/acesso-negado'),
  listagensController.listarDenuncias
);

module.exports = router;


















































































































