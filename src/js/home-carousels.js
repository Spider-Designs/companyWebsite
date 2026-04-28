import EmblaCarousel from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';

function initReviewCarousel() {
  var reviewRoot = document.querySelector('[data-embla="reviews"]');
  if (!reviewRoot) {
    return;
  }

  var reviewViewport = reviewRoot.querySelector('.embla__viewport');
  var reviewEmbla = EmblaCarousel(reviewViewport, {
    loop: true,
    align: 'start',
    containScroll: 'trimSnaps'
  }, [
    Autoplay({
      delay: 4500,
      playOnInit: true,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
      stopOnInteraction: false
    })
  ]);

  var prevButton = reviewRoot.querySelector('[data-embla-prev]');
  var nextButton = reviewRoot.querySelector('[data-embla-next]');

  function updateButtons() {
    if (prevButton) {
      prevButton.disabled = !reviewEmbla.canScrollPrev();
    }
    if (nextButton) {
      nextButton.disabled = !reviewEmbla.canScrollNext();
    }
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      reviewEmbla.scrollPrev();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      reviewEmbla.scrollNext();
    });
  }

  reviewEmbla.on('init', updateButtons);
  reviewEmbla.on('select', updateButtons);
  reviewEmbla.on('reInit', updateButtons);
  updateButtons();
}

initReviewCarousel();
