/* ============================================================
   APP.JS — Core Application, Data Loader, Shared Utilities
   ============================================================ */

// Global data store
let APP_DATA = null;

/**
 * Load appsettings.json data
 */
async function loadAppData() {
  try {
    const res = await fetch('../appsettings.json');
    APP_DATA = await res.json();
    return APP_DATA;
  } catch (err) {
    console.error('Failed to load appsettings.json:', err);
    return null;
  }
}

/**
 * Get stored data from localStorage (for admin edits, feedbacks, etc.)
 */
function getStoredData(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Merge localStorage overrides with appsettings defaults
 */
function getMergedData() {
  if (!APP_DATA) return null;
  const overrides = getStoredData('contentOverrides', {});
  return {
    ...APP_DATA,
    personalInfo: { ...APP_DATA.personalInfo, ...overrides.personalInfo },
    professionalBackground: overrides.professionalBackground || APP_DATA.professionalBackground,
    researchInterests: overrides.researchInterests || APP_DATA.researchInterests,
    journalArticles: overrides.journalArticles || APP_DATA.journalArticles,
  };
}

/**
 * Initialize common page elements
 */
function initCommonElements() {
  // Footer year
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Footer socials
  const footerSocials = document.getElementById('footerSocials');
  if (footerSocials && APP_DATA) {
    footerSocials.innerHTML = APP_DATA.socialProfiles.map(p => {
      const icon = getSocialIcon(p.icon);
      return `<a href="${p.url}" target="_blank" rel="noopener" data-tooltip="${p.name}">${icon}</a>`;
    }).join('');
  }

  // Navbar scroll effect
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // Back to top
  const btt = document.getElementById('backToTop');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.classList.toggle('visible', window.scrollY > 400);
    });
    btt.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Loading screen
  const loader = document.getElementById('loadingScreen');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 800);
  }
}

/**
 * Get social media icon HTML
 */
function getSocialIcon(iconKey) {
  const icons = {
    'google-scholar': '<i class="ai ai-google-scholar"></i>',
    'orcid': '<i class="ai ai-orcid"></i>',
    'scopus': '<i class="ai ai-scopus"></i>',
    'researchgate': '<i class="ai ai-researchgate"></i>',
    'linkedin': '<i class="bi bi-linkedin"></i>',
    'email': '<i class="bi bi-envelope"></i>',
  };
  return icons[iconKey] || '<i class="bi bi-link-45deg"></i>';
}

/**
 * Time-based greeting
 */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Initialize app on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadAppData();
  if (!APP_DATA) return;

  initCommonElements();

  // Page-specific init — these functions are defined in components.js
  if (typeof initHomePage === 'function') initHomePage();
  if (typeof initResearchPage === 'function') initResearchPage();
  if (typeof initEducationPage === 'function') initEducationPage();
  if (typeof initAcademicsPage === 'function') initAcademicsPage();
  if (typeof initContactPage === 'function') initContactPage();
  if (typeof initToolsPage === 'function') initToolsPage();
  if (typeof initSearchPage === 'function') initSearchPage();
});
