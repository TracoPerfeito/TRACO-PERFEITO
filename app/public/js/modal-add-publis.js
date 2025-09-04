

// --- Funções do modal ---
// --- Variáveis globais ---
const btnAbrir = document.getElementById("btn-abrir-modal-add-publis");
const modal = document.getElementById("modal-add-publis");
const listagem = document.getElementById("listagem-publi");
const loader = document.getElementById("loader-publicacoes");
const inputPublicacoes = document.getElementById("publicacoesSelecionadas");

let publicacoesSelecionadas = new Set();

// --- Funções de modal ---
function ajustarModalMobile() {
  const content = modal.querySelector(".modal-content-add-publis");
  const alturaVisivel = window.visualViewport ? window.visualViewport.height : window.innerHeight;

  if (window.innerWidth <= 768) {
    content.style.maxHeight = (alturaVisivel - 20) + "px";
    content.style.overflowY = "auto";
  } else {
    content.style.maxHeight = "90vh";
    content.style.overflowY = "auto";
  }

  document.body.style.overflow = "hidden";
}

function fecharModal() {
  modal.style.display = "none";
  document.body.style.overflow = "";
  const content = modal.querySelector(".modal-content-add-publis");
  content.style.maxHeight = "";
  content.style.overflowY = "";
}

// --- Função de seleção ---
function toggleSelecao(item, pubId) {
  if (publicacoesSelecionadas.has(pubId)) {
    publicacoesSelecionadas.delete(pubId);
    item.classList.remove("selecionado");
  } else {
    publicacoesSelecionadas.add(pubId);
    item.classList.add("selecionado");
  }
  inputPublicacoes.value = Array.from(publicacoesSelecionadas).join(",");
}

// --- Carrega publicações via fetch ---
async function carregarPublicacoes() {
  loader.style.display = "block";
  listagem.innerHTML = "";

  try {
    const response = await fetch("/api/publicacoes");
    if (!response.ok) throw new Error("Erro ao carregar publicações");

    const publicacoes = await response.json();
    loader.style.display = "none";

    if (!publicacoes || publicacoes.length === 0) {
      listagem.innerHTML = "<p>Nenhuma publicação encontrada.</p>";
      return;
    }

    publicacoes.forEach(pub => {
      if (!pub.imagens || pub.imagens.length === 0) return;

      const item = document.createElement("section");
      item.classList.add("item-publi");

      const img = document.createElement("img");
      img.classList.add("img-publi-modal");
      img.src = pub.imagens[0];

      item.appendChild(img);
      listagem.appendChild(item);

      // Clique para selecionar/deselecionar
      item.addEventListener("click", () => toggleSelecao(item, pub.ID_PUBLICACAO));

      // Se tiver pré-seleção (caso tenha uma lista de IDs do portfolio):
      // if (portfolioPublicacoes.includes(pub.ID_PUBLICACAO)) toggleSelecao(item, pub.ID_PUBLICACAO);
    });

  } catch (error) {
    console.error(error);
    loader.textContent = "Erro ao carregar publicações.";
  }
}

// --- Event listeners ---
btnAbrir.addEventListener("click", () => {
  modal.style.display = "flex";
  ajustarModalMobile();
  carregarPublicacoes();
});

document.getElementById("fechar-modal-add-publis").addEventListener("click", fecharModal);

modal.addEventListener("click", (event) => {
  if (event.target.id === "modal-add-publis") fecharModal();
});

window.addEventListener("resize", () => {
  if (modal.style.display === "flex") ajustarModalMobile();
});


