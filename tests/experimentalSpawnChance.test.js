let game;
let gameState;
let addRandomTile;
let settings;

function setupDom() {
  document.body.innerHTML = `
    <div id="score"></div>
    <div id="bestScore"></div>
    <div id="crystalCount"></div>
    <div id="gravityArrow"></div>
    <button id="rewindButton"></button>
    <div id="gameBoard"></div>
    <div id="gameScreen"></div>
    <div id="particlesContainer"></div>
  `;
}

describe('experimental tile spawn chances', () => {
  beforeEach(() => {
    jest.resetModules();
    setupDom();
    game = require('../app.js');
    ({ gameState, addRandomTile, settings } = game);
    gameState.board = Array.from({ length: settings.boardSize }, () => (
      Array.from({ length: settings.boardSize }, () => ({ id: null, value: 0, type: 'normal' }))
    ));
    gameState.echoPairs.clear();
  });

  test('phase shift tile spawns when chance is 100%', () => {
    settings.phaseShiftSpawnChance = 1;
    settings.echoDuplicateSpawnChance = 0;
    settings.nexusPortalSpawnChance = 0;
    addRandomTile();
    const found = gameState.board.some(row => row.some(cell => cell.type === 'phase'));
    expect(found).toBe(true);
  });

  test('echo duplicate tile spawns when chance is 100%', () => {
    settings.phaseShiftSpawnChance = 0;
    settings.echoDuplicateSpawnChance = 1;
    settings.nexusPortalSpawnChance = 0;
    addRandomTile();
    const found = gameState.board.some(row => row.some(cell => cell.type === 'echo'));
    expect(found).toBe(true);
    expect(gameState.echoPairs.size).toBe(1);
  });

  test('nexus portal tile spawns when chance is 100%', () => {
    settings.phaseShiftSpawnChance = 0;
    settings.echoDuplicateSpawnChance = 0;
    settings.nexusPortalSpawnChance = 1;
    addRandomTile();
    const found = gameState.board.some(row => row.some(cell => cell.type === 'portal'));
    expect(found).toBe(true);
  });
});
