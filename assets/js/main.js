// ClearRay Solar Advisors — site-wide behavior: nav toggle, footer year, cookie consent

document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const yearEl = document.getElementById('copyright-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
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

const CONSENT_KEY = 'clearray_cookie_consent';

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
    /* localStorage unavailable — consent will be re-prompted next visit */
  }
}

function applyConsent(consent) {
  // Integration point for real analytics/marketing scripts.
  // Example (commented out):
  // if (consent.analytics) { /* load Google Analytics */ }
  // if (consent.marketing) { /* load ad pixels */ }
  window.__clearrayConsent = consent;
}

function initCookieConsent() {
  const banner = document.getElementById('cookie-banner');
  const settingsPanel = document.getElementById('cookie-settings-panel');
  const analyticsToggle = document.getElementById('consent-analytics');
  const marketingToggle = document.getElementById('consent-marketing');

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
      // If the user never gave initial consent, keep the banner visible.
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
