(function () {
  'use strict';

  var ROOT = '[data-boc-about]';

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function smoothScrollTo(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  function getFocusable(container) {
    return container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
  }

  function initScrollLinks(root) {
    root.querySelectorAll('[data-boc-about-scroll]').forEach(function (link) {
      if (link.dataset.bocAboutScrollBound === 'true') return;
      link.dataset.bocAboutScrollBound = 'true';

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
    var nav = root.querySelector('[data-boc-about-nav]');
    if (!nav || nav.dataset.bocAboutNavBound === 'true') return;
    if (nav.getAttribute('data-tracking') !== 'true') return;
    nav.dataset.bocAboutNavBound = 'true';

    var links = nav.querySelectorAll('.boc-about-nav__link');
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

  function getCardsVisible(section) {
    var w = window.innerWidth;
    if (w <= 640) return parseInt(section.getAttribute('data-cards-mobile') || '1', 10);
    if (w <= 980) return parseInt(section.getAttribute('data-cards-tablet') || '2', 10);
    return parseInt(section.getAttribute('data-cards-desktop') || '4', 10);
  }

  function initCarousel(section) {
    var carousel = section.querySelector('[data-boc-about-carousel]');
    if (!carousel || carousel.dataset.bocAboutCarouselBound === 'true') return;
    carousel.dataset.bocAboutCarouselBound = 'true';

    var track = carousel.querySelector('[data-boc-about-carousel-track]');
    var prev = carousel.querySelector('[data-boc-about-carousel-prev]');
    var next = carousel.querySelector('[data-boc-about-carousel-next]');
    var cards = carousel.querySelectorAll('[data-boc-about-carousel-card]');
    if (!track || !cards.length) return;

    var index = 0;
    var scrollAmount = parseInt(section.getAttribute('data-scroll-amount') || '1', 10);

    function update() {
      var visible = getCardsVisible(section);
      section.style.setProperty('--boc-ab-cards-visible', String(visible));
      var maxIndex = Math.max(0, cards.length - visible);
      index = Math.min(index, maxIndex);

      var gap = parseFloat(getComputedStyle(track).gap) || 14;
      var cardWidth = cards[0].getBoundingClientRect().width;
      var step = (cardWidth + gap) * scrollAmount;
      track.style.transform = 'translateX(-' + (index * step) + 'px)';

      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index >= maxIndex;
    }

    if (prev) {
      prev.addEventListener('click', function () {
        index = Math.max(0, index - scrollAmount);
        update();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        var visible = getCardsVisible(section);
        var maxIndex = Math.max(0, cards.length - visible);
        index = Math.min(maxIndex, index + scrollAmount);
        update();
      });
    }

    var onResize = update;
    window.addEventListener('resize', onResize);
    carousel._bocAboutResizeCleanup = function () {
      window.removeEventListener('resize', onResize);
    };
    update();
  }

  function initTeamModal(section) {
    var modal = section.querySelector('[data-boc-about-modal]');
    if (!modal || modal.dataset.bocAboutModalBound === 'true') return;
    modal.dataset.bocAboutModalBound = 'true';

    var dataEl = section.querySelector('[data-boc-about-team-data]');
    var profiles = {};
    if (dataEl) {
      try {
        var parsed = JSON.parse(dataEl.textContent);
        (parsed.profiles || []).forEach(function (p) { profiles[p.id] = p; });
      } catch (e) { /* ignore */ }
    }

    var dialog = modal.querySelector('.boc-about-modal__dialog');
    var backdrop = modal.querySelector('.boc-about-modal__backdrop');
    var closeBtn = modal.querySelector('[data-boc-about-modal-close]');
    var imgEl = modal.querySelector('[data-boc-about-modal-image]');
    var nameEl = modal.querySelector('[data-boc-about-modal-name]');
    var roleEl = modal.querySelector('[data-boc-about-modal-role]');
    var bioEl = modal.querySelector('[data-boc-about-modal-bio]');
    var lastTrigger = null;
    var focusTrapHandler = null;

    function trapFocus(event) {
      if (!dialog || event.key !== 'Tab') return;
      var focusable = getFocusable(dialog);
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function openModal(profileId, trigger) {
      var profile = profiles[profileId];
      if (!profile) return;
      lastTrigger = trigger;

      if (imgEl) {
        imgEl.src = profile.image || '';
        imgEl.alt = (profile.name || 'Team member') + ' profile image';
      }
      if (nameEl) nameEl.textContent = profile.name || '';
      if (roleEl) roleEl.textContent = profile.role || '';
      if (bioEl) bioEl.innerHTML = profile.biography || '';

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('boc-about-modal-open');
      focusTrapHandler = trapFocus;
      document.addEventListener('keydown', focusTrapHandler);
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('boc-about-modal-open');
      if (focusTrapHandler) {
        document.removeEventListener('keydown', focusTrapHandler);
        focusTrapHandler = null;
      }
      if (lastTrigger) lastTrigger.focus();
    }

    section.querySelectorAll('[data-boc-about-team-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openModal(btn.getAttribute('data-boc-about-team-open'), btn);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    var onKeydown = function (event) {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    };
    document.addEventListener('keydown', onKeydown);

    modal._bocAboutModalCleanup = function () {
      document.removeEventListener('keydown', onKeydown);
      if (focusTrapHandler) document.removeEventListener('keydown', focusTrapHandler);
      document.body.classList.remove('boc-about-modal-open');
    };
  }

  function initCareers(root) {
    var list = root.querySelector('[data-boc-about-careers]');
    if (!list || list.dataset.bocAboutCareersBound === 'true') return;
    list.dataset.bocAboutCareersBound = 'true';

    var oneOpen = list.getAttribute('data-one-open') === 'true';
    var items = list.querySelectorAll('[data-boc-about-career]');

    items.forEach(function (item) {
      var trigger = item.querySelector('[data-boc-about-career-trigger]');
      var panel = item.querySelector('[data-boc-about-career-panel]');
      var icon = item.querySelector('[data-boc-about-career-icon]');
      if (!trigger || !panel) return;

      trigger.addEventListener('click', function () {
        var opening = panel.hidden;

        if (oneOpen) {
          items.forEach(function (other) {
            var otherPanel = other.querySelector('[data-boc-about-career-panel]');
            var otherTrigger = other.querySelector('[data-boc-about-career-trigger]');
            var otherIcon = other.querySelector('[data-boc-about-career-icon]');
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
    if (!section || section.dataset.bocAboutInit === 'true') return;
    section.dataset.bocAboutInit = 'true';

    initScrollLinks(section);
    initAnchorNav(section);
    initCarousel(section);
    initTeamModal(section);
    initCareers(section);
  }

  function destroySection(section) {
    if (!section) return;
    var nav = section.querySelector('[data-boc-about-nav]');
    if (nav && nav._bocAboutScrollCleanup) nav._bocAboutScrollCleanup();

    var carousel = section.querySelector('[data-boc-about-carousel]');
    if (carousel && carousel._bocAboutResizeCleanup) carousel._bocAboutResizeCleanup();

    var modal = section.querySelector('[data-boc-about-modal]');
    if (modal && modal._bocAboutModalCleanup) modal._bocAboutModalCleanup();

    delete section.dataset.bocAboutInit;
    section.querySelectorAll('[data-boc-about-scroll-bound], [data-boc-about-nav-bound], [data-boc-about-carousel-bound], [data-boc-about-modal-bound], [data-boc-about-careers-bound]').forEach(function (el) {
      delete el.dataset.bocAboutScrollBound;
      delete el.dataset.bocAboutNavBound;
      delete el.dataset.bocAboutCarouselBound;
      delete el.dataset.bocAboutModalBound;
      delete el.dataset.bocAboutCareersBound;
    });
  }

  function initAll() {
    document.querySelectorAll(ROOT).forEach(initSection);
  }

  document.addEventListener('DOMContentLoaded', initAll);
  document.addEventListener('shopify:section:load', function (event) {
    var target = event.target;
    if (target.matches && target.matches(ROOT)) initSection(target);
    target.querySelectorAll(ROOT).forEach(initSection);
  });
  document.addEventListener('shopify:section:unload', function (event) {
    var target = event.target;
    if (target.matches && target.matches(ROOT)) destroySection(target);
    target.querySelectorAll(ROOT).forEach(destroySection);
  });
})();
