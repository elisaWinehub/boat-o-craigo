(function () {
  'use strict';

  function buildEnquiryBody(form) {
    var bodyField = form.querySelector('[name="contact[body]"]');
    if (!bodyField || bodyField.value.trim()) return;

    var parts = [];
    var map = [
      ['contact[enquiry_type]', 'Enquiry type'],
      ['contact[number_of_guests]', 'Number of guests'],
      ['contact[occasion]', 'Occasion'],
      ['contact[proposed_dates]', 'Proposed date/s'],
      ['contact[proposed_time]', 'Proposed time'],
    ];

    map.forEach(function (entry) {
      var field = form.querySelector('[name="' + entry[0] + '"]');
      if (field && field.value && field.value.trim()) {
        parts.push(entry[1] + ': ' + field.value.trim());
      }
    });

    if (parts.length) {
      bodyField.value = parts.join('\n');
    }
  }

  function bindEnquiryForm(modal, form) {
    if (!form || form.dataset.bocEnquirySubmitBound === 'true') return;
    form.dataset.bocEnquirySubmitBound = 'true';

    form.addEventListener('submit', function () {
      buildEnquiryBody(form);

      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      modal.dataset.bocEnquirySubmitting = 'true';
    });
  }

  function initEnquiryModal(modal) {
    if (!modal || modal.dataset.bocEnquiryModalBound === 'true') return;
    modal.dataset.bocEnquiryModalBound = 'true';

    var root = modal.closest('[data-boc-private-events], [data-boc-visit]') || document.body;
    var openBtn = root.querySelector('[data-boc-enquiry-open], [data-boc-group-booking-open]');
    var form = modal.querySelector('.boc-group-booking-modal__form');
    var successPanel = modal.querySelector('[data-boc-enquiry-success-panel]');

    function openModal() {
      modal.hidden = false;
      document.body.classList.add('boc-scroll-lock');

      var focusTarget = successPanel && !successPanel.hidden
        ? successPanel.querySelector('[data-boc-enquiry-success-focus]')
        : modal.querySelector('.boc-group-booking-modal__close')
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

    modal.querySelectorAll('[data-boc-enquiry-close], [data-boc-group-booking-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });

    modal.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeModal();
    });

    bindEnquiryForm(modal, form);

    var autoOpenMarker = modal.querySelector('[data-boc-enquiry-auto-open="true"]');
    var shouldAutoOpen = autoOpenMarker
      || (successPanel && !successPanel.hidden);

    if (shouldAutoOpen) {
      openModal();
    }
  }

  function initAll() {
    document.querySelectorAll('[data-boc-enquiry-modal]').forEach(initEnquiryModal);
  }

  document.addEventListener('DOMContentLoaded', initAll);
  document.addEventListener('shopify:section:load', function (event) {
    if (!(event.target instanceof HTMLElement)) return;
    event.target.querySelectorAll('[data-boc-enquiry-modal]').forEach(initEnquiryModal);
  });
})();
