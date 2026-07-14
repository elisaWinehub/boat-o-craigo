(function () {
  'use strict';

  var ROOT = '[data-boc-whats-on]';

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function smoothScrollTo(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  function initScrollLinks(root) {
    root.querySelectorAll('[data-boc-whats-on-scroll]').forEach(function (link) {
      if (link.dataset.bocWhatsOnScrollBound === 'true') return;
      link.dataset.bocWhatsOnScrollBound = 'true';

      link.addEventListener('click', function (event) {
        var href = link.getAttribute('href') || '';
        if (href.charAt(0) !== '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        smoothScrollTo(target);

        var tab = link.getAttribute('data-boc-whats-on-enquiry-tab');
        if (tab) {
          activateEnquiryTab(root, tab);
        }
      });
    });
  }

  function getEnquirySection(root) {
    return root.querySelector('[data-boc-whats-on-enquiry]') || document.querySelector('[data-boc-whats-on-enquiry]');
  }

  function activateEnquiryTab(root, tabId) {
    var enquiry = getEnquirySection(root);
    if (!enquiry) return;

    var tabs = enquiry.querySelectorAll('[role="tab"]');
    var panels = enquiry.querySelectorAll('[role="tabpanel"]');

    tabs.forEach(function (tab) {
      var isActive = tab.getAttribute('data-tab') === tabId;
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach(function (panel) {
      var isActive = panel.getAttribute('data-panel') === tabId;
      panel.hidden = !isActive;
    });
  }

  function initEnquiryTabs(root) {
    var enquiry = getEnquirySection(root);
    if (!enquiry || enquiry.dataset.bocWhatsOnTabsBound === 'true') return;
    enquiry.dataset.bocWhatsOnTabsBound = 'true';

    var tablist = enquiry.querySelector('[role="tablist"]');
    if (!tablist) return;

    var tabs = Array.prototype.slice.call(enquiry.querySelectorAll('[role="tab"]'));

    function selectTab(tab) {
      var tabId = tab.getAttribute('data-tab');
      activateEnquiryTab(root, tabId);
      tab.focus();
    }

    tabs.forEach(function (tab, index) {
      if (tab.dataset.bocWhatsOnTabBound === 'true') return;
      tab.dataset.bocWhatsOnTabBound = 'true';

      tab.addEventListener('click', function () {
        selectTab(tab);
      });

      tab.addEventListener('keydown', function (event) {
        var nextIndex = index;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = tabs.length - 1;
        else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectTab(tab);
          return;
        } else return;

        event.preventDefault();
        selectTab(tabs[nextIndex]);
      });
    });

    var hash = window.location.hash.replace('#', '');
    if (hash === 'wedding' || hash === 'private') {
      activateEnquiryTab(root, hash);
    }
  }

  function getMarkerOffset() {
    var headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10);
    if (!headerHeight || Number.isNaN(headerHeight)) {
      headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--boc-header-height'), 10) || 88;
    }
    return headerHeight + 32;
  }

  function bindPageScroll(handler) {
    if (window.BocScroll && window.BocScroll.bind) {
      window.BocScroll.bind(handler);
      return;
    }
    window.addEventListener('scroll', handler, { passive: true });
    var wrapper = document.querySelector('.page-wrapper');
    if (wrapper) wrapper.addEventListener('scroll', handler, { passive: true });
  }

  function initAnchorNav(root) {
    var nav = root.querySelector('[data-boc-whats-on-nav]');
    if (!nav || nav.dataset.bocWhatsOnNavBound === 'true') return;
    if (nav.getAttribute('data-tracking') !== 'true') return;
    nav.dataset.bocWhatsOnNavBound = 'true';

    var links = nav.querySelectorAll('.boc-whats-on-nav__link');
    var sections = [];

    links.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return;
      var section = document.querySelector(href);
      if (section) sections.push({ link: link, section: section });
    });

    if (!sections.length) return;

    function updateActive() {
      var marker = getMarkerOffset();
      var current = sections[0];
      sections.forEach(function (item) {
        if (item.section.getBoundingClientRect().top <= marker) current = item;
      });
      links.forEach(function (l) { l.classList.remove('is-active'); });
      if (current) current.link.classList.add('is-active');
    }

    bindPageScroll(updateActive);
    updateActive();
  }

  function initRoot(root) {
    if (!root || root.dataset.bocWhatsOnInit === 'true') return;
    root.dataset.bocWhatsOnInit = 'true';
    initScrollLinks(root);
    initEnquiryTabs(root);
    initAnchorNav(root);
  }

  function initAll() {
    document.querySelectorAll(ROOT).forEach(initRoot);
    initEnquiryTabs(document.body);
    initScrollLinks(document.body);
  }

  document.addEventListener('DOMContentLoaded', initAll);

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target.querySelector(ROOT) || event.target.closest(ROOT) || event.target;
    if (root.matches && root.matches(ROOT)) {
      root.dataset.bocWhatsOnInit = 'false';
      initRoot(root);
    }
    initEnquiryTabs(document.body);
    initScrollLinks(document.body);
  });
})();
