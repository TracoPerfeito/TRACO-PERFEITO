
document.addEventListener('DOMContentLoaded', () => {
  const modalExcluirComentario = document.getElementById('modalExcluirComentario');
  const inputExcluirComentario = document.getElementById('excluirComentarioId');

  const modalDenunciarComentario = document.getElementById('modalDenunciarComentario');
  const inputDenunciarComentario = document.getElementById('denunciarComentarioId');

  const btnCancelarModal = document.querySelectorAll('.btn-fechar-modal-coment');

  const fecharModal = (modal, input) => {
    modal.classList.add('hidden');
    if (input) input.value = '';
  };

  // -------------------------
  // EXCLUIR COMENTÁRIO
  // -------------------------
  document.querySelectorAll('.btn-excluir-comentario').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();

      const comentarioEl = btn.closest('.comentario');
      const idComentario = comentarioEl.dataset.idComentario;

      // Buscar ID da publicação de forma segura
      const publicacaoEl = document.querySelector('.principal-pag-publi');
      const idPublicacao = publicacaoEl ? publicacaoEl.dataset.idPublicacao : null;

      if (!idComentario || !idPublicacao) {
        alert("Não foi possível identificar o comentário ou a publicação.");
        return;
      }

      inputExcluirComentario.value = JSON.stringify({ idComentario, idPublicacao });
      modalExcluirComentario.classList.remove('hidden');

      const menuOpcoes = btn.closest('.opcoes-menu-coment');
      if (menuOpcoes) menuOpcoes.style.display = 'none';
    });
  });

  document.querySelector('#modalExcluirComentario form').addEventListener('submit', e => {
    e.preventDefault();

    const { idComentario, idPublicacao } = JSON.parse(inputExcluirComentario.value);

    fetch('/excluir-comentario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idComentario, idPublicacao })
    })
      .then(res => res.json())
      .then(data => {
        if (data.sucesso) {
          document.querySelector(`.comentario[data-id-comentario="${idComentario}"]`)?.remove();
          alert(data.mensagem || 'Comentário excluído com sucesso!');
        } else {
          alert(data.mensagem || 'Erro ao excluir comentário.');
        }
      })
      .catch(() => alert('Erro ao excluir comentário.'))
      .finally(() => fecharModal(modalExcluirComentario, inputExcluirComentario));
  });

  // -------------------------
  // DENUNCIAR COMENTÁRIO
  // -------------------------
  document.querySelectorAll('.btn-denunciar-comentario').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();

      const menuOpcoes = btn.closest('.opcoes-menu-coment');
      const idComentario = menuOpcoes.dataset.idComentario;

      if (!idComentario) {
        alert("Não foi possível identificar o comentário.");
        return;
      }

      inputDenunciarComentario.value = idComentario;
      modalDenunciarComentario.classList.remove('hidden');
      menuOpcoes.style.display = 'none';
    });
  });

  // -------------------------
  // FECHAR MODAIS
  // -------------------------
  btnCancelarModal.forEach(btn => {
    btn.addEventListener('click', () => {
      fecharModal(modalExcluirComentario, inputExcluirComentario);
      fecharModal(modalDenunciarComentario, inputDenunciarComentario);
    });
  });

  [modalExcluirComentario, modalDenunciarComentario].forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        if (modal === modalExcluirComentario) fecharModal(modalExcluirComentario, inputExcluirComentario);
        else if (modal === modalDenunciarComentario) fecharModal(modalDenunciarComentario, inputDenunciarComentario);
      }
    });
  });

  // -------------------------
  // MENU DE OPÇÕES DO COMENTÁRIO
  // -------------------------
  document.querySelectorAll('.icone-menu-coment').forEach(icone => {
    icone.addEventListener('click', e => {
      e.stopPropagation();
      const menu = icone.parentElement.querySelector('.opcoes-menu-coment');
      if (menu.style.display === 'block') menu.style.display = 'none';
      else {
        document.querySelectorAll('.opcoes-menu-coment').forEach(m => m.style.display = 'none');
        menu.style.display = 'block';
      }
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.opcoes-menu-coment').forEach(menu => menu.style.display = 'none');
  });
});
