/**
 * Telco Review - Main JS. Mobile menu, form validation, smooth scroll.
 */
(function () {
  'use strict';

  // Mobile nav toggle
  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('nav-desktop');
  if (navToggle && nav) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Contact form: client-side validation and submit
  var form = document.getElementById('contact-form');
  if (form) {
    var messageEl = document.getElementById('form-message');
    var required = form.querySelectorAll('[required]');
    var startedAtField = form.querySelector('input[name="form_started_at"]');
    if (startedAtField) {
      startedAtField.value = String(Date.now());
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot: if filled, pretend success (anti-spam)
      var hp = form.querySelector('.hp');
      if (hp && hp.value) {
        if (messageEl) {
          messageEl.textContent = 'Thank you. We will be in touch shortly.';
          messageEl.className = 'form-message success';
          messageEl.classList.remove('hidden');
        }
        form.reset();
        return;
      }

      // Minimal validation
      var valid = true;
      required.forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.setAttribute('aria-invalid', 'true');
        } else {
          field.removeAttribute('aria-invalid');
        }
      });
      if (!valid) {
        if (messageEl) {
          messageEl.textContent = 'Please complete all required fields.';
          messageEl.className = 'form-message error';
          messageEl.classList.remove('hidden');
        }
        return;
      }

      var action = form.getAttribute('action') || '';
      var method = (form.getAttribute('method') || 'get').toLowerCase();
      if (method !== 'post') method = 'post';

      if (!action || action === '#' || action === '') {
        // No endpoint: show instruction or use Formspree placeholder
        if (messageEl) {
          messageEl.textContent = 'Form endpoint not configured. See README for deployment.';
          messageEl.className = 'form-message error';
          messageEl.classList.remove('hidden');
        }
        return;
      }

      var fd = new FormData(form);
      fetch(action, {
        method: method,
        body: fd,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            if (messageEl) {
              messageEl.textContent = 'Thank you. We will be in touch shortly.';
              messageEl.className = 'form-message success';
              messageEl.classList.remove('hidden');
            }
            form.reset();
          } else {
            throw new Error('Submit failed');
          }
        })
        .catch(function () {
          if (messageEl) {
            messageEl.textContent = 'Something went wrong. Please try again or email us directly.';
            messageEl.className = 'form-message error';
            messageEl.classList.remove('hidden');
          }
        });
    });
  }
})();
