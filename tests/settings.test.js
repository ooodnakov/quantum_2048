
describe('settings persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetModules();
  });

  test('loads default settings when none saved', () => {
    const { settings: s } = require('../app.js');
    expect(s.boardSize).toBe(6);
    expect(s.startingCrystals).toBe(3);
  });

  test('saves and reloads custom settings', () => {
    let app = require('../app.js');
    app.settings.boardSize = 7;
    app.saveSettings();
    jest.resetModules();
    app = require('../app.js');
    expect(app.settings.boardSize).toBe(7);
  });

  test('resetSettings restores defaults', () => {
    let app = require('../app.js');
    app.settings.boardSize = 8;
    app.resetSettings();
    expect(app.settings.boardSize).toBe(6);
  });
});
