const modal = document.getElementById('modalDenuncia'); 
const fecharModal = document.getElementById('fecharModal'); 
const formDenuncia = document.getElementById('formDenuncia'); 
document.querySelectorAll('.btn-denunciar').forEach(botao => { 
  botao.addEventListener('click', function() { 
  modal.style.display = 'block'; 
}); 
}); 
fecharModal.addEventListener('click', function() { 
  modal.style.display = 'none';
 }); 
 formDenuncia.addEventListener('submit', function(event) {
   event.preventDefault(); 
   const motivo = formDenuncia.motivo.value; 
   if (motivo) { 
    alert('Publicação denunciado com o motivo: ' + motivo);
     modal.style.display = 'none'; 
    } else { alert('Selecione um motivo para a denúncia.');

     } 
    }); document.querySelectorAll('.icone-menu').forEach(icone => {
       icone.addEventListener('click', function (e) {
         e.stopPropagation();
          const menu = this.parentElement; menu.classList.toggle('ativo');
         }); 
        });
        
        // fechar ao clicar fora document.addEventListener('click', () => { document.querySelectorAll('.menu-opcoes').forEach(menu => { menu.classList.remove('ativo'); }); });
        
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