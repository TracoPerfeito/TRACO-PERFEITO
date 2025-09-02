
// const btnSalvar = form.querySelector('.btn-salvar-editar-publicacao');

// const titulo = document.getElementById('titulo-editar-publicacao');
// const categoria = document.getElementById('categoria-editar-publicacao');

// const descricao = document.getElementById('descricao-editar-publicacao');
// const tagInput = document.getElementById('tagInput-editar');

// // Criar elementos de erro
// function criarErro(input) {
//     let p = input.parentElement.querySelector('.erro-msg');
//     if (!p) {
//         p = document.createElement('p');
//         p.className = 'erro-msg';
//         p.style.color = 'red';
//         p.style.fontSize = '0.85em';
//         input.parentElement.appendChild(p);
//     }
//     return p;
// }

// // Contador de caracteres para descrição
// let contadorDesc = document.createElement('p');
// contadorDesc.style.fontSize = '0.8em';
// contadorDesc.style.textAlign = 'right';
// contadorDesc.style.color = '#555';
// descricao.parentElement.appendChild(contadorDesc);

// // Função de validação geral
// function validar() {
//     let valido = true;

//     // Título
//     const pTitulo = criarErro(titulo);
//     if (titulo.value.trim().length < 2 || titulo.value.trim().length > 70) {
//         pTitulo.textContent = 'O título deve ter entre 2 e 70 caracteres.';
//         valido = false;
//     } else {
//         pTitulo.textContent = '';
//     }

//     // Categoria
//     const pCategoria = criarErro(categoria);
//     if (categoria.value === '') {
//         pCategoria.textContent = 'Selecione uma categoria.';
//         valido = false;
//     } else if (categoria.value === 'outro') {
//         if (inputOutra.value.trim().length < 2 || inputOutra.value.trim().length > 30) {
//             pCategoria.textContent = 'A outra categoria deve ter entre 2 e 30 caracteres.';
//             valido = false;
//         } else {
//             pCategoria.textContent = '';
//         }
//     } else {
//         pCategoria.textContent = '';
//     }

//     // Descrição
//     const pDescricao = criarErro(descricao);
//     const lenDesc = descricao.value.trim().length;
//     contadorDesc.textContent = `${lenDesc}/2000 caracteres`;
//     if (lenDesc < 2 || lenDesc > 2000) {
//         pDescricao.textContent = 'A descrição deve ter entre 2 e 2000 caracteres.';
//         valido = false;
//     } else {
//         pDescricao.textContent = '';
//     }

//     // Tags
//     const pTags = criarErro(tagInput);
//     if (!tagifyEditar.value || tagifyEditar.value.length === 0) {
//         pTags.textContent = 'É necessário ter pelo menos uma tag.';
//         valido = false;
//     } else {
//         pTags.textContent = '';
//     }

//     // Desabilita ou habilita botão
//     btnSalvar.disabled = !valido;

//     return valido;
// }

// // Validar em tempo real
// [titulo, categoria, inputOutra, descricao].forEach(el => {
//     el.addEventListener('input', validar);
// });

// // Também validar quando mudar o select
// categoria.addEventListener('change', validar);

// // Inicializa validação
// validar();

// // Antes de enviar, valida novamente
// form.addEventListener('submit', (e) => {
//     if (!validar()) {
//         e.preventDefault();
//     } else if (categoria.value === 'outro') {
//         categoria.value = inputOutra.value.trim();
//     }
// });
