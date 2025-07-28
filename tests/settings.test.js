
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

  test('invalid menu values do not change settings', () => {
    document.body.innerHTML = `
      <input id="settingBoardSize" value="abc">
      <input id="settingCrystals" value="xyz">
      <input id="settingQuantumChance" value="--">
      <input id="settingHistory" value="NaN">
      <div id="score"></div>
      <div id="bestScore"></div>
      <div id="crystalCount"></div>
      <div id="gravityArrow"></div>
      <button id="rewindButton"></button>
      <div id="gameBoard"></div>
      <div id="gameScreen"></div>
      <div id="gameOverScreen"></div>
      <div id="particlesContainer"></div>
      <div id="startScreen"></div>
      <div id="settingsScreen"></div>
    `;
    const app = require('../app.js');
    const original = { ...app.settings };
    app.saveSettingsFromMenu();
    expect(app.settings).toEqual(original);
  });
});
