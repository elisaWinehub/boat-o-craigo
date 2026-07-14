(function () {
  'use strict';

  var SQUEEZE_QUERY = window.matchMedia('(min-width: 990px)');
  var ANCHOR_NAV_SELECTOR = '.boc-visit-nav, .boc-about-nav, .boc-whats-on-nav';
  var SHOW_AFTER_PX = 480;

  function getScrollContainer() {
    if (SQUEEZE_QUERY.matches) {
      return document.querySelector('.page-wrapper') || document.documentElement;
    }
    return document.documentElement;
  }

  function getScrollTop() {
    return getScrollContainer().scrollTop;
  }

  function scrollToTop() {
    var behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    getScrollContainer().scrollTo({ top: 0, behavior: behavior });
  }

  function getHeaderOffset() {
    var styles = getComputedStyle(document.documentElement);
    var height = parseInt(styles.getPropertyValue('--header-height'), 10);
    if (!height || Number.isNaN(height)) {
      height = parseInt(styles.getPropertyValue('--boc-header-height'), 10);
    }
    return Number.isNaN(height) ? 88 : height;
  }

  function bindScroll(handler) {
    window.addEventListener('scroll', handler, { passive: true });
    var container = getScrollContainer();
    if (container && container !== document.documentElement) {
      container.addEventListener('scroll', handler, { passive: true });
    }
  }

  function syncHeaderHeight() {
    var header = document.querySelector('[data-boc-header]');
    if (!header) return;

    var height = Math.round(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--boc-header-height', height + 'px');
    document.body.style.setProperty('--header-height', height + 'px');
  }

  function initBackToTop() {
    var button = document.querySelector('[data-boc-back-to-top]');
    if (!button || button.dataset.bocBackToTopInit === 'true') return;
    button.dataset.bocBackToTopInit = 'true';

    function updateVisibility() {
      var visible = getScrollTop() > SHOW_AFTER_PX;
      button.hidden = !visible;
      button.classList.toggle('is-visible', visible);
    }

    button.addEventListener('click', scrollToTop);
    bindScroll(updateVisibility);
    updateVisibility();
  }

  function initStickyAnchorNav(nav) {
    if (!nav || nav.dataset.bocStickyNavInit === 'true') return;
    if (
      nav.classList.contains('boc-visit-nav--disabled') ||
      nav.classList.contains('boc-about-nav--disabled') ||
      nav.classList.contains('boc-whats-on-nav--disabled')
    ) {
      return;
    }

    nav.dataset.bocStickyNavInit = 'true';

    function updateStuck() {
      var headerOffset = getHeaderOffset();
      var rect = nav.getBoundingClientRect();
      var stuck = rect.top <= headerOffset + 1 && getScrollTop() > 0;
      nav.classList.toggle('is-stuck', stuck);
    }

    bindScroll(updateStuck);
    window.addEventListener('resize', updateStuck);
    updateStuck();
  }

  function initStickyAnchorNavs() {
    document.querySelectorAll(ANCHOR_NAV_SELECTOR).forEach(initStickyAnchorNav);
  }

  function initAll() {
    syncHeaderHeight();
    initBackToTop();
    initStickyAnchorNavs();
  }

  window.BocScroll = {
    getContainer: getScrollContainer,
    getTop: getScrollTop,
    getHeaderOffset: getHeaderOffset,
    bind: bindScroll,
    scrollToTop: scrollToTop,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  window.addEventListener('resize', syncHeaderHeight);

  document.addEventListener('shopify:section:load', function () {
    syncHeaderHeight();
    initStickyAnchorNavs();
    initBackToTop();
  });
})();
