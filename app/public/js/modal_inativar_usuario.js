// Pega elementos
const overlay = document.getElementById("overlay");
const fecharModal = document.querySelector(".close-modal");
const cancelar = document.querySelector(".btn-cancelar");
const botoesDeletar = document.querySelectorAll(".btn-acao.deletar");
const btnConfirmar = document.querySelector(".btn-confirmar");

let usuarioId = null; // Armazena o ID do usuário selecionado

// Abrir modal e capturar o ID
botoesDeletar.forEach(btn => {
  btn.addEventListener("click", () => {
    usuarioId = btn.getAttribute("data-id");
    overlay.style.display = "flex";
  });
});

// Fechar modal
[fecharModal, cancelar].forEach(el => {
  el.addEventListener("click", () => {
    overlay.style.display = "none";
    usuarioId = null;
  });
});

// Confirmar inativação
btnConfirmar.addEventListener("click", async () => {
  if (!usuarioId) return;

  try {
    const response = await fetch(`/adm/desativar-usuario/${usuarioId}`, {
      method: "PUT",
    });

    if (response.ok) {
      new Notify({
        status: "success",
        title: "Usuário inativado!",
        text: "O status foi atualizado com sucesso.",
        effect: "slide",
        speed: 300,
        showIcon: true,
      });
      setTimeout(() => location.reload(), 1500); // Atualiza a página após sucesso
    } else {
      new Notify({
        status: "error",
        title: "Erro!",
        text: "Não foi possível inativar o usuário.",
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
});

// Fechar clicando fora do modal
overlay.addEventListener("click", e => {
  if (e.target === overlay) {
    overlay.style.display = "none";
    usuarioId = null;
  }
});

lucide.createIcons();
