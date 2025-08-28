const pool = require('../../config/pool_conexoes');

const notificacoesModel = {
  async notificarAdmins(mensagem) {
    // Busca todos os administradores
    const [admins] = await pool.query("SELECT ID_USUARIO, EMAIL_USUARIO FROM USUARIOS WHERE TIPO_USUARIO = 'admnistrador' OR TIPO_USUARIO = 'administrador'");
    // Aqui você pode implementar envio de e-mail, salvar notificação em tabela, etc.
    // Exemplo: apenas logar
    admins.forEach(admin => {
      console.log(`Notificação para admin ${admin.EMAIL_USUARIO}: ${mensagem}`);
    });
    return admins;
  }
};

module.exports = notificacoesModel;
