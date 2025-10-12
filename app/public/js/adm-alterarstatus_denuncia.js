const modal = document.getElementById("modalStatus");
const btnsStatus = document.querySelectorAll(".btn-btn-status");
const acao = document.getElementById("acao");
const opcoes = document.getElementById("opcoesSuspensao");
const selectPenalidade = document.getElementById("penalidade");
const dataFim = document.getElementById("dataFim");
const btnConfirmar = document.getElementById("confirmarStatus");
const descricaoPenalidade = document.getElementById("descricaoPenalidade");

// Abrir modal
btnsStatus.forEach(btn => {
  btn.addEventListener("click", () => {
    window.denunciaAtual = btn.getAttribute("data-id");
    window.usuarioDenunciado = btn.getAttribute("data-usuario");
    modal.style.display = "block";
    acao.value = ""; // sem ação por padrão
    opcoes.style.display = "none";
    selectPenalidade.innerHTML = `<option value="">Selecione...</option>`;
    descricaoPenalidade.textContent = "";
    dataFim.value = "";
  });
});

// Fechar modal
function fecharModal() { modal.style.display = "none"; }
window.addEventListener("click", e => { if (e.target === modal) fecharModal(); });

// Mostrar opções de suspensão e carregar penalidades (somente quando necessário)
acao.addEventListener("change", async e => {
  if (e.target.value === "suspender") {
    opcoes.style.display = "block";
    try {
      const res = await fetch("/adm/penalidades", { credentials: 'same-origin' });
      if (!res.ok) {
        const txt = await res.text().catch(()=>res.statusText);
        throw new Error(txt || 'Resposta inválida do servidor');
      }
      const tipos = await res.json();
      selectPenalidade.innerHTML = `<option value="">Selecione...</option>`;
      tipos.forEach(t => {
        selectPenalidade.innerHTML += `<option value="${t.ID_PENALIDADE}">${t.NOME_PENALIDADE}</option>`;
      });
    } catch (err) {
      console.error("Erro ao carregar penalidades:", err);
      alert("Erro ao carregar penalidades. Verifique o console e se você está autenticado.");
      opcoes.style.display = "none";
    }
  } else {
    opcoes.style.display = "none";
  }
});

// Atualiza descrição simples com o texto da opção
selectPenalidade.addEventListener("change", () => {
  const texto = selectPenalidade.selectedOptions[0]?.text || "";
  descricaoPenalidade.textContent = texto;
});

// Confirmar alteração
btnConfirmar.addEventListener("click", async () => {
  const tipoPenalidade = selectPenalidade.value;
  const acaoSelecionada = acao.value;
  const idDenuncia = window.denunciaAtual;
  const idUsuario = window.usuarioDenunciado;
  const dataFinal = dataFim.value;

  if (!idDenuncia || !acaoSelecionada) return alert("Erro: dados incompletos.");
  if (acaoSelecionada === "suspender" && !tipoPenalidade) return alert("Selecione uma penalidade.");

  try {
    const resposta = await fetch("/adm/alterar-status-denuncia", {
      method: "POST",
      credentials: 'same-origin',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idDenuncia,
        idUsuario,
        tipoPenalidade,
        dataFim: dataFinal,
        acao: acaoSelecionada,
        tabela: "DENUNCIAS_COMENTARIOS"
      })
    });

    // Se o servidor retornou HTML (p.ex. redirect para login) ou erro, trate
    if (!resposta.ok) {
      const txt = await resposta.text().catch(()=>resposta.statusText);
      throw new Error(txt || 'Erro no servidor');
    }

    // tentar parsear JSON (esperado)
    const resultado = await resposta.json().catch(()=> { throw new Error('Resposta inválida (esperado JSON)'); });

    if (resultado.sucesso) {
      alert("Status alterado com sucesso!");
      fecharModal();
      location.reload();
    } else {
      alert("Erro: " + (resultado.erro || "tente novamente."));
    }
  } catch (err) {
    console.error("Erro ao confirmar alteração:", err);
    alert("Erro ao confirmar alteração. Verifique o console e se você está autenticado.");
  }
});
