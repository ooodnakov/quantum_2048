const { gameState, initGame, settings } = require('../app.js');

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

describe('initial tile spawn', () => {
  beforeEach(() => {
    setupDom();
  });

  test('initGame spawns progressively larger tiles based on startingTiles', () => {
    settings.startingTiles = 4;
    initGame();
    const values = gameState.board
      .flat()
      .filter(t => t.value > 0)
      .map(t => t.value)
      .sort((a, b) => a - b);
    expect(values).toEqual([2, 4, 8, 16]);
  });
});
