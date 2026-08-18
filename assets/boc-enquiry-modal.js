(function () {
  'use strict';

  function showSuccessState(modal, form) {
    var formFields = modal.querySelector('[data-boc-enquiry-form-fields]');
    var successPanel = modal.querySelector('[data-boc-enquiry-success-panel]');
    var intro = modal.querySelector('.boc-group-booking-modal__intro');
    var title = modal.querySelector('.boc-group-booking-modal__title');
    var errors = modal.querySelector('[data-boc-enquiry-form-errors]');

    if (formFields) formFields.hidden = true;
    if (successPanel) successPanel.hidden = false;
    if (intro) intro.hidden = true;
    if (errors) errors.hidden = true;
    if (title) title.textContent = 'Thank you for your enquiry';

    modal.dataset.bocEnquiryPosted = 'true';

    var focusTarget = successPanel && successPanel.querySelector('[data-boc-enquiry-success-focus]');
    if (focusTarget) focusTarget.focus();
  }

  function bindEnquiryForm(modal, form) {
    if (!form || form.dataset.bocEnquirySubmitBound === 'true') return;
    form.dataset.bocEnquirySubmitBound = 'true';

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (form.dataset.bocEnquirySubmitting === 'true') return;

      var submitBtn = form.querySelector('[type="submit"]');
      var errorsBox = modal.querySelector('[data-boc-enquiry-form-errors]');
      var defaultSubmitLabel = submitBtn ? submitBtn.textContent : '';

      form.dataset.bocEnquirySubmitting = 'true';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      if (errorsBox) errorsBox.hidden = true;

      fetch(form.action || '/contact', {
        method: 'POST',
        body: new FormData(form),
        credentials: 'same-origin',
        redirect: 'follow',
        headers: {
          Accept: 'text/html',
        },
      })
        .then(function (response) {
          return response.text().then(function (html) {
            return { response: response, html: html };
          });
        })
        .then(function (result) {
          var parsed = new DOMParser().parseFromString(result.html, 'text/html');
          var remoteErrors = parsed.querySelector('.boc-group-booking-modal__errors, .errors, .form-errors');

          if (remoteErrors && remoteErrors.textContent.trim()) {
            if (errorsBox) {
              errorsBox.innerHTML = remoteErrors.innerHTML;
              errorsBox.hidden = false;
            }
            return;
          }

          if (result.response.ok) {
            showSuccessState(modal, form);
          }
        })
        .catch(function () {
          if (errorsBox) {
            errorsBox.textContent = 'Something went wrong. Please try again or email us directly.';
            errorsBox.hidden = false;
          }
        })
        .finally(function () {
          form.dataset.bocEnquirySubmitting = 'false';
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = defaultSubmitLabel;
          }
        });
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

    if (!modal.hidden || (successPanel && !successPanel.hidden) || modal.dataset.bocEnquiryPosted === 'true') {
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
