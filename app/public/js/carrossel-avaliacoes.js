document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.carousel-container');
  const track = container?.querySelector('.carousel-track');
  const prevButton = container?.querySelector('.carousel-button.prev');
  const nextButton = container?.querySelector('.carousel-button.next');

  if (!container || !track || !prevButton || !nextButton) return;

  const slides = Array.from(track.children);
  if (slides.length === 0) return;

  const slideWidth = slides[0].getBoundingClientRect().width;
  slides.forEach((slide, index) => slide.style.left = `${slideWidth * index}px`);

  // === Controle manual com botões ===
  let currentIndex = 0;
  function updateCarousel(index) {
    track.style.transform = `translateX(-${slideWidth * index}px)`;
    updateButtons();
  }

  function updateButtons() {
    if (currentIndex > 0) prevButton.style.display = 'block';
    else prevButton.style.display = 'none';

    if (currentIndex < slides.length - Math.floor(container.clientWidth / slideWidth)) 
      nextButton.style.display = 'block';
    else nextButton.style.display = 'none';
  }

  const isScrollable = track.scrollWidth > container.clientWidth;
  if (!isScrollable) {
    prevButton.style.display = 'none';
    nextButton.style.display = 'none';
  } else {
    const userInteracted = () => {
      pauseAutoplay();
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => startAutoplay(), 60000); // 1 minuto sem interagir
    };

    nextButton.addEventListener('click', () => {
      if (currentIndex < slides.length - Math.floor(container.clientWidth / slideWidth)) {
        currentIndex++;
        updateCarousel(currentIndex);
        userInteracted();
      }
    });

    prevButton.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel(currentIndex);
        userInteracted();
      }
    });
  }

  updateButtons();

  // === Autoplay contínuo e suave ===
  let scrollX = 0;
  let direction = 1; // 1 = direita, -1 = esquerda
  const speed = 0.3; 
  let autoplayId;
  let resumeTimeout;

  function autoplay() {
    const maxScroll = track.scrollWidth - container.clientWidth;

    scrollX += direction * speed;

    if (scrollX >= maxScroll) {
      scrollX = maxScroll;
      direction = -1;
    } else if (scrollX <= 0) {
      scrollX = 0;
      direction = 1;
    }

    track.style.transform = `translateX(-${scrollX}px)`;
    autoplayId = requestAnimationFrame(autoplay);
  }

  function startAutoplay() {
    if (!autoplayId) autoplay();
  }

  function pauseAutoplay() {
    cancelAnimationFrame(autoplayId);
    autoplayId = null;
  }

  // Inicia autoplay
  startAutoplay();
});
