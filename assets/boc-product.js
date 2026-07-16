(function () {
  'use strict';

  var ROOT = '[data-boc-product]';

  function getGalleryItems(section) {
    var items = [];
    section.querySelectorAll('[data-boc-product-thumb]').forEach(function (thumb) {
      var mediaType = thumb.getAttribute('data-media-type') || 'image';
      if (mediaType !== 'image' && mediaType) return;
      items.push({
        index: parseInt(thumb.getAttribute('data-thumb-index') || String(items.length), 10),
        url: thumb.getAttribute('data-image-hd') || thumb.getAttribute('data-image') || '',
        previewUrl: thumb.getAttribute('data-image') || '',
        alt: thumb.getAttribute('aria-label') || '',
        thumb: thumb
      });
    });

    if (!items.length) {
      var singleImg = section.querySelector('[data-boc-product-gallery-open] .product-main-image__img, [data-boc-product-main] > .product-main-image__img');
      if (singleImg) {
        items.push({
          index: 0,
          url: singleImg.currentSrc || singleImg.src || '',
          previewUrl: singleImg.currentSrc || singleImg.src || '',
          alt: singleImg.alt || '',
          thumb: null
        });
      }
    }

    return items;
  }

  function setMainImage(mainWrap, item, section) {
    if (!mainWrap || !item) return;

    var zoomBtn = mainWrap.querySelector('[data-boc-product-gallery-open]');
    var img = mainWrap.querySelector('.product-main-image__img');

    if (!zoomBtn) {
      mainWrap.innerHTML = '';
      zoomBtn = document.createElement('button');
      zoomBtn.type = 'button';
      zoomBtn.className = 'product-main-image__zoom';
      zoomBtn.setAttribute('data-boc-product-gallery-open', '');
      zoomBtn.setAttribute('aria-label', 'Open image gallery');
      img = document.createElement('img');
      img.className = 'product-main-image__img';
      zoomBtn.appendChild(img);
      mainWrap.appendChild(zoomBtn);
      bindGalleryOpenButtons(section);
    }

    zoomBtn.setAttribute('data-thumb-index', String(item.index));
    img.src = item.previewUrl || item.url;
    img.alt = item.alt;
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.removeAttribute('width');
    img.removeAttribute('height');
  }

  function swapMainMedia(section, thumb) {
    var mainWrap = section.querySelector('[data-boc-product-main-media]') || section.querySelector('[data-boc-product-main]');
    if (!mainWrap || !thumb) return;

    var mediaType = thumb.getAttribute('data-media-type') || 'image';
    var mediaUrl = thumb.getAttribute('data-image');
    var mediaUrlHd = thumb.getAttribute('data-image-hd') || mediaUrl;
    var alt = thumb.getAttribute('aria-label') || '';
    var thumbIndex = thumb.getAttribute('data-thumb-index') || '0';

    section.querySelectorAll('[data-boc-product-thumb]').forEach(function (item) {
      item.classList.remove('active');
      item.setAttribute('aria-current', 'false');
    });
    thumb.classList.add('active');
    thumb.setAttribute('aria-current', 'true');

    if (mediaType === 'image' || !mediaType) {
      setMainImage(mainWrap, {
        index: parseInt(thumbIndex, 10),
        url: mediaUrlHd,
        previewUrl: mediaUrl,
        alt: alt
      }, section);
      return;
    }

    mainWrap.innerHTML = '';
    if (mediaType === 'video') {
      var video = document.createElement('video');
      video.className = 'product-main-image__video';
      video.controls = true;
      video.src = thumb.getAttribute('data-video-src') || mediaUrl;
      mainWrap.appendChild(video);
      return;
    }

    setMainImage(mainWrap, {
      index: parseInt(thumbIndex, 10),
      url: mediaUrlHd,
      previewUrl: mediaUrl,
      alt: alt
    }, section);
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

  function bindGalleryOpenButtons(section) {
    section.querySelectorAll('[data-boc-product-gallery-open]').forEach(function (btn) {
      if (btn.dataset.bocGalleryOpenBound === 'true') return;
      btn.dataset.bocGalleryOpenBound = 'true';
      btn.addEventListener('click', function () {
        var modal = section.querySelector('[data-boc-product-gallery-modal]');
        if (!modal || !modal._bocOpenGallery) return;
        var index = parseInt(btn.getAttribute('data-thumb-index') || '0', 10);
        modal._bocOpenGallery(index, btn);
      });
    });
  }

  function initGalleryModal(section) {
    var modal = section.querySelector('[data-boc-product-gallery-modal]');
    if (!modal || modal.dataset.bocGalleryModalBound === 'true') return;
    modal.dataset.bocGalleryModalBound = 'true';

    var backdrop = modal.querySelector('.boc-product-gallery-modal__backdrop');
    var closeBtn = modal.querySelector('[data-boc-product-gallery-close]');
    var prevBtn = modal.querySelector('[data-boc-product-gallery-prev]');
    var nextBtn = modal.querySelector('[data-boc-product-gallery-next]');
    var stageEl = modal.querySelector('[data-boc-product-gallery-stage]');
    var imgEl = modal.querySelector('[data-boc-product-gallery-modal-image]');
    var counterEl = modal.querySelector('[data-boc-product-gallery-counter]');
    var currentIndex = 0;
    var lastTrigger = null;
    var activeImageRequest = 0;
    var imageCache = {};

    function getItems() {
      return getGalleryItems(section);
    }

    function preloadImage(url) {
      if (!url) return null;
      if (imageCache[url]) return imageCache[url];

      var loader = new Image();
      loader.decoding = 'async';
      loader.src = url;
      imageCache[url] = loader;
      return loader;
    }

    function applyModalImage(item, src, requestId) {
      if (!imgEl || requestId !== activeImageRequest) return;

      imgEl.alt = item.alt;
      imgEl.src = src;
      imgEl.removeAttribute('srcset');
      imgEl.removeAttribute('sizes');

      requestAnimationFrame(function () {
        if (requestId !== activeImageRequest || !imgEl) return;
        imgEl.classList.remove('is-fading');
        if (stageEl) stageEl.classList.remove('is-loading');
      });
    }

    function loadModalImage(url, item, requestId, onReady) {
      var loader = preloadImage(url);
      if (!loader) {
        onReady(url);
        return;
      }

      function done() {
        if (requestId !== activeImageRequest) return;
        if (loader.decode) {
          loader.decode().then(function () { onReady(url); }).catch(function () { onReady(url); });
          return;
        }
        onReady(url);
      }

      if (loader.complete && loader.naturalWidth > 0) {
        done();
        return;
      }

      function onLoad() {
        loader.removeEventListener('load', onLoad);
        loader.removeEventListener('error', onLoad);
        done();
      }

      loader.addEventListener('load', onLoad);
      loader.addEventListener('error', onLoad);
    }

    function renderModal(index) {
      var items = getItems();
      if (!items.length || !imgEl) return;

      currentIndex = ((index % items.length) + items.length) % items.length;
      var item = items[currentIndex];
      var targetUrl = item.url || item.previewUrl;
      var previewUrl = item.previewUrl || targetUrl;
      var requestId = ++activeImageRequest;
      var currentSrc = imgEl.currentSrc || imgEl.src || '';

      if (counterEl) {
        counterEl.textContent = (currentIndex + 1) + ' / ' + items.length;
      }
      if (prevBtn) prevBtn.disabled = items.length <= 1;
      if (nextBtn) nextBtn.disabled = items.length <= 1;

      if (!targetUrl) return;

      if (currentSrc && (currentSrc === targetUrl || currentSrc === previewUrl)) {
        imgEl.alt = item.alt;
        imgEl.classList.remove('is-fading');
        if (stageEl) stageEl.classList.remove('is-loading');
        return;
      }

      if (stageEl) stageEl.classList.add('is-loading');
      imgEl.classList.add('is-fading');

      function showFullImage() {
        loadModalImage(targetUrl, item, requestId, function (src) {
          applyModalImage(item, src, requestId);
        });
      }

      if (previewUrl !== targetUrl) {
        loadModalImage(previewUrl, item, requestId, function (src) {
          if (requestId !== activeImageRequest) return;

          imgEl.alt = item.alt;
          imgEl.src = src;
          imgEl.removeAttribute('srcset');
          imgEl.removeAttribute('sizes');
          imgEl.classList.remove('is-fading');
          if (stageEl) stageEl.classList.remove('is-loading');

          loadModalImage(targetUrl, item, requestId, function (hdSrc) {
            if (requestId !== activeImageRequest || hdSrc === src) return;
            imgEl.classList.add('is-fading');
            requestAnimationFrame(function () {
              applyModalImage(item, hdSrc, requestId);
            });
          });
        });
        return;
      }

      showFullImage();
    }

    function openModal(index, trigger) {
      var items = getItems();
      if (!items.length) return;
      lastTrigger = trigger || null;
      renderModal(typeof index === 'number' ? index : 0);
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('boc-product-gallery-modal-open');
      if (closeBtn) closeBtn.focus();
    }

    modal._bocOpenGallery = openModal;

    function closeModal() {
      activeImageRequest += 1;
      if (imgEl) imgEl.classList.remove('is-fading');
      if (stageEl) stageEl.classList.remove('is-loading');
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('boc-product-gallery-modal-open');
      if (lastTrigger) lastTrigger.focus();
    }

    bindGalleryOpenButtons(section);

    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        renderModal(currentIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        renderModal(currentIndex + 1);
      });
    }

    document.addEventListener('keydown', function (event) {
      if (!modal.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeModal();
      if (event.key === 'ArrowLeft') renderModal(currentIndex - 1);
      if (event.key === 'ArrowRight') renderModal(currentIndex + 1);
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

  function initReadMore(section) {
    section.querySelectorAll('[data-boc-short-copy]').forEach(function (wrap) {
      if (wrap.dataset.bocReadMoreInit === 'true') return;
      wrap.dataset.bocReadMoreInit = 'true';

      var text = wrap.querySelector('[data-boc-short-copy-text]');
      var toggle = wrap.querySelector('[data-boc-short-copy-toggle]');
      if (!text || !toggle) return;

      var lineHeight = parseFloat(getComputedStyle(text).lineHeight) || 24;
      var threshold = lineHeight * 3 + 4;
      if (text.scrollHeight <= threshold) {
        toggle.style.display = 'none';
        return;
      }

      toggle.addEventListener('click', function () {
        var isExpanded = text.classList.contains('product-short-copy--expanded');
        if (isExpanded) {
          text.classList.remove('product-short-copy--expanded');
          text.classList.add('product-short-copy--clamped');
          toggle.textContent = 'Read more';
          toggle.setAttribute('aria-expanded', 'false');
        } else {
          text.classList.remove('product-short-copy--clamped');
          text.classList.add('product-short-copy--expanded');
          toggle.textContent = 'Read less';
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function initSection(section) {
    if (!section || section.dataset.bocProductInit === 'true') return;
    section.dataset.bocProductInit = 'true';
    initThumbs(section);
    initGalleryModal(section);
    initPurchaseOptions(section);
    initQuantity(section);
    initAccordions(section);
    initReadMore(section);
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
