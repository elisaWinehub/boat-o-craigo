(function () {
  'use strict';

  function storageKey(form) {
    return 'bocEnquirySent:' + (form && form.id ? form.id : 'default');
  }

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

    if (!parts.length) {
      parts.push('Enquiry submitted via website form.');
    }

    bodyField.value = parts.join('\n');
  }

  function showSuccessState(modal) {
    var formFields = modal.querySelector('[data-boc-enquiry-form-fields]');
    var successPanel = modal.querySelector('[data-boc-enquiry-success-panel]');
    var intro = modal.querySelector('.boc-group-booking-modal__intro');
    var title = modal.querySelector('.boc-group-booking-modal__title');
    var errors = modal.querySelector('[data-boc-enquiry-form-errors]');

    if (formFields) formFields.hidden = true;
    if (successPanel) {
      successPanel.hidden = false;
      successPanel.classList.add('is-visible');
    }
    if (intro) intro.hidden = true;
    if (errors) errors.hidden = true;
    if (title) title.textContent = 'Thank you for your enquiry';
  }

  function hasVisibleErrors(modal) {
    var errors = modal.querySelector('[data-boc-enquiry-form-errors]');
    return !!(errors && !errors.hidden && errors.textContent.trim());
  }

  function applyPostSubmitState(modal, form) {
    var key = storageKey(form);
    var params = new URLSearchParams(window.location.search);
    var sentViaQuery = params.get('boc_enquiry') === 'sent';
    var serverSuccessPanel = modal.querySelector('[data-boc-enquiry-success-panel]');
    var serverSuccess = serverSuccessPanel
      && (!serverSuccessPanel.hidden || serverSuccessPanel.classList.contains('is-visible'));
    var pendingSuccess = sessionStorage.getItem(key) === '1';

    if (hasVisibleErrors(modal)) {
      sessionStorage.removeItem(key);
      return false;
    }

    if (pendingSuccess || sentViaQuery || serverSuccess) {
      sessionStorage.removeItem(key);
      showSuccessState(modal);
      return true;
    }

    return false;
  }

  function bindEnquiryForm(modal, form) {
    if (!form || form.dataset.bocEnquirySubmitBound === 'true') return;
    form.dataset.bocEnquirySubmitBound = 'true';

    form.addEventListener('submit', function () {
      buildEnquiryBody(form);
      sessionStorage.setItem(storageKey(form), '1');

      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
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
      modal.classList.add('is-open');
      document.body.classList.add('boc-scroll-lock');

      var focusTarget = successPanel && !successPanel.hidden
        ? successPanel.querySelector('[data-boc-enquiry-success-focus]')
        : modal.querySelector('.boc-group-booking-modal__close')
          || modal.querySelector('input, textarea, select, button');
      if (focusTarget) focusTarget.focus();
    }

    function closeModal() {
      modal.hidden = true;
      modal.classList.remove('is-open');
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

    var submittedSuccessfully = applyPostSubmitState(modal, form);
    var autoOpenMarker = modal.querySelector('[data-boc-enquiry-auto-open="true"]');

    if (submittedSuccessfully || autoOpenMarker || hasVisibleErrors(modal)) {
      openModal();
    }
  }

  function initAll() {
    document.querySelectorAll('[data-boc-enquiry-modal]').forEach(initEnquiryModal);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', function (event) {
    if (!(event.target instanceof HTMLElement)) return;
    event.target.querySelectorAll('[data-boc-enquiry-modal]').forEach(initEnquiryModal);
  });
})();
