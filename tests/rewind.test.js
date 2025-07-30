const { gameState, settings, saveGameState, rewindTime, renderBoard } = require('../app.js');

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

beforeEach(() => {
  setupDom();
  gameState.board = Array.from({ length: settings.boardSize }, () => (
    Array.from({ length: settings.boardSize }, () => ({ id: null, value: 0 }))
  ));
  gameState.moveHistory = [];
  gameState.crystals = 2;
  gameState.score = 0;
  gameState.gameActive = true;
  gameState.nextId = 2;
});

test('rewind animates tiles back to previous state', () => {
  // initial tile
  gameState.board[0][0] = { id: 1, value: 2 };
  saveGameState();

  // simulate moved tile
  gameState.board[0][0] = { id: null, value: 0 };
  gameState.board[0][3] = { id: 1, value: 2 };
  renderBoard();

  rewindTime();
  const boardEl = document.getElementById('gameBoard');
  const firstTile = boardEl.children[0];

  expect(gameState.board[0][0].id).toBe(1);
  expect(gameState.crystals).toBe(1);
  expect(firstTile.classList.contains('move')).toBe(true);
  expect(firstTile.style.getPropertyValue('--dx')).toBe('3');
});

test('rewind without history does nothing', () => {
  gameState.crystals = 1;
  // no moveHistory
  rewindTime();
  expect(gameState.crystals).toBe(1);
});
