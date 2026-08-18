(function () {
  var ROOT = '[data-boc-faq]';

  function initFaqList(faqRoot) {
    if (!faqRoot || faqRoot.dataset.bocFaqListBound === 'true') return;
    faqRoot.dataset.bocFaqListBound = 'true';

    var oneOpen = faqRoot.getAttribute('data-one-open') === 'true';
    var items = faqRoot.querySelectorAll('[data-boc-faq-item]');

    items.forEach(function (item) {
      var trigger = item.querySelector('[data-boc-faq-trigger]');
      var panel = item.querySelector('[data-boc-faq-panel]');
      var icon = item.querySelector('[data-boc-faq-icon]');
      if (!trigger || !panel) return;

      trigger.addEventListener('click', function () {
        var opening = panel.hidden;

        if (oneOpen) {
          items.forEach(function (other) {
            var otherPanel = other.querySelector('[data-boc-faq-panel]');
            var otherTrigger = other.querySelector('[data-boc-faq-trigger]');
            var otherIcon = other.querySelector('[data-boc-faq-icon]');
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
    if (!section || section.dataset.bocFaqInit === 'true') return;
    section.dataset.bocFaqInit = 'true';
    section.querySelectorAll('[data-boc-faq-list]').forEach(initFaqList);
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
})();
