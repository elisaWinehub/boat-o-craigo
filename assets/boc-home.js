(function () {
  'use strict';

  const INSTANCES = new WeakMap();
  const DEFAULT_AUTOPLAY_MS = 6000;

  class BocHeroSlider {
    constructor(root) {
      if (INSTANCES.has(root)) {
        return INSTANCES.get(root);
      }

      this.root = root;
      this.slides = Array.from(root.querySelectorAll('[data-boc-hero-slide]'));
      this.dots = Array.from(root.querySelectorAll('[data-boc-hero-dot]'));
      this.prevBtn = root.querySelector('[data-boc-hero-prev]');
      this.nextBtn = root.querySelector('[data-boc-hero-next]');
      this.current = 0;
      this.timer = null;
      this.autoplayMs = parseInt(root.dataset.autoplayMs || DEFAULT_AUTOPLAY_MS, 10);
      this.autoplayEnabled = root.dataset.autoplay !== 'false';
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.handlers = [];

      INSTANCES.set(root, this);
      this.init();
    }

    bind(el, type, handler) {
      el.addEventListener(type, handler);
      this.handlers.push({ el, type, handler });
    }

    init() {
      if (this.slides.length === 0) {
        return;
      }

      this.show(0);

      if (this.slides.length <= 1) {
        return;
      }

      if (this.prevBtn) {
        this.bind(this.prevBtn, 'click', () => {
          this.show(this.current - 1);
          this.restartAutoplay();
        });
      }

      if (this.nextBtn) {
        this.bind(this.nextBtn, 'click', () => {
          this.show(this.current + 1);
          this.restartAutoplay();
        });
      }

      this.dots.forEach((dot, index) => {
        this.bind(dot, 'click', () => {
          this.show(index);
          this.restartAutoplay();
        });
      });

      this.startAutoplay();
    }

    show(index) {
      this.current = (index + this.slides.length) % this.slides.length;

      this.slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === this.current);
        slide.setAttribute('aria-hidden', slideIndex === this.current ? 'false' : 'true');
      });

      this.dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === this.current);
        dot.setAttribute('aria-current', dotIndex === this.current ? 'true' : 'false');
      });
    }

    startAutoplay() {
      if (!this.autoplayEnabled || this.reducedMotion || this.slides.length <= 1) {
        return;
      }

      clearInterval(this.timer);
      this.timer = window.setInterval(() => {
        this.show(this.current + 1);
      }, this.autoplayMs);
    }

    restartAutoplay() {
      clearInterval(this.timer);
      this.startAutoplay();
    }

    destroy() {
      clearInterval(this.timer);
      this.handlers.forEach(({ el, type, handler }) => {
        el.removeEventListener(type, handler);
      });
      this.handlers = [];
      INSTANCES.delete(this.root);
    }
  }

  function initHeroSliders(scope) {
    const context = scope || document;
    context.querySelectorAll('[data-boc-hero-slider]').forEach((root) => {
      if (!INSTANCES.has(root)) {
        new BocHeroSlider(root);
      }
    });
  }

  function destroyHeroSliders(sectionId) {
    document
      .querySelectorAll('[data-boc-hero-slider][data-section-id="' + sectionId + '"]')
      .forEach((root) => {
        const instance = INSTANCES.get(root);
        if (instance) {
          instance.destroy();
        }
      });
  }

  function initQuantityControls(scope) {
    const context = scope || document;

    context.querySelectorAll('[data-boc-qty]').forEach((wrapper) => {
      if (wrapper.dataset.bocQtyInit === 'true') {
        return;
      }

      const input = wrapper.querySelector('[data-boc-qty-input]');
      const minus = wrapper.querySelector('[data-boc-qty-minus]');
      const plus = wrapper.querySelector('[data-boc-qty-plus]');

      if (!input) {
        return;
      }

      wrapper.dataset.bocQtyInit = 'true';

      if (minus) {
        minus.addEventListener('click', () => {
          const min = parseInt(input.min || '1', 10);
          const next = Math.max(min, parseInt(input.value || '1', 10) - 1);
          input.value = String(next);
        });
      }

      if (plus) {
        plus.addEventListener('click', () => {
          const next = parseInt(input.value || '1', 10) + 1;
          input.value = String(next);
        });
      }
    });
  }

  function init(scope) {
    initHeroSliders(scope);
    initQuantityControls(scope);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', (event) => {
    init(event.target);
  });

  document.addEventListener('shopify:section:unload', (event) => {
    if (event.detail && event.detail.sectionId) {
      destroyHeroSliders(event.detail.sectionId);
    }
  });
})();
