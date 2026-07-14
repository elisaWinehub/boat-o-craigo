(function () {
  'use strict';

  var ROOT_SELECTOR = '[data-boc-wine-club]';

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function smoothScrollTo(target) {
    if (!target) return;
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  function initAnchorScroll(root) {
    root.querySelectorAll('[data-boc-wine-club-scroll]').forEach(function (link) {
      if (link.dataset.bocWineClubScrollBound === 'true') return;
      link.dataset.bocWineClubScrollBound = 'true';

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

  function setItemState(item, open) {
    var trigger = item.querySelector('.boc-wine-club-faq__trigger');
    var panel = item.querySelector('.boc-wine-club-faq__panel');
    var icon = item.querySelector('.boc-wine-club-faq__icon');

    if (!trigger || !panel) return;

    item.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
    if (icon) icon.textContent = open ? '−' : '+';
  }

  function initFaq(root) {
    var sections = root.querySelectorAll('[data-boc-wine-club-faq]');
    sections.forEach(function (section) {
      if (section.dataset.bocWineClubFaqBound === 'true') return;
      section.dataset.bocWineClubFaqBound = 'true';

      var oneOpen = section.dataset.oneOpen !== 'false';
      var items = section.querySelectorAll('.boc-wine-club-faq__item');

      items.forEach(function (item) {
        var trigger = item.querySelector('.boc-wine-club-faq__trigger');
        if (!trigger || trigger.dataset.bocWineClubFaqTriggerBound === 'true') return;
        trigger.dataset.bocWineClubFaqTriggerBound = 'true';

        trigger.addEventListener('click', function () {
          var willOpen = !item.classList.contains('is-open');

          if (oneOpen && willOpen) {
            items.forEach(function (other) {
              if (other !== item) setItemState(other, false);
            });
          }

          setItemState(item, willOpen);
        });
      });
    });
  }

  function initRoot(root) {
    if (!root || root.dataset.bocWineClubInit === 'true') return;
    root.dataset.bocWineClubInit = 'true';
    initAnchorScroll(root);
    initFaq(root);
  }

  function initAll() {
    document.querySelectorAll(ROOT_SELECTOR).forEach(initRoot);
  }

  document.addEventListener('DOMContentLoaded', initAll);
  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target.querySelector(ROOT_SELECTOR) || event.target.closest(ROOT_SELECTOR);
    if (root) {
      root.dataset.bocWineClubInit = 'false';
      root.querySelectorAll('[data-boc-wine-club-scroll]').forEach(function (el) {
        el.dataset.bocWineClubScrollBound = 'false';
      });
      root.querySelectorAll('[data-boc-wine-club-faq]').forEach(function (el) {
        el.dataset.bocWineClubFaqBound = 'false';
        el.querySelectorAll('.boc-wine-club-faq__trigger').forEach(function (trigger) {
          trigger.dataset.bocWineClubFaqTriggerBound = 'false';
        });
      });
      initRoot(root);
    } else {
      initAll();
    }
  });

  document.addEventListener('shopify:section:unload', function () {
    /* Listeners are scoped per element; section DOM removal clears them. */
  });
})();
