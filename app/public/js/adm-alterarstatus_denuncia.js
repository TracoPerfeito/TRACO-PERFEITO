document.getElementById("acao").addEventListener("change", async e => {
  const opcoes = document.getElementById("opcoesSuspensao");
  if (e.target.value === "suspender") {
    opcoes.style.display = "block";

    // Carrega penalidades
    const res = await fetch("/adm/penalidades");
    const penalidades = await res.json();
    const select = document.getElementById("penalidade");
    select.innerHTML = penalidades.map(p => 
      `<option value="${p.ID_PENALIDADE}">${p.NOME_PENALIDADE}</option>`
    ).join("");
  } else {
    opcoes.style.display = "none";
  }
});

document.getElementById("confirmarStatus").addEventListener("click", async () => {
  const acao = document.getElementById("acao").value;
  const idDenuncia = window.denunciaAtual; // Defina isso ao abrir o modal
  const idUsuario = window.usuarioDenunciado; 
  const tipoPenalidade = document.getElementById("penalidade").value;
  const dataFim = document.getElementById("dataFim").value;

  await fetch("/adm/alterar-status-denuncia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idDenuncia, idUsuario, tipoPenalidade, dataFim,
      acao, tabela: "DENUNCIAS_COMENTARIOS"
    })
  });

  fecharModal();
  location.reload();
});