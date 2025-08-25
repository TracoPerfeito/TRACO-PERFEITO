module.exports = (url, token, nomeUsuario)=>{

    return ` <!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de Senha</title>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"> 
 
    <style>
         body {
      font-family: "Montserrat", sans-serif;
      margin: 0;
      padding: 0;
      background-color: #fcfcfc;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #fcfcfc;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #fcfcfc;
      padding: 20px;
      text-align: center;
      border-bottom: 0.7px solid #e7e7e7;
    }
    .header img {
      max-height: 25px;
    }
    .content {
      padding: 30px;
      color: #333;
    }
    h2 {
      margin-top: 0;
      color: #132d46;
    }
    p {
      line-height: 1.5;
      color: #333 !important;
      font-family: "Montserrat", sans-serif;
    }
    .btn {
      display: inline-block;
      padding: 12px 25px;
      margin: 20px 0;
      background-color: #132d46;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: bold;
      border-radius: 5px;
      transition: all 0.3s ease;
    }
    .btn:hover {
      background-color: #234b70;
      transform: translateY(-2px);
    }

    
    .footer {
      font-size: 12px;
      color: #777;
      text-align: center;
      padding: 15px;
      background-color: #fcfcfc;
      border-top: 0.7px solid #e7e7e7;
    }
  </style>
   
</head>
<body>
   <section class="container">
    <!-- Logo -->
    <section class="header">
      <img src="https://tracoperfeito.onrender.com/imagens/logo-titulo.png" alt="Traço Perfeito">
     </section>

    <!-- Conteúdo -->
   <section class="content">
  <h2>Olá, ${nomeUsuario}!</h2>
  <p>
    Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Traço Perfeito</strong> 🔑✨.  
    Para continuar, clique no botão abaixo e crie uma nova senha de forma rápida e segura:
  </p>

  <p style="text-align: center;">
      <a href="${url}/resetar-senha?token=${token}" class="btn">Redefinir minha senha</a>
  </p>

  <p>
    Se você não fez esta solicitação, pode ignorar esta mensagem. Sua senha atual permanecerá a mesma.
  </p>
</section>

<!-- Rodapé -->
<section class="footer">
   © 2025 Traço Perfeito. Todos os direitos reservados.
</section>

  </section>
</body>
</html>`
    
    }
