const modal = document.getElementById('modalDenuncia');
const fecharModal = document.getElementById('fecharModal');
const formDenuncia = document.getElementById('formDenuncia');
const idPublicacaoInput = document.getElementById('idPublicacaoInput');

// Abre modal e seta ID da publicação
document.querySelectorAll('.btn-denunciar').forEach(botao => {
    botao.addEventListener('click', function() {
        const idPub = this.dataset.idPublicacao; // botão deve ter data-id-publicacao
        idPublicacaoInput.value = idPub;
        modal.style.display = 'block';
    });
});

// Fecha modal ao clicar no "Cancelar"
fecharModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Fecha modal ao clicar fora do conteúdo
window.addEventListener('click', (event) => {
    if (event.target === modal) modal.style.display = 'none';
});

// Envia denúncia
formDenuncia.addEventListener('submit', async (event) => {
    event.preventDefault();

    const motivoSelecionado = formDenuncia.querySelector('input[name="motivo"]:checked');
    if (!motivoSelecionado) {
        alert('Selecione um motivo para a denúncia.');
        return;
    }

    const motivo = motivoSelecionado.value;
    const idPublicacao = idPublicacaoInput.value;

    try {
        const formData = new FormData();
        formData.append('idPublicacao', idPublicacao);
        formData.append('motivo', motivo);

        const response = await fetch('/denunciar-publicacao', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert('Denúncia enviada com sucesso!');
            modal.style.display = 'none';
            formDenuncia.reset();
        } else {
            alert(`Erro ao enviar denúncia: ${data.error}`);
        }
    } catch (error) {
        console.error('Erro ao enviar denúncia:', error);
        alert('Erro ao enviar denúncia. Veja o console.');
    }
});
✅ O que você precisa garantir n


    // Script do compartilhar

function openModal(idPublicacao) {
  const modal = document.getElementById('modal-share');
  const shareLink = document.getElementById("shareLink");

  // Atualiza o link dinâmico com o ID passado
  shareLink.textContent = `https://tracoperfeito.onrender.com/publicacao/${idPublicacao}`;

  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-share').style.display = 'none';
}

function copyToClipboard() {
  const text = document.getElementById("shareLink").innerText;
  const tooltip = document.getElementById("tooltip");
  const copyIcon = document.getElementById("copyIcon");
  const copyText = document.getElementById("copyText");

  navigator.clipboard.writeText(text).then(() => {
    // Troca ícone e texto
    copyIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px; margin-right: 4px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    `;
    copyText.textContent = "Link copiado!";

    tooltip.style.display = "block";

    setTimeout(() => {
      copyIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px; margin-right: 4px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M16 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2"/>
        </svg>
      `;
      copyText.textContent = "Copiar link";
      tooltip.style.display = "none";
    }, 2000);
  });
}