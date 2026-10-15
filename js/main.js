(() => {
  'use strict';

  const WHATSAPP_NUMBER = '918602897995';
  const CONTACT_EMAIL = 'academy@referindia.in';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------------------------------------------------------- */
  /* Header + mobile navigation                                       */
  /* ---------------------------------------------------------------- */

  function initHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;
    const update = () => header.setAttribute('data-scrolled', String(window.scrollY > 8));
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const panel = document.getElementById('mobile-nav');
    const header = document.getElementById('site-header');
    if (!toggle || !panel || !header) return;

    const desktop = window.matchMedia('(min-width: 1024px)');
    const SCROLL_CLOSE_DISTANCE = 32;
    let isOpen = false;
    let openedAtY = 0;
    let ticking = false;

    const setOpen = (open, { returnFocus = false } = {}) => {
      if (open === isOpen) return;
      isOpen = open;
      panel.setAttribute('data-open', String(open));
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      toggle.querySelector('[data-icon-open]').classList.toggle('hidden', open);
      toggle.querySelector('[data-icon-close]').classList.toggle('hidden', !open);
      if (open) {
        openedAtY = window.scrollY;
        header.setAttribute('data-scrolled', 'true');
      } else {
        header.setAttribute('data-scrolled', String(window.scrollY > 8));
        if (returnFocus) toggle.focus();
      }
    };

    toggle.addEventListener('click', () => setOpen(!isOpen));

    // Close after choosing a destination (including same-page anchors).
    panel.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    // Close when the page itself scrolls a meaningful distance. Scrolling inside the
    // menu panel does not move window.scrollY, so it never triggers this.
    window.addEventListener(
      'scroll',
      () => {
        if (!isOpen || ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          ticking = false;
          if (isOpen && Math.abs(window.scrollY - openedAtY) > SCROLL_CLOSE_DISTANCE) setOpen(false);
        });
      },
      { passive: true },
    );

    document.addEventListener('click', (event) => {
      if (isOpen && !header.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen) setOpen(false, { returnFocus: true });
    });

    desktop.addEventListener('change', (event) => {
      if (event.matches) setOpen(false);
    });
  }

  // Keep the floating WhatsApp button from covering form controls while the visitor is typing.
  function initFloatingButton() {
    const button = document.getElementById('whatsapp-float');
    if (!button) return;
    const isField = (el) => el && el.matches && el.matches('form input, form select, form textarea');
    document.addEventListener('focusin', (event) => {
      if (isField(event.target)) button.setAttribute('data-hidden', 'true');
    });
    document.addEventListener('focusout', (event) => {
      if (isField(event.target) && !isField(event.relatedTarget)) button.removeAttribute('data-hidden');
    });
  }

  /* ---------------------------------------------------------------- */
  /* Animations                                                       */
  /* ---------------------------------------------------------------- */

  function initAOS() {
    if (!window.AOS) {
      document.documentElement.classList.add('no-js');
      return;
    }
    window.AOS.init({
      once: true,
      duration: 650,
      easing: 'ease-out-cubic',
      offset: 40,
      disable: () => reducedMotion.matches,
    });
    // Images and fonts can shift layout after init; recalculate trigger points once loaded.
    window.addEventListener('load', () => window.AOS.refresh());
  }

  /* ---------------------------------------------------------------- */
  /* FAQ accordion                                                    */
  /* ---------------------------------------------------------------- */

  function initAccordions() {
    document.querySelectorAll('[data-accordion-trigger]').forEach((trigger) => {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!panel) return;
      trigger.addEventListener('click', () => {
        const open = trigger.getAttribute('aria-expanded') !== 'true';
        trigger.setAttribute('aria-expanded', String(open));
        panel.setAttribute('data-open', String(open));
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Certificate lightbox                                             */
  /* ---------------------------------------------------------------- */

  function initLightbox() {
    const dialog = document.getElementById('lightbox');
    const items = Array.from(document.querySelectorAll('[data-lightbox-item]'));
    if (!dialog || !items.length || typeof dialog.showModal !== 'function') return;

    const img = dialog.querySelector('[data-lightbox-img]');
    const caption = dialog.querySelector('[data-lightbox-caption]');
    const nav = dialog.querySelector('[data-lightbox-nav]');
    // Gallery cards only need an <img> and a [data-caption]; data-lightbox-* attributes are optional overrides.
    const srcOf = (el) => el.dataset.lightboxSrc || el.querySelector('img')?.getAttribute('src') || '';
    const altOf = (el) => el.dataset.lightboxAlt || el.querySelector('img')?.alt || '';
    const captionOf = (el) => el.dataset.lightboxCaption || el.querySelector('[data-caption]')?.textContent.trim() || '';
    let sources = [];
    let index = 0;
    let opener = null;

    // Cards whose image is missing remove themselves, so the list is rebuilt on every open.
    // The same image can appear in several galleries on one page; navigate unique sources only.
    const collect = () => {
      const live = items.filter((el) => el.isConnected);
      sources = Array.from(new Map(live.map((el) => [srcOf(el), el])).values());
      nav.classList.toggle('hidden', sources.length < 2);
      nav.classList.toggle('flex', sources.length > 1);
    };

    const show = (i) => {
      index = (i + sources.length) % sources.length;
      const item = sources[index];
      img.src = srcOf(item);
      img.alt = altOf(item);
      caption.textContent = captionOf(item);
    };

    items.forEach((item) => {
      item.addEventListener('click', () => {
        opener = item;
        collect();
        show(sources.findIndex((s) => srcOf(s) === srcOf(item)));
        dialog.showModal();
        document.documentElement.style.overflow = 'hidden';
      });
    });

    dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(index - 1));
    dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => show(index + 1));
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('keydown', (event) => {
      if (sources.length < 2) return;
      if (event.key === 'ArrowLeft') show(index - 1);
      if (event.key === 'ArrowRight') show(index + 1);
    });
    dialog.addEventListener('close', () => {
      document.documentElement.style.overflow = '';
      if (opener) opener.focus();
    });
  }

  /* ---------------------------------------------------------------- */
  /* Certificate gallery + carousel                                   */
  /* ---------------------------------------------------------------- */

  function initCertificates() {
    document.querySelectorAll('[data-cert] img').forEach((img) => {
      const card = img.closest('[data-cert]');
      const remove = () => {
        const carousel = card.closest('[data-carousel]');
        card.remove();
        if (carousel) carousel.dispatchEvent(new Event('carousel:update'));
      };
      if (img.complete && img.naturalWidth === 0) remove();
      else img.addEventListener('error', remove);
    });

    document.querySelectorAll('[data-carousel]').forEach((carousel) => {
      const track = carousel.querySelector('[data-carousel-track]');
      const prev = carousel.querySelector('[data-carousel-prev]');
      const next = carousel.querySelector('[data-carousel-next]');
      if (!track || !prev || !next) return;

      const update = () => {
        const max = track.scrollWidth - track.clientWidth;
        prev.disabled = track.scrollLeft <= 4;
        next.disabled = track.scrollLeft >= max - 4;
        carousel.querySelector('[data-carousel-controls]')?.classList.toggle('invisible', max <= 4);
      };
      const step = (dir) => {
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        track.scrollBy({ left: dir * track.clientWidth * 0.9, behavior });
      };

      prev.addEventListener('click', () => step(-1));
      next.addEventListener('click', () => step(1));
      track.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update, { passive: true });
      carousel.addEventListener('carousel:update', update);
      update();
    });
  }

  /* ---------------------------------------------------------------- */
  /* Forms                                                            */
  /* ---------------------------------------------------------------- */

  const normalizePhone = (value) => {
    let digits = value.replace(/[\s\-().]/g, '');
    if (digits.startsWith('+91')) digits = digits.slice(3);
    else if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    return digits;
  };

  const validators = {
    name: (v) => (v.length < 2 ? 'Please enter your full name.' : /\d/.test(v) ? 'Name should not contain numbers.' : ''),
    phone: (v) =>
      /^[6-9]\d{9}$/.test(normalizePhone(v)) ? '' : 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).',
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Please enter a valid email address (e.g. name@example.com).'),
  };

  const requiredMessage = (control) => {
    if (control.type === 'checkbox') return 'Please confirm that we may contact you.';
    if (control.tagName === 'SELECT') return 'Please select a course.';
    const label = control.labels && control.labels[0] ? control.labels[0].firstChild.textContent.trim() : 'This field';
    return `Please enter your ${label.toLowerCase()}.`;
  };

  function validateControl(control) {
    const value = control.type === 'checkbox' ? '' : control.value.trim();
    let message = '';
    if (control.required && (control.type === 'checkbox' ? !control.checked : !value)) {
      message = requiredMessage(control);
    } else if (value && control.dataset.validate && validators[control.dataset.validate]) {
      message = validators[control.dataset.validate](value);
    }
    const error = document.getElementById(`${control.id}-error`);
    control.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }
    return !message;
  }

  function preselectCourse(form) {
    const select = form.querySelector('[data-course-select]');
    const slug = new URLSearchParams(window.location.search).get('course');
    if (!select || !slug) return;
    const option = select.querySelector(`option[data-slug="${CSS.escape(slug)}"]`);
    if (option) select.value = option.value;
  }

  function summary(data) {
    const lines = [
      `Form: ${data.get('form_type')}`,
      `Name: ${data.get('full_name')}`,
      `Mobile: ${data.get('mobile')}`,
      `Email: ${data.get('email')}`,
    ];
    if (data.get('course')) lines.push(`Course: ${data.get('course')}`);
    if (data.get('city')) lines.push(`City: ${data.get('city')}`);
    if (data.get('message')) lines.push(`Message: ${data.get('message')}`);
    lines.push('Consent to be contacted: Yes');
    return lines.join('\n');
  }

  function renderStatus(container, { type, title, body, actions = '' }) {
    const styles = {
      success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      error: 'border-red-200 bg-red-50 text-red-900',
      info: 'border-brand-200 bg-brand-50 text-brand-950',
    };
    container.innerHTML = `<div class="rounded-2xl border p-5 ${styles[type]}">
      <p class="font-bold"></p><p class="mt-1 text-sm leading-relaxed"></p>${actions}
    </div>`;
    container.querySelector('p.font-bold').textContent = title;
    container.querySelector('p.text-sm').textContent = body;
    container.focus({ preventScroll: true });
    container.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest' });
  }

  function handoffActions(data) {
    const text = summary(data);
    const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello Refer India Digital Academy,\n\n${text}`)}`;
    const subject = data.get('form_type') === 'Course Application' ? `Course Application: ${data.get('course')}` : 'Website Enquiry';
    const mail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    return `<div class="mt-4 flex flex-col gap-2 sm:flex-row">
      <a class="btn btn-sm btn-whatsapp" href="${wa}" target="_blank" rel="noopener">Send via WhatsApp</a>
      <a class="btn btn-sm btn-outline" href="${mail}">Send via Email</a>
    </div>`;
  }

  function initForm(form) {
    const controls = Array.from(form.querySelectorAll('input:not([type="hidden"]):not([name="_gotcha"]), select, textarea'));
    const submit = form.querySelector('[data-submit]');
    const label = form.querySelector('[data-submit-label]');
    const spinner = form.querySelector('[data-spinner]');
    const status = form.querySelector('[data-form-status]');
    const defaultLabel = label.textContent;
    let submitting = false;

    preselectCourse(form);

    const resetForm = () => {
      form.reset();
      controls.forEach((control) => {
        delete control.dataset.touched;
        control.setAttribute('aria-invalid', 'false');
      });
      status.innerHTML = '';
    };

    if (form.dataset.form === 'enquiry' || form.dataset.form === 'application') {
      let pageWasHidden = false;
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          pageWasHidden = true;
        } else if (pageWasHidden) {
          pageWasHidden = false;
          resetForm();
        }
      });
      window.addEventListener('pageshow', (event) => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (event.persisted || navigation?.type === 'back_forward') resetForm();
      });
    }

    controls.forEach((control) => {
      const event = control.type === 'checkbox' || control.tagName === 'SELECT' ? 'change' : 'blur';
      control.addEventListener(event, () => {
        if (control.dataset.touched || control.value || control.checked) {
          control.dataset.touched = 'true';
          validateControl(control);
        }
      });
      control.addEventListener('input', () => {
        if (control.getAttribute('aria-invalid') === 'true') validateControl(control);
      });
    });

    const setBusy = (busy) => {
      submitting = busy;
      submit.disabled = busy;
      submit.setAttribute('aria-busy', String(busy));
      spinner.classList.toggle('hidden', !busy);
      label.textContent = busy ? 'Submitting…' : defaultLabel;
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (submitting) return;

      const invalid = controls.filter((control) => {
        control.dataset.touched = 'true';
        return !validateControl(control);
      });
      if (invalid.length) {
        status.innerHTML = '';
        invalid[0].focus();
        return;
      }

      const data = new FormData(form);
      if (data.get('_gotcha')) return;
      data.set('mobile', normalizePhone(String(data.get('mobile'))));
      data.delete('_gotcha');
      data.set('page', window.location.href);

      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        return;
      }

      setBusy(true);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        renderStatus(status, {
          type: 'success',
          title: form.dataset.form === 'application' ? 'Application submitted successfully' : 'Enquiry sent successfully',
          body: 'Thank you! Our team will contact you soon regarding your request.',
        });
      } catch (error) {
        renderStatus(status, {
          type: 'error',
          title: 'We could not submit your details',
          body: 'Something went wrong while sending the form. Please check your internet connection and try again, or contact us directly using one of the options below.',
          actions: handoffActions(data),
        });
      } finally {
        window.clearTimeout(timeout);
        setBusy(false);
      }
    });
  }

  /* ---------------------------------------------------------------- */

  initHeader();
  initMobileNav();
  initFloatingButton();
  initAccordions();
  initCertificates();
  initLightbox();
  document.querySelectorAll('form[data-form]').forEach(initForm);
  initAOS();
})();
