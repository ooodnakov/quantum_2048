const { gameState, addRandomTile, getMaxTile, settings, processRow } = require('../app.js');

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

test('quantum bonus records jump positions', () => {
  const row = [
    { id: 1, value: 2 },
    { id: 2, value: 2 },
    { id: null, value: 0 },
    { id: null, value: 0 },
    { id: null, value: 0 },
    { id: null, value: 0 }
  ];
  jest.spyOn(Math, 'random').mockReturnValue(0); // ensure bonus
  const result = processRow(row);
  expect(result.quantumJumps).toEqual([0]);
  Math.random.mockRestore();
});
