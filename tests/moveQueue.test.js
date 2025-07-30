const { gameState, move, settings, moveQueue } = require('../app.js');

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
  gameState.nextId = 2;
  gameState.gameActive = true;
  moveQueue.length = 0;
  jest.useFakeTimers();
});

afterEach(() => {
  Math.random.mockRestore();
  jest.useRealTimers();
});

test('queued moves execute after current move', () => {
  // Place single tile at end of row
  gameState.board[0][5] = { id: 1, value: 2 };
  jest.spyOn(Math, 'random').mockReturnValue(0);

  move('left');
  // This call should be queued because first move is in progress
  move('left');
  // run timers for both moves
  jest.runAllTimers();

  expect(gameState.board[0][0].value).toBe(4);
  expect(moveQueue.length).toBe(0);
});
