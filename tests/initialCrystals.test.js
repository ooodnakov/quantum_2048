const { gameState, initGame, settings } = require('../app.js');

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

describe('initial crystal spawn', () => {
  beforeEach(() => {
    setupDom();
    gameState.moveHistory = [];
  });

  test('larger boards grant additional crystals', () => {
    settings.boardSize = 10;
    initGame();
    expect(gameState.crystals).toBe(Math.max(settings.startingCrystals, Math.floor(settings.boardSize / 2) - 1));
  });
});
