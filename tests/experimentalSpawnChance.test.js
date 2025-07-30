let game;
let gameState;
let addRandomTile;
let settings;

function setupDom() {
  document.body.innerHTML = `
    <div id="score"></div>
    <div id="bestScore"></div>
    <div id="crystalCount"></div>
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

  test.each([
    { name: 'phase shift', type: 'phase', chances: { phaseShiftSpawnChance: 1, echoDuplicateSpawnChance: 0, nexusPortalSpawnChance: 0 } },
    { name: 'echo duplicate', type: 'echo', chances: { phaseShiftSpawnChance: 0, echoDuplicateSpawnChance: 1, nexusPortalSpawnChance: 0 } },
    { name: 'nexus portal', type: 'portal', chances: { phaseShiftSpawnChance: 0, echoDuplicateSpawnChance: 0, nexusPortalSpawnChance: 1 } }
  ])('$name tile spawns when chance is 100%', ({ type, chances }) => {
    Object.assign(settings, chances);
    addRandomTile();
    const found = gameState.board.some(row => row.some(cell => cell.type === type));
    expect(found).toBe(true);
    const expectedEchoPairs = type === 'echo' ? 1 : 0;
    expect(gameState.echoPairs.size).toBe(expectedEchoPairs);
  });
});
