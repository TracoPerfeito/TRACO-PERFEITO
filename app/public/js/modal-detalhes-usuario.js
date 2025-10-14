document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado, JS do modal de detalhes pronto.");

  const overlay = document.getElementById("overlay-detalhes");
  const fecharModal = overlay.querySelector(".close-modal-detalhes");
  const btnCancelar = overlay.querySelector(".btn-cancelar-detalhes");
  const botoesDetalhes = document.querySelectorAll(".btn-acao.ver-detalhes");

  console.log("Botões de detalhes encontrados:", botoesDetalhes.length);

  botoesDetalhes.forEach(btn => {
    btn.addEventListener("click", () => {
      const usuario = JSON.parse(btn.dataset.usuario);
      console.log("Abrindo modal para usuário:", usuario.ID_USUARIO);

      document.getElementById("detalhes-nome").textContent = usuario.NOME_USUARIO;
      document.getElementById("detalhes-email").textContent = usuario.EMAIL_USUARIO;
      document.getElementById("detalhes-celular").textContent = usuario.CELULAR_USUARIO || "-";
      document.getElementById("detalhes-cpf").textContent = usuario.CPF_USUARIO || "-";
      document.getElementById("detalhes-nasc").textContent = usuario.DATA_NASC_USUARIO ? new Date(usuario.DATA_NASC_USUARIO).toLocaleDateString() : "-";
      document.getElementById("detalhes-genero").textContent = usuario.GENERO_USUARIO || "-";
      document.getElementById("detalhes-username").textContent = usuario.USER_USUARIO || "-";
      document.getElementById("detalhes-tipo").textContent = usuario.TIPO_USUARIO || "-";
      document.getElementById("detalhes-status").textContent = usuario.STATUS_USUARIO || "-";
      document.getElementById("detalhes-descricao").textContent = usuario.DESCRICAO_PERFIL_USUARIO || "-";
      document.getElementById("detalhes-linkedin").textContent = usuario.LINKEDIN_USUARIO || "-";
      document.getElementById("detalhes-instagram").textContent = usuario.INSTAGRAM_USUARIO || "-";
      document.getElementById("detalhes-pinterest").textContent = usuario.PINTEREST_USUARIO || "-";
      document.getElementById("detalhes-whatsapp").textContent = usuario.WHATSAPP_USUARIO || "-";
      document.getElementById("detalhes-cadastro").textContent = usuario.DATA_CADASTRO ? new Date(usuario.DATA_CADASTRO).toLocaleDateString() : "-";

      overlay.style.display = "flex";
    });
  });

  // Fechar modal clicando no "X" ou botão de fechar
  [fecharModal, btnCancelar].forEach(el => {
    el.addEventListener("click", () => {
      overlay.style.display = "none";
      console.log("Modal fechado.");
    });
  });

  // Fechar clicando fora do conteúdo
  overlay.addEventListener("click", e => {
    if (e.target === overlay) {
      overlay.style.display = "none";
      console.log("Modal fechado clicando fora.");
    }
  });

  lucide.createIcons();
  console.log("Ícones do Lucide atualizados.");
});
