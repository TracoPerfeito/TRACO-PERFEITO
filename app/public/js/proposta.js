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
