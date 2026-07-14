(function () {
  'use strict';

  var ROOT = '[data-boc-booking]';
  var NOW_BOOKIT_URL = 'https://bookings.nowbookit.com/?accountid=20cb5efb-4257-47a2-a7c9-7c23eceb2feb&venueid=6523&theme=light&colors=hex,000000&font=PT%20Serif';

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function smoothScrollTo(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  function dispatchBookingOpen(detail) {
    document.dispatchEvent(new CustomEvent('boc:booking:open', { detail: detail || {} }));
  }

  function initScrollLinks(root) {
    root.querySelectorAll('[data-boc-booking-scroll]').forEach(function (link) {
      if (link.dataset.bocBookingScrollBound === 'true') return;
      link.dataset.bocBookingScrollBound = 'true';

      link.addEventListener('click', function (event) {
        var href = link.getAttribute('href') || '';
        if (href.charAt(0) !== '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        smoothScrollTo(target);

        dispatchBookingOpen({
          type: link.getAttribute('data-boc-booking-type') || 'general',
          provider: link.getAttribute('data-boc-booking-provider') || 'now-book-it',
          action: link.getAttribute('data-boc-booking-action') || 'scroll-widget'
        });
      });
    });
  }

  function initAnchorNav(root) {
    var nav = root.querySelector('[data-boc-booking-nav]');
    if (!nav || nav.dataset.bocBookingNavBound === 'true') return;
    if (nav.getAttribute('data-tracking') !== 'true') return;
    nav.dataset.bocBookingNavBound = 'true';

    var links = nav.querySelectorAll('.boc-booking-nav__link');
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

  function initLaunchButtons(root) {
    root.querySelectorAll('[data-boc-booking-launch]').forEach(function (button) {
      if (button.dataset.bocBookingLaunchBound === 'true') return;
      button.dataset.bocBookingLaunchBound = 'true';

      button.addEventListener('click', function () {
        dispatchBookingOpen({
          type: button.getAttribute('data-boc-booking-type') || 'general',
          provider: button.getAttribute('data-boc-booking-provider') || 'now-book-it',
          action: 'open-booking'
        });
      });
    });
  }

  function initIframe(root) {
    root.querySelectorAll('[data-boc-booking-iframe]').forEach(function (wrap) {
      if (wrap.dataset.bocBookingIframeBound === 'true') return;
      wrap.dataset.bocBookingIframeBound = 'true';

      var iframe = wrap.querySelector('iframe');
      if (!iframe) return;

      wrap.classList.add('is-loading');

      iframe.addEventListener('load', function () {
        wrap.classList.remove('is-loading');
      });

      window.setTimeout(function () {
        wrap.classList.remove('is-loading');
      }, 8000);
    });
  }

  function setFaqItemState(item, open, prefix) {
    var trigger = item.querySelector('.' + prefix + '__trigger');
    var panel = item.querySelector('.' + prefix + '__panel');
    var icon = item.querySelector('.' + prefix + '__icon');
    if (!trigger || !panel) return;

    item.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
    if (icon) icon.textContent = open ? '−' : '+';
  }

  function initFaq(root) {
    root.querySelectorAll('[data-boc-booking-faq]').forEach(function (section) {
      if (section.dataset.bocBookingFaqBound === 'true') return;
      section.dataset.bocBookingFaqBound = 'true';

      var oneOpen = section.dataset.oneOpen !== 'false';
      var prefix = section.getAttribute('data-faq-prefix') || 'boc-booking-faq';
      var items = section.querySelectorAll('.' + prefix + '__item');

      items.forEach(function (item) {
        var trigger = item.querySelector('.' + prefix + '__trigger');
        if (!trigger || trigger.dataset.bocBookingFaqTriggerBound === 'true') return;
        trigger.dataset.bocBookingFaqTriggerBound = 'true';

        trigger.addEventListener('click', function () {
          var willOpen = !item.classList.contains('is-open');
          if (oneOpen && willOpen) {
            items.forEach(function (other) {
              if (other !== item) setFaqItemState(other, false, prefix);
            });
          }
          setFaqItemState(item, willOpen, prefix);
        });
      });
    });
  }

  function initRoot(root) {
    if (!root || root.dataset.bocBookingInit === 'true') return;
    root.dataset.bocBookingInit = 'true';
    initScrollLinks(root);
    initAnchorNav(root);
    initLaunchButtons(root);
    initIframe(root);
    initFaq(root);
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
      root.dataset.bocBookingInit = 'false';
      root.querySelectorAll('[data-boc-booking-scroll]').forEach(function (el) {
        el.dataset.bocBookingScrollBound = 'false';
      });
      root.querySelectorAll('[data-boc-booking-faq]').forEach(function (el) {
        el.dataset.bocBookingFaqBound = 'false';
        el.querySelectorAll('[data-boc-booking-faq-trigger-bound]').forEach(function (trigger) {
          trigger.dataset.bocBookingFaqTriggerBound = 'false';
        });
      });
      initRoot(root);
    }
    initScrollLinks(document.body);
  });

  document.addEventListener('shopify:section:unload', function () {
    /* Scoped listeners use dataset guards. */
  });
})();
