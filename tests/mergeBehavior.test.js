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
  `;
}

beforeEach(() => {
  setupDom();
  gameState.board = Array.from({ length: settings.boardSize }, () => (
    Array.from({ length: settings.boardSize }, () => ({ id: null, value: 0, type: 'normal' }))
  ));
  gameState.nextId = 1;
  gameState.gameActive = true;
  jest.useFakeTimers();
});

afterEach(() => {
  Math.random.mockRestore();
  jest.useRealTimers();
});

test('triple identical tiles merge into one pair without loss', () => {
  gameState.board[0][0] = { id: gameState.nextId++, value: 2, type: 'normal' };
  gameState.board[0][1] = { id: gameState.nextId++, value: 2, type: 'normal' };
  gameState.board[0][2] = { id: gameState.nextId++, value: 2, type: 'normal' };
  jest.spyOn(Math, 'random').mockReturnValue(0);

  move('left');
  jest.runAllTimers();

  expect(gameState.board[0][0].value).toBe(4);
  expect(gameState.board[0][1].value).toBe(2);
});

test('four identical tiles merge into two pairs', () => {
  gameState.board[0][0] = { id: gameState.nextId++, value: 2, type: 'normal' };
  gameState.board[0][1] = { id: gameState.nextId++, value: 2, type: 'normal' };
  gameState.board[0][2] = { id: gameState.nextId++, value: 2, type: 'normal' };
  gameState.board[0][3] = { id: gameState.nextId++, value: 2, type: 'normal' };
  jest.spyOn(Math, 'random').mockReturnValue(0);

  move('left');
  jest.runAllTimers();

  expect(gameState.board[0][0].value).toBe(4);
  expect(gameState.board[0][1].value).toBe(4);
});
