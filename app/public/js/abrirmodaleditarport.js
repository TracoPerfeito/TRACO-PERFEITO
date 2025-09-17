// ===== Tagify =====
const coresTags = ['#7490C9','#969ED0','#92C4E2','#B8D9BD','#9BB7CF','#C3E3DF','#C2E5F0','#ADBCE2'];

function transformarTag(tagData) {
  const cor = coresTags[Math.floor(Math.random() * coresTags.length)];
  tagData.color = cor;
  tagData.style = "--tag-bg:" + cor;
}

const tagifyPortfolio = new Tagify(document.querySelector('#tags-editar-portfolio'), {
  maxTags: 10,
  dropdown: { maxItems: 20, enabled: 0, closeOnSelect: false },
  transformTag: transformarTag
});

// ===== Modal =====
const modal = document.getElementById("modal-editar-portfolio");
const fecharModalBtn = document.getElementById("fechar-modal-editar-portfolio");

function ajustarModalPortfolio() {
  const content = modal.querySelector(".modal-content-edit-port");
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

function fecharModalPortfolio() {
  modal.style.display = "none";
  document.body.style.overflow = "";
  const content = modal.querySelector(".modal-content-edit-port");
  content.style.maxHeight = "";
  content.style.overflowY = "";
}

fecharModalBtn.addEventListener("click", fecharModalPortfolio);

window.addEventListener("click", (e) => {
  if (e.target === modal) fecharModalPortfolio();
});

// ===== Abrir modal =====
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-editar-portfolio");
  if (!btn) return;

   console.log("ID capturado no botão:", btn.dataset.id);
  // Preenche os campos do modal
  document.getElementById("id-editar-portfolio").value = btn.dataset.id || "";
  document.getElementById("id-portfolio-remocao").value = btn.dataset.id || "";
    document.getElementById("id-portfolio-excluir").value = btn.dataset.id || "";
  document.getElementById("titulo-editar-portfolio").value = btn.dataset.titulo || "";
  document.getElementById("descricao-editar-portfolio").value = btn.dataset.descricao || "";

  const tags = (btn.dataset.tags || "").split(",").map(t => t.trim()).filter(t => t);
  tagifyPortfolio.removeAllTags();
  tagifyPortfolio.addTags(tags);

  // Exibe o modal
  modal.style.display = "flex";
  ajustarModalPortfolio();
});

window.addEventListener("resize", () => {
  if (modal.style.display === "flex") ajustarModalPortfolio();
});

// ===== Submit do formulário =====
const form = document.querySelector('#modal-editar-portfolio form');

form.addEventListener('submit', (e) => {
  // Atualiza o hidden antes de enviar
  const tagsArray = tagifyPortfolio.value.map(tag => tag.value);
  document.getElementById('tags-hidden').value = JSON.stringify(tagsArray);

  // Se quiser, pode validar antes de enviar
  if (!tagsArray.length) {
    e.preventDefault();
    alert("Adicione pelo menos uma tag.");
    return false;
  }
});
