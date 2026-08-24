// Verdalys Solaire — comportement global du site : navigation, année du footer, consentement cookies

document.addEventListener('DOMContentLoaded', () => {
  // Année du footer
  const yearEl = document.getElementById('copyright-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Menu mobile
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  initCookieConsent();
});

const CONSENT_KEY = 'verdalys_cookie_consent';

function getStoredConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function storeConsent(consent) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch (e) {
    /* localStorage indisponible — le consentement sera redemandé à la prochaine visite */
  }
}

function applyConsent(consent) {
  // Point d'intégration pour de vrais scripts analytics/marketing.
  // Exemple (désactivé) :
  // if (consent.analytics) { /* charger un outil de mesure d'audience */ }
  // if (consent.marketing) { /* charger les pixels publicitaires */ }
  window.__verdalysConsent = consent;
}

function initCookieConsent() {
  const banner = document.getElementById('cookie-banner');
  const settingsPanel = document.getElementById('cookie-settings-panel');
  const analyticsToggle = document.getElementById('consent-analytics');
  const marketingToggle = document.getElementById('consent-marketing');

  // Conformité RGPD/CNIL : aucun cookie non essentiel n'est appliqué tant que
  // l'utilisateur n'a pas fait un choix explicite (opt-in), pas de case pré-cochée.
  const existing = getStoredConsent();

  if (existing) {
    applyConsent(existing);
  } else if (banner) {
    banner.hidden = false;
  }

  function saveAndClose(consent) {
    storeConsent(consent);
    applyConsent(consent);
    if (banner) banner.hidden = true;
    if (settingsPanel) settingsPanel.hidden = true;
  }

  const acceptBtn = document.getElementById('cookie-accept');
  const rejectBtn = document.getElementById('cookie-reject');
  const openSettingsBtn = document.getElementById('cookie-settings-open');
  const footerSettingsBtn = document.getElementById('footer-cookie-settings');
  const cancelSettingsBtn = document.getElementById('cookie-settings-cancel');
  const saveSettingsBtn = document.getElementById('cookie-settings-save');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      saveAndClose({ necessary: true, analytics: true, marketing: true, timestamp: Date.now() });
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      saveAndClose({ necessary: true, analytics: false, marketing: false, timestamp: Date.now() });
    });
  }

  function openSettings() {
    if (!settingsPanel) return;
    const current = getStoredConsent();
    if (analyticsToggle) analyticsToggle.checked = current ? current.analytics : false;
    if (marketingToggle) marketingToggle.checked = current ? current.marketing : false;
    settingsPanel.hidden = false;
  }

  if (openSettingsBtn) openSettingsBtn.addEventListener('click', openSettings);
  if (footerSettingsBtn) footerSettingsBtn.addEventListener('click', openSettings);

  if (cancelSettingsBtn) {
    cancelSettingsBtn.addEventListener('click', () => {
      settingsPanel.hidden = true;
      const current = getStoredConsent();
      if (!current && banner) banner.hidden = false;
    });
  }

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      saveAndClose({
        necessary: true,
        analytics: !!(analyticsToggle && analyticsToggle.checked),
        marketing: !!(marketingToggle && marketingToggle.checked),
        timestamp: Date.now(),
      });
    });
  }
}
