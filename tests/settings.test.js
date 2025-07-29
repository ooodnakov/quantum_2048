
describe('settings persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetModules();
  });

  test('loads default settings when none saved', () => {
    const { settings: s } = require('../app.js');
    expect(s.boardSize).toBe(6);
    expect(s.startingCrystals).toBe(3);
    expect(s.startingTiles).toBe(2);
  });

  test('saves and reloads custom settings', () => {
    let app = require('../app.js');
    app.settings.boardSize = 7;
    app.settings.startingTiles = 4;
    app.saveSettings();
    jest.resetModules();
    app = require('../app.js');
    expect(app.settings.boardSize).toBe(7);
    expect(app.settings.startingTiles).toBe(4);
  });

  test('resetSettings restores defaults', () => {
    let app = require('../app.js');
    app.settings.boardSize = 8;
    app.settings.startingTiles = 5;
    app.resetSettings();
    expect(app.settings.boardSize).toBe(6);
    expect(app.settings.startingTiles).toBe(2);
  });

  test('invalid menu values do not change settings', () => {
    document.body.innerHTML = `
      <input id="settingBoardSize" value="abc">
      <input id="settingCrystals" value="xyz">
      <input id="settingStartTiles" value="foo">
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

  test('startingTiles input is clamped to board capacity', () => {
    document.body.innerHTML = `
      <input id="settingBoardSize" value="4">
      <input id="settingCrystals" value="3">
      <input id="settingStartTiles" value="99">
      <input id="settingQuantumChance" value="10">
      <input id="settingHistory" value="5">
      <div id="score"></div>
      <div id="bestScore"></div>
      <div id="crystalCount"></div>
      <div id="gravityArrow"></div>
      <button id="rewindButton"></button>
      <div id="gameBoard"></div>
      <div id="gameScreen" class="screen hidden"></div>
      <div id="gameOverScreen"></div>
      <div id="particlesContainer"></div>
      <div id="startScreen" class="screen hidden"></div>
      <div id="settingsScreen" class="screen"></div>
    `;
    const app = require('../app.js');
    app.saveSettingsFromMenu();
    expect(app.settings.startingTiles).toBe(16);
  });

  test('startingTiles less than one defaults to one', () => {
    document.body.innerHTML = `
      <input id="settingBoardSize" value="6">
      <input id="settingCrystals" value="3">
      <input id="settingStartTiles" value="0">
      <input id="settingQuantumChance" value="10">
      <input id="settingHistory" value="5">
      <div id="score"></div>
      <div id="bestScore"></div>
      <div id="crystalCount"></div>
      <div id="gravityArrow"></div>
      <button id="rewindButton"></button>
      <div id="gameBoard"></div>
      <div id="gameScreen" class="screen hidden"></div>
      <div id="gameOverScreen"></div>
      <div id="particlesContainer"></div>
      <div id="startScreen" class="screen hidden"></div>
      <div id="settingsScreen" class="screen"></div>
    `;
    const app = require('../app.js');
    app.saveSettingsFromMenu();
    expect(app.settings.startingTiles).toBe(1);
  });

  test('saving settings returns to start screen without starting game', () => {
    document.body.innerHTML = `
      <input id="settingBoardSize" value="6">
      <input id="settingCrystals" value="3">
      <input id="settingStartTiles" value="2">
      <input id="settingQuantumChance" value="10">
      <input id="settingHistory" value="5">
      <div id="score"></div>
      <div id="bestScore"></div>
      <div id="crystalCount"></div>
      <div id="gravityArrow"></div>
      <button id="rewindButton"></button>
      <div id="gameBoard"></div>
      <div id="gameScreen" class="screen hidden"></div>
      <div id="gameOverScreen"></div>
      <div id="particlesContainer"></div>
      <div id="startScreen" class="screen hidden"></div>
      <div id="settingsScreen" class="screen"></div>
    `;
    const app = require('../app.js');
    app.saveSettingsFromMenu();
    expect(document.getElementById('startScreen').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('gameScreen').classList.contains('hidden')).toBe(true);
  });

  test('new game uses persisted settings', () => {
    document.body.innerHTML = `
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

    let app = require('../app.js');
    app.settings.boardSize = 5;
    app.settings.startingCrystals = 2;
    app.settings.startingTiles = 3;
    app.saveSettings();

    jest.resetModules();
    document.body.innerHTML = `
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
    app = require('../app.js');
    app.startGame();

    expect(app.gameState.board.length).toBe(5);
    expect(app.gameState.board[0].length).toBe(5);
    expect(app.gameState.crystals).toBe(2);
    const count = app.gameState.board.flat().filter(t => t.value > 0).length;
    expect(count).toBe(3);
  });

  test('reset settings affects subsequent games', () => {
    document.body.innerHTML = `
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
    app.settings.boardSize = 7;
    app.settings.startingCrystals = 5;
    app.settings.startingTiles = 4;
    app.resetSettings();
    app.startGame();

    expect(app.gameState.board.length).toBe(6);
    expect(app.gameState.crystals).toBe(3);
    const count = app.gameState.board.flat().filter(t => t.value > 0).length;
    expect(count).toBe(2);
  });
});
