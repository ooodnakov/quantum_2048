const { gameState, addRandomTile, BOARD_SIZE, getMaxTile } = require('../app.js');

beforeEach(() => {
  gameState.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
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

test('BOARD_SIZE reflects expanded grid', () => {
  expect(BOARD_SIZE).toBe(6);
});
