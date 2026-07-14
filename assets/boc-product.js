(function () {
  'use strict';

  var ROOT = '[data-boc-product]';

  function swapMainMedia(section, thumb) {
    var mainWrap = section.querySelector('[data-boc-product-main-media]');
    if (!mainWrap) return;

    var mediaType = thumb.getAttribute('data-media-type') || 'image';
    var mediaUrl = thumb.getAttribute('data-image');
    var alt = thumb.getAttribute('aria-label') || '';

    section.querySelectorAll('[data-boc-product-thumb]').forEach(function (item) {
      item.classList.remove('active');
      item.setAttribute('aria-current', 'false');
    });
    thumb.classList.add('active');
    thumb.setAttribute('aria-current', 'true');

    if (mediaType === 'image' || !mediaType) {
      var img = mainWrap.querySelector('.product-main-image__img');
      if (!img) {
        mainWrap.innerHTML = '';
        img = document.createElement('img');
        img.className = 'product-main-image__img';
        mainWrap.appendChild(img);
      }
      img.src = mediaUrl;
      img.alt = alt;
    }
  }

  function initThumbs(section) {
    section.querySelectorAll('[data-boc-product-thumb]').forEach(function (thumb) {
      if (thumb.dataset.bocThumbBound === 'true') return;
      thumb.dataset.bocThumbBound = 'true';
      thumb.addEventListener('click', function () {
        swapMainMedia(section, thumb);
      });
    });
  }

  function initPurchaseOptions(section) {
    var optionsRoot = section.querySelector('[data-boc-purchase-options]');
    if (!optionsRoot) return;

    var radios = optionsRoot.querySelectorAll('[data-boc-purchase-radio]');
    var panel = optionsRoot.querySelector('[data-boc-subscription-panel]');
    var planSelect = optionsRoot.querySelector('[data-boc-selling-plan-select]');
    var planInput = section.querySelector('[data-boc-selling-plan-input]');

    function syncSellingPlan() {
      if (!planInput) return;
      var checked = optionsRoot.querySelector('[data-boc-purchase-radio]:checked');
      if (checked && checked.value === 'subscription') {
        var planId = checked.getAttribute('data-selling-plan-id');
        if (planSelect && planSelect.value) planId = planSelect.value;
        planInput.value = planId || '';
        if (planInput.name !== 'selling_plan') planInput.setAttribute('name', 'selling_plan');
      } else {
        planInput.value = '';
        planInput.removeAttribute('name');
      }
    }

    radios.forEach(function (radio) {
      if (radio.dataset.bocPurchaseBound === 'true') return;
      radio.dataset.bocPurchaseBound = 'true';
      radio.addEventListener('change', function () {
        optionsRoot.querySelectorAll('[data-boc-purchase-option]').forEach(function (label) {
          label.classList.remove('active');
        });
        var label = radio.closest('[data-boc-purchase-option]');
        if (label) label.classList.add('active');
        if (panel) panel.classList.toggle('open', radio.value === 'subscription');
        syncSellingPlan();
      });
    });

    if (planSelect) {
      planSelect.addEventListener('change', syncSellingPlan);
    }
    syncSellingPlan();
  }

  function initQuantity(section) {
    section.querySelectorAll('[data-boc-product-qty]').forEach(function (wrapper) {
      if (wrapper.dataset.bocQtyInit === 'true') return;
      var display = wrapper.querySelector('[data-boc-qty-value]');
      var input = wrapper.querySelector('[data-boc-qty-input]');
      var minus = wrapper.querySelector('[data-boc-qty-minus]');
      var plus = wrapper.querySelector('[data-boc-qty-plus]');
      if (!display || !input) return;

      wrapper.dataset.bocQtyInit = 'true';
      var min = parseInt(input.value || '1', 10);

      function setQty(value) {
        var next = Math.max(min, value);
        display.textContent = String(next);
        input.value = String(next);
      }

      if (minus) minus.addEventListener('click', function () { setQty(parseInt(display.textContent, 10) - 1); });
      if (plus) plus.addEventListener('click', function () { setQty(parseInt(display.textContent, 10) + 1); });
    });
  }

  function initAccordions(section) {
    section.querySelectorAll('[data-boc-product-accordion]').forEach(function (item) {
      var button = item.querySelector('.product-accordion-btn');
      if (!button || button.dataset.bocAccordionBound === 'true') return;
      button.dataset.bocAccordionBound = 'true';

      button.addEventListener('click', function () {
        var shouldOpen = !item.classList.contains('open');

        section.querySelectorAll('[data-boc-product-accordion].open').forEach(function (openItem) {
          openItem.classList.remove('open');
          var icon = openItem.querySelector('.product-accordion-btn span:last-child');
          var btn = openItem.querySelector('.product-accordion-btn');
          if (icon) icon.textContent = '+';
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });

        if (shouldOpen) {
          item.classList.add('open');
          var openIcon = button.querySelector('span:last-child');
          if (openIcon) openIcon.textContent = '−';
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function initSection(section) {
    if (!section || section.dataset.bocProductInit === 'true') return;
    section.dataset.bocProductInit = 'true';
    initThumbs(section);
    initPurchaseOptions(section);
    initQuantity(section);
    initAccordions(section);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll(ROOT).forEach(initSection);
  });

  document.addEventListener('shopify:section:load', function (event) {
    var target = event.target;
    if (target.matches && target.matches(ROOT)) initSection(target);
    if (target.querySelectorAll) target.querySelectorAll(ROOT).forEach(initSection);
  });
})();
