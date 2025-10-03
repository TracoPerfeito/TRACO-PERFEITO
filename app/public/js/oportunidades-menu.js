// Script para menu de opções (três pontinhos) igual ao da página de proposta de projeto
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.menu-opcoes').forEach(menu => {
    const icone = menu.querySelector('.icone-menu');
    const opcoes = menu.querySelector('.opcoes-menu');
    if (!icone || !opcoes) return;
    opcoes.style.display = 'none';
    icone.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = opcoes.style.display === 'flex';
      document.querySelectorAll('.opcoes-menu').forEach(m => m.style.display = 'none');
      opcoes.style.display = isOpen ? 'none' : 'flex';
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.opcoes-menu').forEach(opcoes => {
      opcoes.style.display = 'none';
    });
  });

  // Modal de denúncia
  document.querySelectorAll('.btn-denunciar-proposta').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = document.getElementById('modalDenuncia');
      if (modal) {
        // Preenche o id da proposta no modal
        const id = btn.getAttribute('data-id');
        const inputId = document.getElementById('idPropostaInput');
        if (inputId) inputId.value = id;
        modal.style.display = 'block';
      }
    });
  });
  const btnFechar = document.getElementById('fecharModal');
  const modalDenuncia = document.getElementById('modalDenuncia');
  if (btnFechar && modalDenuncia) {
    btnFechar.addEventListener('click', () => {
      modalDenuncia.style.display = 'none';
    });
    modalDenuncia.addEventListener('click', (e) => {
      if (e.target === modalDenuncia) {
        modalDenuncia.style.display = 'none';
      }
    });
  }

  // Modal de edição de proposta
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // O script do modal já escuta o click global, mas garantimos que o modal será aberto
      // e o scroll bloqueado
      const modal = document.getElementById('modal-editar-proposta');
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    });
  });
});
