console.log("Script do modal carregado.");

// Elementos
const overlay = document.getElementById("overlay");
const fecharModal = overlay.querySelector(".close-modal");
const cancelar = overlay.querySelector(".btn-cancelar");
const btnConfirmar = overlay.querySelector(".btn-confirmar");
const tituloModal = overlay.querySelector("#modal-titulo");
const mensagemModal = overlay.querySelector("#modal-mensagem");
const detalheModal = overlay.querySelector("#modal-detalhe");

let usuarioId = null;
let acaoUsuario = null;

// Seleciona botões de ação na lista
const botoesStatus = document.querySelectorAll(".btn-acao.deletar, .btn-acao.ativar");
console.log("Botões encontrados:", botoesStatus.length);

botoesStatus.forEach(btn => {
  btn.addEventListener("click", () => {
    usuarioId = btn.dataset.id;
    acaoUsuario = btn.classList.contains("deletar") ? "inativar" : "ativar";

    console.log(`Botão clicado para usuário ID: ${usuarioId} | Ação: ${acaoUsuario}`);

    // Atualiza o modal
    tituloModal.textContent = acaoUsuario === "inativar" ? "Inativar Usuário" : "Ativar Usuário";
    mensagemModal.innerHTML = `<strong>Tem certeza que deseja ${acaoUsuario} este usuário?</strong>`;
    btnConfirmar.innerHTML = `
      <i data-lucide="${acaoUsuario === "inativar" ? "user-x" : "user-check"}"></i>
      Confirmar ${acaoUsuario === "inativar" ? "Inativação" : "Ativação"}
    `;

    lucide.createIcons();
    overlay.style.display = "flex";
  });
});

// Fechar modal
[fecharModal, cancelar].forEach(el => {
  el.addEventListener("click", () => {
    overlay.style.display = "none";
    usuarioId = null;
    acaoUsuario = null;
    console.log("Modal fechado.");
  });
});

// Confirmar ação
btnConfirmar.addEventListener("click", async () => {
  if (!usuarioId) return;

  console.log(`Confirmando ação: ${acaoUsuario} para usuário ID: ${usuarioId}`);

  try {
    const url = acaoUsuario === "inativar" 
      ? `/adm/desativar-usuario/${usuarioId}` 
      : `/adm/ativar-usuario/${usuarioId}`;

    const response = await fetch(url, { method: "PUT" });

    if (response.ok) {
      new Notify({
        status: "success",
        title: `Usuário ${acaoUsuario === "inativar" ? "inativado" : "ativado"}!`,
        text: "O status foi atualizado com sucesso.",
        effect: "slide",
        speed: 300,
        showIcon: true,
      });
      setTimeout(() => location.reload(), 1500);
    } else {
      new Notify({
        status: "error",
        title: "Erro!",
        text: "Não foi possível atualizar o status do usuário.",
        effect: "slide",
        speed: 300,
        showIcon: true,
      });
    }
  } catch (err) {
    console.error(err);
    new Notify({
      status: "error",
      title: "Erro de conexão",
      text: "Falha ao comunicar com o servidor.",
      effect: "slide",
      speed: 300,
      showIcon: true,
    });
  }

  overlay.style.display = "none";
  usuarioId = null;
  acaoUsuario = null;
});

// Fechar clicando fora do modal
overlay.addEventListener("click", e => {
  if (e.target === overlay) {
    overlay.style.display = "none";
    usuarioId = null;
    acaoUsuario = null;
    console.log("Modal fechado clicando fora.");
  }
});

lucide.createIcons();
console.log("Ícones do lucide atualizados.");
