const { gameState, addRandomTile, getMaxTile, settings, performQuantumJumps } = require('../app.js');

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

test('quantum jumps merge diagonal tiles', () => {
  gameState.board[0][0].value = 2;
  gameState.board[1][1].value = 2;
  jest.spyOn(Math, 'random').mockReturnValue(0); // always merge and choose first
  const result = performQuantumJumps();
  expect(gameState.board[0][0].value).toBe(4);
  expect(gameState.board[1][1].value).toBe(0);
  expect(result.quantumPositions).toEqual([{ r: 0, c: 0 }]);
  Math.random.mockRestore();
});

test('quantum jump probability follows settings', () => {
  gameState.board[0][0].value = 2;
  gameState.board[1][1].value = 2;
  jest.spyOn(Math, 'random').mockReturnValue(0);
  const original = settings.quantumBonusChance;
  try {
    settings.quantumBonusChance = 0;
    let result = performQuantumJumps();
    expect(result.quantumPositions).toEqual([]);
    expect(gameState.board[0][0].value).toBe(2);
    expect(gameState.board[1][1].value).toBe(2);
    settings.quantumBonusChance = 1;
    result = performQuantumJumps();
    expect(result.quantumPositions).toEqual([{ r: 0, c: 0 }]);
    expect(gameState.board[0][0].value).toBe(4);
    expect(gameState.board[1][1].value).toBe(0);
  } finally {
    settings.quantumBonusChance = original;
    Math.random.mockRestore();
  }
});
