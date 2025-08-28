// Abrir/fechar menu de opções do comentário
document.querySelectorAll('.icone-menu-coment').forEach(icone => {
  icone.addEventListener('click', e => {
    e.stopPropagation();
    const menu = icone.parentElement.querySelector('.opcoes-menu-coment');
    const aberto = menu.style.display === 'block';
    // Fecha todos os outros menus
    document.querySelectorAll('.opcoes-menu-coment').forEach(m => m.style.display = 'none');
    menu.style.display = aberto ? 'none' : 'block';
  });
});

// Fecha menus ao clicar fora
document.addEventListener('click', () => {
  document.querySelectorAll('.opcoes-menu-coment').forEach(menu => menu.style.display = 'none');
});

// Modal de exclusão
const modalExcluirComentario = document.getElementById('modalExcluirComentario');
const inputExcluirComentario = document.getElementById('excluirComentarioId');

// Modal de denúncia
const modalDenunciarComentario = document.getElementById('modalDenunciarComentario');
const inputDenunciarComentario = document.getElementById('denunciarComentarioId');

// Abre modal de exclusão ao clicar no botão
document.querySelectorAll('.btn-excluir-comentario').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const comentarioEl = btn.closest('.comentario');
    inputExcluirComentario.value = comentarioEl.dataset.idComentario;
    modalExcluirComentario.classList.remove('hidden');
    btn.closest('.opcoes-menu-coment').style.display = 'none';
  });
});

// Abre modal de denúncia ao clicar no botão
document.querySelectorAll('.btn-denunciar-comentario').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const comentarioEl = btn.closest('.comentario');
    inputDenunciarComentario.value = comentarioEl.dataset.idComentario;
    modalDenunciarComentario.classList.remove('hidden');
    btn.closest('.opcoes-menu-coment').style.display = 'none';
  });
});

// Fecha modal de exclusão ao clicar no botão cancelar
modalExcluirComentario.querySelector('.btn-fechar-modal-coment').addEventListener('click', () => {
  modalExcluirComentario.classList.add('hidden');
  inputExcluirComentario.value = '';
});

// Fecha modal de denúncia ao clicar no botão cancelar
modalDenunciarComentario.querySelector('.btn-fechar-modal-coment').addEventListener('click', () => {
  modalDenunciarComentario.classList.add('hidden');
  inputDenunciarComentario.value = '';
});

// Fecha modal de exclusão clicando fora do conteúdo
modalExcluirComentario.addEventListener('click', e => {
  if (e.target === modalExcluirComentario) {
    modalExcluirComentario.classList.add('hidden');
    inputExcluirComentario.value = '';
  }
});

// Fecha modal de denúncia clicando fora do conteúdo
modalDenunciarComentario.addEventListener('click', e => {
  if (e.target === modalDenunciarComentario) {
    modalDenunciarComentario.classList.add('hidden');
    inputDenunciarComentario.value = '';
  }
});
