const { gameState, move, settings } = require('../app.js');

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
    <div id="achievementPopup" class="hidden"></div>
    <div id="achievementText"></div>
  `;
}

describe('movement animation', () => {
  beforeEach(() => {
    setupDom();
    gameState.board = Array.from({ length: settings.boardSize }, () => (
      Array.from({ length: settings.boardSize }, () => ({ id: null, value: 0 }))
    ));
    gameState.nextId = 2;
    gameState.gameActive = true;
    gameState.score = 0;
  });

  test('tile moving multiple spaces sets translation variables', () => {
    gameState.board[0][3] = { id: 1, value: 2 };
    move('left');
    const firstTile = document.getElementById('gameBoard').children[0];
    expect(firstTile.classList.contains('move')).toBe(true);
    expect(firstTile.style.getPropertyValue('--dx')).toBe('3');
    expect(firstTile.style.getPropertyValue('--dy')).toBe('0');
  });
});
