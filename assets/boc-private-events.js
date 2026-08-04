(function () {
  'use strict';

  function initEnquiryModal(root) {
    var openBtn = root.querySelector('[data-boc-enquiry-open]');
    var modal = root.querySelector('[data-boc-enquiry-modal]');
    if (!openBtn || !modal || modal.dataset.bocEnquiryModalBound === 'true') return;
    modal.dataset.bocEnquiryModalBound = 'true';

    function openModal() {
      modal.hidden = false;
      document.body.classList.add('boc-scroll-lock');
      var closeBtn = modal.querySelector('.boc-group-booking-modal__close');
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove('boc-scroll-lock');
      openBtn.focus();
    }

    openBtn.addEventListener('click', openModal);
    modal.querySelectorAll('[data-boc-enquiry-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });

    modal.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeModal();
    });
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
