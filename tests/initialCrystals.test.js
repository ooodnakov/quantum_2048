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
  let originalBoardSize;

  beforeEach(() => {
    setupDom();
    originalBoardSize = settings.boardSize;
    gameState.moveHistory = [];
  });

  afterEach(() => {
    settings.boardSize = originalBoardSize;
  });

  test('larger boards grant additional crystals', () => {
    settings.boardSize = 10;
    initGame();
    expect(gameState.crystals).toBe(4);
  });

  test('smaller boards use starting crystals', () => {
    settings.boardSize = 4;
    initGame();
    expect(gameState.crystals).toBe(settings.startingCrystals);
  });
});
