const {
  gameState,
  move,
  settings,
  spawnPhaseShiftTile,
  spawnEchoDuplicateTile,
  spawnNexusPortalTile,
} = require('../app.js');

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
    Array.from({ length: settings.boardSize }, () => ({ id: null, value: 0 }))
  ));
  gameState.gameActive = true;
  gameState.crystals = 0;
  gameState.echoPairs.clear();
});

test('phase shift merge randomizes gravity on next move', () => {
  spawnPhaseShiftTile(0, 0, 2);
  gameState.board[0][1] = { id: 99, value: 2 };
  const startGravity = gameState.gravity;
  move('left');
  expect(gameState.gravity).toBe(startGravity);
  jest.spyOn(Math, 'random').mockReturnValue(0);
  move('left');
  expect(gameState.gravity).toBe('north');
  Math.random.mockRestore();
});

test('phase shift tile toggles visibility based on counter', () => {
  jest.useFakeTimers();
  spawnPhaseShiftTile(0, 0, 2);
  let tile = gameState.board[0][0];
  tile.phaseCounter = 1;
  move('left');
  jest.runAllTimers();
  tile = gameState.board[0][0];
  expect(tile.phased).toBe(true);
  expect(tile.value).toBe(0);
  const stored = tile.storedValue;
  tile.phaseCounter = 1;
  move('left');
  jest.runAllTimers();
  tile = gameState.board[0][0];
  expect(tile.phased).toBe(false);
  expect(tile.value).toBe(stored);
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('phased tile allows other tiles to pass through', () => {
  gameState.board[0][0] = { id: 1, value: 2 };
  spawnPhaseShiftTile(0, 1, 4);
  gameState.board[0][1].phased = true;
  gameState.board[0][1].storedValue = 4;
  gameState.board[0][1].value = 0;
  jest.useFakeTimers();
  move('right');
  jest.runAllTimers();
  expect(gameState.board[0][settings.boardSize - 1].value).toBe(2);
  expect(gameState.board[0][1].phased).toBe(true);
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('echo duplicate merge grants crystal and removes echo', () => {
  spawnEchoDuplicateTile(0, 0, 2);
  const pair = [...gameState.echoPairs.values()][0];
  gameState.board[0][1] = { id: 77, value: 2 };
  const prev = gameState.crystals;
  move('left');
  expect(gameState.crystals).toBe(prev + 1);
  expect(gameState.board[pair.copyPos.r][pair.copyPos.c].value).toBe(0);
});

test('nexus portal teleports tile to opposite side', () => {
  spawnNexusPortalTile(0, 2, 2);
  gameState.board[0][3] = { id: 66, value: 4 };
  move('left');
  expect(gameState.board[0][settings.boardSize - 1].value).toBe(4);
});

test('merging portals clears a row', () => {
  jest.useFakeTimers();
  spawnNexusPortalTile(1,0,2);
  spawnNexusPortalTile(1,1,2);
  move('left');
  jest.runAllTimers();
  const cleared = gameState.board.some(row => row.every(cell => cell.value === 0));
  expect(cleared).toBe(true);
  jest.useRealTimers();
});
