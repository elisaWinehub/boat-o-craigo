(function () {
  'use strict';

  var ROOT = '[data-boc-contact]';
  var VALID_TOPICS = ['general', 'order-support', 'wine-club', 'weddings-events', 'restaurant-tasting'];

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function smoothScrollTo(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  function initScrollLinks(root) {
    root.querySelectorAll('[data-boc-contact-scroll]').forEach(function (link) {
      if (link.dataset.bocContactScrollBound === 'true') return;
      link.dataset.bocContactScrollBound = 'true';

      link.addEventListener('click', function (event) {
        var href = link.getAttribute('href') || '';
        if (href.charAt(0) !== '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        smoothScrollTo(target);

        var topic = link.getAttribute('data-boc-contact-topic');
        if (topic) applyTopic(topic);
      });
    });
  }

  function initAnchorNav(root) {
    var nav = root.querySelector('[data-boc-contact-nav]');
    if (!nav || nav.dataset.bocContactNavBound === 'true') return;
    if (nav.getAttribute('data-tracking') !== 'true') return;
    nav.dataset.bocContactNavBound = 'true';

    var links = nav.querySelectorAll('.boc-contact-nav__link');
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

    var onScroll = updateActive;
    window.addEventListener('scroll', onScroll, { passive: true });
    nav._bocContactScrollCleanup = function () {
      window.removeEventListener('scroll', onScroll);
    };
    updateActive();
  }

  function applyTopic(topic) {
    if (VALID_TOPICS.indexOf(topic) === -1) return;
    var select = document.querySelector('[data-boc-contact-topic-select]');
    if (!select) return;
    select.value = topic;
    select.dispatchEvent(new Event('change', { bubbles: true }));

    var formSection = document.querySelector('[data-boc-contact-form]');
    if (formSection) {
      var focusTarget = formSection.querySelector('[data-boc-contact-topic-select]') || formSection.querySelector('h2');
      if (focusTarget && typeof focusTarget.focus === 'function') {
        setTimeout(function () { focusTarget.focus(); }, prefersReducedMotion() ? 0 : 300);
      }
    }
  }

  function initTopicPreselect(root) {
    root.querySelectorAll('[data-boc-contact-topic]').forEach(function (el) {
      if (el.dataset.bocContactTopicBound === 'true') return;
      if (el.matches('[data-boc-contact-scroll]')) return;
      el.dataset.bocContactTopicBound = 'true';

      el.addEventListener('click', function (event) {
        var topic = el.getAttribute('data-boc-contact-topic');
        if (!topic) return;
        var formAnchor = el.getAttribute('href');
        if (formAnchor && formAnchor.charAt(0) === '#') {
          event.preventDefault();
          var target = document.querySelector(formAnchor);
          smoothScrollTo(target);
        }
        applyTopic(topic);
      });
    });
  }

  function initQueryTopic() {
    var params = new URLSearchParams(window.location.search);
    var topic = params.get('topic');
    if (topic) applyTopic(topic);
  }

  function initFaq(root) {
    var faqRoot = root.querySelector('[data-boc-contact-faq]');
    if (!faqRoot || faqRoot.dataset.bocContactFaqBound === 'true') return;
    faqRoot.dataset.bocContactFaqBound = 'true';

    var oneOpen = faqRoot.getAttribute('data-one-open') === 'true';
    var items = faqRoot.querySelectorAll('[data-boc-contact-faq-item]');

    items.forEach(function (item) {
      var trigger = item.querySelector('[data-boc-contact-faq-trigger]');
      var panel = item.querySelector('[data-boc-contact-faq-panel]');
      var icon = item.querySelector('[data-boc-contact-faq-icon]');
      if (!trigger || !panel) return;

      trigger.addEventListener('click', function () {
        var opening = panel.hidden;

        if (oneOpen) {
          items.forEach(function (other) {
            var otherPanel = other.querySelector('[data-boc-contact-faq-panel]');
            var otherTrigger = other.querySelector('[data-boc-contact-faq-trigger]');
            var otherIcon = other.querySelector('[data-boc-contact-faq-icon]');
            if (!otherPanel) return;
            otherPanel.hidden = true;
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
            if (otherIcon) otherIcon.textContent = '+';
            other.classList.remove('is-open');
          });
        }

        panel.hidden = !opening;
        trigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
        if (icon) icon.textContent = opening ? '−' : '+';
        item.classList.toggle('is-open', opening);
      });
    });
  }

  function initSection(section) {
    if (!section || section.dataset.bocContactInit === 'true') return;
    section.dataset.bocContactInit = 'true';

    initScrollLinks(section);
    initAnchorNav(section);
    initTopicPreselect(section);
    initFaq(section);
  }

  function destroySection(section) {
    if (!section) return;
    var nav = section.querySelector('[data-boc-contact-nav]');
    if (nav && nav._bocContactScrollCleanup) nav._bocContactScrollCleanup();
    delete section.dataset.bocContactInit;
  }

  function initAll() {
    document.querySelectorAll(ROOT).forEach(initSection);
    initQueryTopic();
  }

  document.addEventListener('DOMContentLoaded', initAll);
  document.addEventListener('shopify:section:load', function (event) {
    var target = event.target;
    if (target.matches && target.matches(ROOT)) initSection(target);
    target.querySelectorAll(ROOT).forEach(initSection);
    initQueryTopic();
  });
  document.addEventListener('shopify:section:unload', function (event) {
    var target = event.target;
    if (target.matches && target.matches(ROOT)) destroySection(target);
    target.querySelectorAll(ROOT).forEach(destroySection);
  });
})();
