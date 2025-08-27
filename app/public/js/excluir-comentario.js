
// Seleciona elementos do modal
const modalExcluirComentario = document.getElementById('modalExcluirComentario');
const inputExcluirComentario = document.getElementById('inputExcluirComentario');
const btnCancelarModal = document.querySelectorAll('.btn-fechar-modal-coment');

// Botão "Excluir comentário" dentro do menu de cada comentário
document.querySelectorAll('.btn-excluir-comentario').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation(); // evita propagação para outros eventos
    const comentarioEl = btn.closest('.comentario');
    
    // Pega ID do comentário e ID da publicação
    const idComentario = comentarioEl.dataset.idComentario;
    const idPublicacao = document.querySelector('input[name="idPublicacao"]').value;

    if (!idComentario || !idPublicacao) {
      alert("Não foi possível identificar o comentário ou a publicação.");
      return;
    }

    // Guarda no input hidden do modal
    inputExcluirComentario.value = JSON.stringify({ idComentario, idPublicacao });

    // Exibe modal
    modalExcluirComentario.classList.remove('hidden');

    // Esconde o menu do comentário
    btn.closest('.opcoes-menu-coment').style.display = 'none';
  });
});

// Botão "Confirmar exclusão" dentro do modal
document.getElementById('btnConfirmarExcluir').addEventListener('click', async () => {
  const { idComentario, idPublicacao } = JSON.parse(inputExcluirComentario.value);

  try {
    const res = await fetch('/excluir-comentario', {
      method: 'POST', // ou DELETE, dependendo do seu controller
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idComentario, idPublicacao })
    });

    const data = await res.json();

    if (res.ok) {
      // Remove comentário da página
      document.querySelector(`.comentario[data-id-comentario="${idComentario}"]`).remove();
      alert(data.mensagem || 'Comentário excluído com sucesso!');
    } else {
      alert(data.mensagem || 'Erro ao excluir comentário.');
    }

  } catch (err) {
    console.error(err);
    alert('Erro ao excluir comentário.');
  } finally {
    // Fecha modal
    modalExcluirComentario.classList.add('hidden');
    inputExcluirComentario.value = '';
  }
});

// Fechar modais ao clicar no botão "Cancelar"
btnCancelarModal.forEach(btn => {
  btn.addEventListener('click', () => {
    modalExcluirComentario.classList.add('hidden');
    inputExcluirComentario.value = '';
  });
});

// Fechar modal clicando fora do conteúdo
modalExcluirComentario.addEventListener('click', e => {
  if (e.target === modalExcluirComentario) {
    modalExcluirComentario.classList.add('hidden');
    inputExcluirComentario.value = '';
  }
});

