/**
 * Boat O'Craigo header — mobile drawer interactions.
 * Handles open/close, escape, backdrop, scroll lock, submenu toggles,
 * and reinitialisation on shopify:section:load.
 */
(function () {
  const SELECTOR = '[data-boc-header]';

  class BocHeaderController {
    /** @param {HTMLElement} root */
    constructor(root) {
      this.root = root;
      this.drawer = root.querySelector('[data-boc-header-drawer]');
      this.backdrop = root.querySelector('[data-boc-header-backdrop]');
      this.openTrigger = root.querySelector('[data-boc-header-open]');
      this.closeTriggers = root.querySelectorAll('[data-boc-header-close]');
      this.submenuToggles = root.querySelectorAll('[data-boc-header-submenu-toggle]');

      this.handleKeydown = this.handleKeydown.bind(this);
      this.handleOpen = this.handleOpen.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.handleBackdropClick = this.handleBackdropClick.bind(this);
      this.handleSubmenuToggle = this.handleSubmenuToggle.bind(this);

      this.bindEvents();
    }

    bindEvents() {
      this.openTrigger?.addEventListener('click', this.handleOpen);
      this.closeTriggers.forEach((trigger) => {
        trigger.addEventListener('click', this.handleClose);
      });
      this.backdrop?.addEventListener('click', this.handleBackdropClick);
      this.submenuToggles.forEach((toggle) => {
        toggle.addEventListener('click', this.handleSubmenuToggle);
      });
    }

    unbindEvents() {
      this.openTrigger?.removeEventListener('click', this.handleOpen);
      this.closeTriggers.forEach((trigger) => {
        trigger.removeEventListener('click', this.handleClose);
      });
      this.backdrop?.removeEventListener('click', this.handleBackdropClick);
      this.submenuToggles.forEach((toggle) => {
        toggle.removeEventListener('click', this.handleSubmenuToggle);
      });
      document.removeEventListener('keydown', this.handleKeydown);
    }

    handleOpen() {
      if (!this.drawer) return;

      this.drawer.removeAttribute('hidden');
      this.backdrop?.removeAttribute('hidden');
      this.drawer.classList.add('is-open');
      this.backdrop?.classList.add('is-visible');
      this.openTrigger?.setAttribute('aria-expanded', 'true');
      document.body.classList.add('boc-scroll-lock');
      document.addEventListener('keydown', this.handleKeydown);

      const firstFocusable = this.drawer.querySelector('button, a, input');
      firstFocusable?.focus();
    }

    handleClose() {
      if (!this.drawer) return;

      this.drawer.classList.remove('is-open');
      this.backdrop?.classList.remove('is-visible');
      this.drawer.setAttribute('hidden', '');
      this.backdrop?.setAttribute('hidden', '');
      this.openTrigger?.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('boc-scroll-lock');
      document.removeEventListener('keydown', this.handleKeydown);

      this.root.querySelectorAll('[data-boc-header-submenu-toggle]').forEach((toggle) => {
        toggle.closest('[data-boc-header-submenu]')?.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });

      this.openTrigger?.focus();
    }

    handleBackdropClick(event) {
      if (event.target === this.backdrop) {
        this.handleClose();
      }
    }

    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.handleClose();
      }
    }

    /** @param {Event} event */
    handleSubmenuToggle(event) {
      const toggle = event.currentTarget;
      if (!(toggle instanceof HTMLElement)) return;

      const group = toggle.closest('[data-boc-header-submenu]');
      if (!group) return;

      const isOpen = group.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    destroy() {
      this.handleClose();
      this.unbindEvents();
    }
  }

  /** @type {Map<HTMLElement, BocHeaderController>} */
  const instances = new Map();

  function initHeader(root) {
    if (!(root instanceof HTMLElement) || instances.has(root)) return;
    instances.set(root, new BocHeaderController(root));
  }

  function destroyHeader(root) {
    const instance = instances.get(root);
    if (!instance) return;
    instance.destroy();
    instances.delete(root);
  }

  function initAll() {
    document.querySelectorAll(SELECTOR).forEach((root) => {
      if (root instanceof HTMLElement) {
        initHeader(root);
      }
    });
  }

  function handleSectionLoad(event) {
    const section = event.target;
    if (!(section instanceof HTMLElement)) return;

    section.querySelectorAll(SELECTOR).forEach((root) => {
      if (root instanceof HTMLElement) {
        destroyHeader(root);
        initHeader(root);
      }
    });
  }

  function handleSectionUnload(event) {
    const section = event.target;
    if (!(section instanceof HTMLElement)) return;

    section.querySelectorAll(SELECTOR).forEach((root) => {
      if (root instanceof HTMLElement) {
        destroyHeader(root);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', handleSectionLoad);
  document.addEventListener('shopify:section:unload', handleSectionUnload);
})();
