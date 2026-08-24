// Verdalys Solaire — logique du formulaire multi-étapes
// États : REMPLISSAGE (étape 1..N) -> ENVOI (chargement) -> SUCCÈS (redirection vers merci.html)

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

  const STORAGE_KEY = 'verdalys_lead_form_progress';

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
      /* sessionStorage indisponible — la progression ne sera simplement pas conservée */
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
      const checked = stepEl.querySelector('input[name="statutOccupation"]:checked');
      if (!checked) { setFieldError('statutOccupation', 'Veuillez sélectionner une option pour continuer.'); valid = false; }
      else setFieldError('statutOccupation', null);
    }

    if (stepNum === 2) {
      const checked = stepEl.querySelector('input[name="factureMensuelle"]:checked');
      if (!checked) { setFieldError('factureMensuelle', 'Veuillez sélectionner une option pour continuer.'); valid = false; }
      else setFieldError('factureMensuelle', null);
    }

    if (stepNum === 3) {
      const codePostal = form.querySelector('#codePostal');
      if (!/^\d{5}$/.test(codePostal.value.trim())) {
        setFieldError('codePostal', 'Veuillez saisir un code postal valide à 5 chiffres.');
        valid = false;
      } else {
        setFieldError('codePostal', null);
      }
    }

    if (stepNum === 4) {
      const nomComplet = form.querySelector('#nomComplet');
      const email = form.querySelector('#email');
      const telephone = form.querySelector('#telephone');

      if (!nomComplet.value.trim() || nomComplet.value.trim().length < 2) {
        setFieldError('nomComplet', 'Veuillez saisir votre nom complet.');
        valid = false;
      } else {
        setFieldError('nomComplet', null);
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value.trim())) {
        setFieldError('email', 'Veuillez saisir une adresse e-mail valide.');
        valid = false;
      } else {
        setFieldError('email', null);
      }

      // Format téléphone français : 10 chiffres, éventuellement précédés de +33.
      const phoneDigits = telephone.value.replace(/[^\d]/g, '').replace(/^33/, '0');
      const isValidFrenchPhone = /^0[1-9]\d{8}$/.test(phoneDigits);
      if (!isValidFrenchPhone) {
        setFieldError('telephone', 'Veuillez saisir un numéro de téléphone français valide (10 chiffres).');
        valid = false;
      } else {
        setFieldError('telephone', null);
      }
    }

    return valid;
  }

  form.addEventListener('input', (e) => {
    const name = e.target.name;
    if (!name) return;
    if (e.target.type === 'radio') return;
    const errorEl = form.querySelector(`[data-error-for="${name}"]`);
    if (errorEl && !errorEl.hidden) {
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
    btnSubmit.querySelector('.btn-label').textContent = 'Envoi en cours…';
    btnSubmit.querySelector('.btn-spinner').hidden = false;

    // Délai simulé pour plus de réalisme — à remplacer par un vrai appel une fois le backend en place.
    // Exemple d'intégration réelle (désactivé) :
    // const response = await fetch('https://votre-api.exemple.com/leads', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(Object.fromEntries(new FormData(form)))
    // });

    setTimeout(() => {
      try { sessionStorage.removeItem(STORAGE_KEY); } catch (err) { /* noop */ }
      window.location.href = 'merci.html';
    }, 1200);
  });

  showStep(currentStep);
});
