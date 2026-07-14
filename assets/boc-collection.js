(function () {
  'use strict';

  var STORAGE_KEY = 'boc-collection-view';
  var ROOT = '[data-boc-collection]';

  function initQuantityControls(root) {
    root.querySelectorAll('[data-boc-qty]').forEach(function (wrapper) {
      if (wrapper.dataset.bocQtyInit === 'true') return;
      var input = wrapper.querySelector('[data-boc-qty-input]');
      var minus = wrapper.querySelector('[data-boc-qty-minus]');
      var plus = wrapper.querySelector('[data-boc-qty-plus]');
      if (!input) return;
      wrapper.dataset.bocQtyInit = 'true';
      if (minus) {
        minus.addEventListener('click', function () {
          var min = parseInt(input.min || '1', 10);
          input.value = String(Math.max(min, parseInt(input.value || '1', 10) - 1));
        });
      }
      if (plus) {
        plus.addEventListener('click', function () {
          input.value = String(parseInt(input.value || '1', 10) + 1);
        });
      }
    });
  }

  function applyView(root, view) {
    var grid = root.querySelector('[data-boc-collection-grid]');
    if (!grid) return;
    grid.classList.toggle('is-list-view', view === 'list');
    root.querySelectorAll('[data-boc-collection-view-btn]').forEach(function (btn) {
      var active = btn.getAttribute('data-boc-collection-view-btn') === view;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    try { localStorage.setItem(STORAGE_KEY, view); } catch (e) { /* ignore */ }
  }

  function initViewToggle(root) {
    var activeBtn = root.querySelector('[data-boc-collection-view-btn].is-active');
    var defaultView = activeBtn ? activeBtn.getAttribute('data-boc-collection-view-btn') : 'grid';
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    applyView(root, stored || defaultView || 'grid');

    root.querySelectorAll('[data-boc-collection-view-btn]').forEach(function (btn) {
      if (btn.dataset.bocViewBound === 'true') return;
      btn.dataset.bocViewBound = 'true';
      btn.addEventListener('click', function () {
        applyView(root, btn.getAttribute('data-boc-collection-view-btn'));
      });
    });
  }

  function initDescriptionToggle(root) {
    root.querySelectorAll('[data-boc-collection-desc-toggle]').forEach(function (btn) {
      if (btn.dataset.bocDescBound === 'true') return;
      btn.dataset.bocDescBound = 'true';
      var panel = btn.previousElementSibling;
      if (!panel) return;
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        panel.classList.toggle('is-expanded', !expanded);
        btn.textContent = expanded ? 'Read more' : 'Read less';
      });
    });
  }

  function initSection(section) {
    if (!section || section.dataset.bocCollectionInit === 'true') return;
    section.dataset.bocCollectionInit = 'true';
    initQuantityControls(section);
    initViewToggle(section);
    initDescriptionToggle(section);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll(ROOT).forEach(initSection);
  });

  document.addEventListener('shopify:section:load', function (event) {
    var target = event.target;
    if (target.matches && target.matches(ROOT)) initSection(target);
    target.querySelectorAll(ROOT).forEach(initSection);
  });
})();
