const { gameState, addRandomTile, getMaxTile, settings } = require('../app.js');

beforeEach(() => {
  gameState.board = Array(settings.boardSize).fill(null).map(() => Array(settings.boardSize).fill(0));
});

test('getMaxTile finds highest value', () => {
  gameState.board[2][3] = 128;
  expect(getMaxTile(gameState.board)).toBe(128);
});

test('new tile scales with current max tile', () => {
  gameState.board[0][0] = 64;
  jest.spyOn(Math, 'random')
    .mockReturnValueOnce(0) // choose first empty cell
    .mockReturnValueOnce(0); // exponent offset 3
  addRandomTile();
  expect(gameState.board[0][1]).toBe(8);
  Math.random.mockRestore();
});

test('boardSize reflects expanded grid', () => {
  expect(settings.boardSize).toBe(6);
});
