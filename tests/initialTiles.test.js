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

describe('initial tile spawn', () => {
  beforeEach(() => {
    setupDom();
  });

  test('initGame spawns tiles based on startingTiles setting', () => {
    settings.startingTiles = 4;
    initGame();
    const count = gameState.board.flat().filter(t => t.value > 0).length;
    expect(count).toBe(4);
  });
});
