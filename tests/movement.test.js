const { gameState, move, settings } = require('../app.js');

function setupDom() {
  document.body.innerHTML = `
    <div id="score"></div>
    <div id="bestScore"></div>
    <div id="crystalCount"></div>
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

  test('merged tile animates from second tile', () => {
    gameState.board[0][0] = { id: 1, value: 2 };
    gameState.board[0][1] = { id: 2, value: 2 };
    move('left');
    const tile = document.getElementById('gameBoard').children[0];
    expect(tile.classList.contains('move')).toBe(true);
    expect(tile.style.getPropertyValue('--dx')).toBe('1');
  });

  test('merge with gap uses correct source tile', () => {
    gameState.board[0][0] = { id: 1, value: 2 };
    gameState.board[0][2] = { id: 2, value: 2 };
    move('left');
    const tile = document.getElementById('gameBoard').children[0];
    expect(tile.classList.contains('move')).toBe(true);
    expect(tile.style.getPropertyValue('--dx')).toBe('2');
  });

  test('multiple merges calculate proper sources', () => {
    gameState.board[0][0] = { id: 1, value: 2 };
    gameState.board[0][1] = { id: 2, value: 2 };
    gameState.board[0][2] = { id: 3, value: 4 };
    gameState.board[0][3] = { id: 4, value: 4 };
    move('left');
    const boardEl = document.getElementById('gameBoard');
    const secondTile = boardEl.children[1];
    expect(secondTile.classList.contains('move')).toBe(true);
    expect(secondTile.style.getPropertyValue('--dx')).toBe('2');
  });
});
