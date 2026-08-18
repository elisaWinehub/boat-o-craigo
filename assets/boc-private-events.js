(function () {
  'use strict';

  function initEnquiryModal(root) {
    var openBtn = root.querySelector('[data-boc-enquiry-open]');
    var modal = root.querySelector('[data-boc-enquiry-modal]');
    if (!modal || modal.dataset.bocEnquiryModalBound === 'true') return;
    modal.dataset.bocEnquiryModalBound = 'true';

    function openModal() {
      modal.hidden = false;
      document.body.classList.add('boc-scroll-lock');
      var focusTarget = modal.querySelector('.boc-group-booking-modal__success')
        || modal.querySelector('.boc-group-booking-modal__errors')
        || modal.querySelector('.boc-group-booking-modal__close')
        || modal.querySelector('input, textarea, select, button');
      if (focusTarget) focusTarget.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove('boc-scroll-lock');
      if (openBtn) openBtn.focus();
    }

    if (openBtn) {
      openBtn.addEventListener('click', openModal);
    }

    modal.querySelectorAll('[data-boc-enquiry-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });

    modal.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeModal();
    });

    modal.querySelector('.boc-group-booking-modal__dialog')?.addEventListener('click', function (event) {
      event.stopPropagation();
    });

    if (!modal.hidden) {
      openModal();
    }
  }

  function initRoot(root) {
    if (!root || root.dataset.bocPrivateEventsInit === 'true') return;
    root.dataset.bocPrivateEventsInit = 'true';
    initEnquiryModal(root);
  }

  function initAll() {
    document.querySelectorAll('[data-boc-private-events]').forEach(initRoot);
  }

  function handleSectionLoad(event) {
    var section = event.target;
    if (!(section instanceof HTMLElement)) return;
    section.querySelectorAll('[data-boc-private-events]').forEach(initRoot);
  }

  document.addEventListener('DOMContentLoaded', initAll);
  document.addEventListener('shopify:section:load', handleSectionLoad);
})();
