document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalStatusPerfil");
  const selectAcao = document.getElementById("acaoPerfil");
  const selectPenalidade = document.getElementById("tipoPenalidadePerfil");
  const descricaoPenalidade = document.getElementById("descricaoPenalidadePerfil");
  const inputDataFim = document.getElementById("dataFimPerfil");
  const confirmarBtn = document.getElementById("confirmarStatusPerfil");

  let idDenuncia = null;
  let idUsuarioDenunciado = null;

  // 🔹 Abrir o modal ao clicar no botão de ação
  document.querySelectorAll(".btn-acao-status").forEach((btn) => {
    btn.addEventListener("click", () => {
      idDenuncia = btn.getAttribute("data-denuncia-id");
      idUsuarioDenunciado = btn.getAttribute("data-usuario-id");
      modal.style.display = "flex";
    });
  });

  // 🔹 Fechar modal ao clicar fora
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });

  // 🔹 Controlar exibição das opções de penalidade
  selectAcao.addEventListener("change", () => {
    const opcoes = document.getElementById("opcoesSuspensaoPerfil");
    if (selectAcao.value === "suspender") {
      opcoes.style.display = "block";
      carregarPenalidades();
    } else {
      opcoes.style.display = "none";
      limparCampos();
    }
  });

  // 🔹 Atualizar descrição da penalidade
  selectPenalidade.addEventListener("change", () => {
    const descricao = penalidades.find(
      (p) => p.tipo === selectPenalidade.value
    )?.descricao;
    descricaoPenalidade.textContent = descricao || "";
  });

  // 🔹 Confirmar ação (chama rota do backend)
  confirmarBtn.addEventListener("click", async () => {
    const acao = selectAcao.value;

    if (!acao) {
      alert("Selecione uma ação.");
      return;
    }

    const payload = {
      idDenuncia,
      idUsuarioDenunciado,
      acao,
      tipoPenalidade: selectPenalidade.value || null,
      dataFim: inputDataFim.value || null,
    };

    try {
      const response = await fetch("/adm/denuncias-perfil/alterar-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert("Ação executada com sucesso!");
        location.reload();
      } else {
        alert("Erro: " + (result.message || "Não foi possível atualizar o status."));
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar solicitação ao servidor.");
    }
  });

  // 🔹 Carregar penalidades (simulando do banco)
  const penalidades = [
    { tipo: "leve", descricao: "Suspensão leve por comportamento inadequado." },
    { tipo: "moderada", descricao: "Suspensão temporária de 7 dias." },
    { tipo: "grave", descricao: "Banimento permanente do sistema." },
  ];

  function carregarPenalidades() {
    selectPenalidade.innerHTML = '<option value="">Selecione...</option>';
    penalidades.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.tipo;
      opt.textContent = p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1);
      selectPenalidade.appendChild(opt);
    });
  }

  function limparCampos() {
    selectPenalidade.innerHTML = "";
    descricaoPenalidade.textContent = "";
    inputDataFim.value = "";
  }

  function fecharModal() {
    modal.style.display = "none";
    limparCampos();
  }

  window.fecharModal = fecharModal; // deixa a função global pro botão "Cancelar"
});
