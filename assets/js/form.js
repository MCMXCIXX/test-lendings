// ClearRay Solar Advisors — multi-step lead form logic
// States: FILLING (step 1..N) -> SUBMITTING (loading) -> SUCCESS (redirect to thank-you.html)

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('lead-form');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.form-step'));
  const totalSteps = steps.length;
  let currentStep = 1;

  const stepCurrentEl = document.getElementById('step-current');
  const stepTotalEl = document.getElementById('step-total');
  const progressFill = document.getElementById('progress-fill');
  const progressBar = form.querySelector('[role="progressbar"]');

  const btnBack = document.getElementById('btn-back');
  const btnNext = document.getElementById('btn-next');
  const btnSubmit = document.getElementById('btn-submit');
  const formSuccess = document.getElementById('form-success');

  if (stepTotalEl) stepTotalEl.textContent = String(totalSteps);

  const STORAGE_KEY = 'clearray_lead_form_progress';

  function loadSavedData() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveData() {
    try {
      const data = {};
      new FormData(form).forEach((value, key) => { data[key] = value; });
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* sessionStorage unavailable — progress simply won't persist across reload */
    }
  }

  function restoreData() {
    const data = loadSavedData();
    Object.keys(data).forEach((key) => {
      const field = form.querySelector(`[name="${key}"]`);
      if (!field) return;
      if (field.type === 'radio') {
        const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
        if (radio) radio.checked = true;
      } else {
        field.value = data[key];
      }
    });
  }

  restoreData();

  function showStep(stepNum) {
    steps.forEach((stepEl) => {
      stepEl.hidden = Number(stepEl.dataset.step) !== stepNum;
    });
    if (stepCurrentEl) stepCurrentEl.textContent = String(stepNum);
    const pct = Math.round((stepNum / totalSteps) * 100);
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressBar) progressBar.setAttribute('aria-valuenow', String(stepNum));

    btnBack.hidden = stepNum === 1;
    if (stepNum === totalSteps) {
      btnNext.hidden = true;
      btnSubmit.hidden = false;
    } else {
      btnNext.hidden = false;
      btnSubmit.hidden = true;
    }

    // Move focus to the new step's legend for accessibility.
    const activeLegend = form.querySelector(`.form-step[data-step="${stepNum}"] legend`);
    if (activeLegend) activeLegend.setAttribute('tabindex', '-1');
  }

  function setFieldError(name, message) {
    const errorEl = form.querySelector(`[data-error-for="${name}"]`);
    const fields = form.querySelectorAll(`[name="${name}"]`);
    if (errorEl) {
      if (message) {
        errorEl.textContent = message;
        errorEl.hidden = false;
      } else {
        errorEl.hidden = true;
      }
    }
    fields.forEach((f) => {
      if (message) {
        f.setAttribute('aria-invalid', 'true');
      } else {
        f.removeAttribute('aria-invalid');
      }
    });
  }

  function validateStep(stepNum) {
    const stepEl = steps.find((s) => Number(s.dataset.step) === stepNum);
    let valid = true;

    if (stepNum === 1) {
      const checked = stepEl.querySelector('input[name="homeOwnership"]:checked');
      if (!checked) { setFieldError('homeOwnership', 'Please select an option to continue.'); valid = false; }
      else setFieldError('homeOwnership', null);
    }

    if (stepNum === 2) {
      const checked = stepEl.querySelector('input[name="monthlyBill"]:checked');
      if (!checked) { setFieldError('monthlyBill', 'Please select an option to continue.'); valid = false; }
      else setFieldError('monthlyBill', null);
    }

    if (stepNum === 3) {
      const zip = form.querySelector('#zip');
      if (!/^\d{5}$/.test(zip.value.trim())) {
        setFieldError('zip', 'Please enter a valid 5-digit ZIP code.');
        valid = false;
      } else {
        setFieldError('zip', null);
      }
    }

    if (stepNum === 4) {
      const fullName = form.querySelector('#fullName');
      const email = form.querySelector('#email');
      const phone = form.querySelector('#phone');

      if (!fullName.value.trim() || fullName.value.trim().length < 2) {
        setFieldError('fullName', 'Please enter your full name.');
        valid = false;
      } else {
        setFieldError('fullName', null);
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value.trim())) {
        setFieldError('email', 'Please enter a valid email address.');
        valid = false;
      } else {
        setFieldError('email', null);
      }

      const phoneDigits = phone.value.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        setFieldError('phone', 'Please enter a valid 10-digit phone number.');
        valid = false;
      } else {
        setFieldError('phone', null);
      }
    }

    return valid;
  }

  // Clear errors as the user fixes fields.
  form.addEventListener('input', (e) => {
    const name = e.target.name;
    if (!name) return;
    if (e.target.type === 'radio') return;
    const errorEl = form.querySelector(`[data-error-for="${name}"]`);
    if (errorEl && !errorEl.hidden) {
      // Re-validate just this field's step lazily on next input.
      const stepEl = e.target.closest('.form-step');
      if (stepEl) validateStep(Number(stepEl.dataset.step));
    }
  });
  form.addEventListener('change', (e) => {
    if (e.target.type === 'radio') {
      const stepEl = e.target.closest('.form-step');
      if (stepEl) validateStep(Number(stepEl.dataset.step));
    }
  });

  btnNext.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    saveData();
    currentStep = Math.min(currentStep + 1, totalSteps);
    showStep(currentStep);
  });

  btnBack.addEventListener('click', () => {
    currentStep = Math.max(currentStep - 1, 1);
    showStep(currentStep);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    saveData();

    btnSubmit.disabled = true;
    btnSubmit.querySelector('.btn-label').textContent = 'Submitting…';
    btnSubmit.querySelector('.btn-spinner').hidden = false;

    // Simulated submission delay for realism — replace with a real request when a backend exists.
    // Example real integration (commented out):
    // const response = await fetch('https://your-api-endpoint.com/leads', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(Object.fromEntries(new FormData(form)))
    // });

    setTimeout(() => {
      try { sessionStorage.removeItem(STORAGE_KEY); } catch (err) { /* noop */ }
      window.location.href = 'thank-you.html';
    }, 1200);
  });

  showStep(currentStep);
});
