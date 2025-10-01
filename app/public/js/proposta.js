document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.menu-opcoes').forEach(menu => {
        const icone = menu.querySelector('.icone-menu'); // ícone de três pontos
        const opcoes = menu.querySelector('.opcoes-menu'); // container das opções

        // Inicialmente escondemos o menu
        opcoes.style.display = 'none';

        // Alterna visibilidade do menu ao clicar no ícone
        icone.addEventListener('click', (e) => {
            e.stopPropagation(); // impede que o clique feche o menu
            const isOpen = opcoes.style.display === 'flex';
            // Fecha todos os outros menus
            document.querySelectorAll('.opcoes-menu').forEach(m => m.style.display = 'none');
            // Abre ou fecha o menu atual
            opcoes.style.display = isOpen ? 'none' : 'flex';
        });
    });

    // Fecha todos os menus ao clicar fora
    document.addEventListener('click', () => {
        document.querySelectorAll('.opcoes-menu').forEach(opcoes => {
            opcoes.style.display = 'none';
        });
    });
});

// Modal de denúncia de proposta
document.addEventListener('DOMContentLoaded', () => {
    const btnDenunciar = document.querySelector('.btn-denunciar-proposta');
    const modalDenuncia = document.getElementById('modalDenuncia');
    const btnFechar = document.getElementById('fecharModal');

    if (btnDenunciar && modalDenuncia) {
        btnDenunciar.addEventListener('click', (e) => {
            e.preventDefault();
            modalDenuncia.style.display = 'block';
        });
    }
    if (btnFechar && modalDenuncia) {
        btnFechar.addEventListener('click', () => {
            modalDenuncia.style.display = 'none';
        });
    }
    // Fecha o modal ao clicar fora do conteúdo
    if (modalDenuncia) {
        modalDenuncia.addEventListener('click', (e) => {
            if (e.target === modalDenuncia) {
                modalDenuncia.style.display = 'none';
            }
        });
    }
});
