const setupDom = () => {
  document.body.innerHTML = `
    <span id="text" data-i18n="start_button"></span>
    <select id="languageSelect"></select>
    <div id="score"></div>
    <div id="bestScore"></div>
    <div id="crystalCount"></div>
    <button id="rewindButton"></button>
    <div id="gameBoard"></div>
    <div id="gameScreen"></div>
    <div id="particlesContainer"></div>
  `;
};

describe('language toggle', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetModules();
    setupDom();
  });

  test('defaults to English', () => {
    const app = require('../app.js');
    app.applyTranslations();
    expect(app.getCurrentLanguage()).toBe('en');
    expect(document.getElementById('text').textContent).toBe('Start Quantum Journey');
  });

  test('switches to Russian and persists', () => {
    const app = require('../app.js');
    app.setLanguage('ru');
    expect(document.getElementById('text').textContent).toBe('Начать квантовое путешествие');
    jest.resetModules();
    setupDom();
    const appReloaded = require('../app.js');
    expect(appReloaded.getCurrentLanguage()).toBe('ru');
  });

  test('handleLanguageChange alias works', () => {
    const app = require('../app.js');
    window.handleLanguageChange('ru');
    expect(app.getCurrentLanguage()).toBe('ru');
  });
});
