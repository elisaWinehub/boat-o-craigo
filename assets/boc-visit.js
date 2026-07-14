(function () {
  'use strict';

  var ROOT = '[data-boc-visit]';

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function smoothScrollTo(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  function initScrollLinks(root) {
    root.querySelectorAll('[data-boc-visit-scroll]').forEach(function (link) {
      if (link.dataset.bocVisitScrollBound === 'true') return;
      link.dataset.bocVisitScrollBound = 'true';

      link.addEventListener('click', function (event) {
        var href = link.getAttribute('href') || '';
        if (href.charAt(0) !== '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        smoothScrollTo(target);
      });
    });
  }

  function initAnchorNav(root) {
    var nav = root.querySelector('[data-boc-visit-nav]');
    if (!nav || nav.dataset.bocVisitNavBound === 'true') return;
    if (nav.getAttribute('data-tracking') !== 'true') return;
    nav.dataset.bocVisitNavBound = 'true';

    var links = nav.querySelectorAll('.boc-visit-nav__link');
    var sections = [];

    links.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return;
      var section = document.querySelector(href);
      if (section) sections.push({ link: link, section: section });
    });

    if (!sections.length) return;

    function updateActive() {
      var scrollY = window.scrollY + 120;
      var current = sections[0];
      sections.forEach(function (item) {
        if (item.section.offsetTop <= scrollY) current = item;
      });
      links.forEach(function (l) { l.classList.remove('is-active'); });
      if (current) current.link.classList.add('is-active');
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  function initReviewsCarousel(root) {
    var carousel = root.querySelector('[data-boc-visit-reviews-carousel]');
    if (!carousel || carousel.dataset.bocVisitCarouselBound === 'true') return;
    carousel.dataset.bocVisitCarouselBound = 'true';
  }

  function initRoot(root) {
    if (!root || root.dataset.bocVisitInit === 'true') return;
    root.dataset.bocVisitInit = 'true';
    initScrollLinks(root);
    initAnchorNav(root);
    initReviewsCarousel(root);
  }

  function initAll() {
    document.querySelectorAll(ROOT).forEach(initRoot);
    initScrollLinks(document.body);
  }

  document.addEventListener('DOMContentLoaded', initAll);

  document.addEventListener('shopify:section:load', function (event) {
    var target = event.target;
    var root = target.querySelector(ROOT) || (target.matches && target.matches(ROOT) ? target : null);
    if (root) {
      root.dataset.bocVisitInit = 'false';
      initRoot(root);
    }
    initScrollLinks(document.body);
  });

  document.addEventListener('shopify:section:unload', function () {
    /* Scoped listeners use dataset guards; no global teardown required. */
  });
})();
