const { gameState, addRandomTile, getMaxTile, settings } = require('../app.js');

beforeEach(() => {
  gameState.board = Array.from({ length: settings.boardSize }, () => (
    Array.from({ length: settings.boardSize }, () => ({ id: null, value: 0 }))
  ));
});

test('getMaxTile finds highest value', () => {
  gameState.board[2][3].value = 128;
  expect(getMaxTile(gameState.board)).toBe(128);
});

test('new tile scales with current max tile', () => {
  gameState.board[0][0].value = 64;
  jest.spyOn(Math, 'random')
    .mockReturnValueOnce(0) // choose first empty cell
    .mockReturnValueOnce(0); // exponent offset 3
  addRandomTile();
  expect(gameState.board[0][1].value).toBe(8);
  Math.random.mockRestore();
});

test('boardSize reflects expanded grid', () => {
  expect(settings.boardSize).toBe(6);
});
