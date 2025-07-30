const { gameState, settings, renderBoard, spawnPhaseShiftTile, spawnEchoDuplicateTile, spawnNexusPortalTile } = require('../app.js');

function setupDom() {
  document.body.innerHTML = `
    <div id="score"></div>
    <div id="bestScore"></div>
    <div id="crystalCount"></div>
    <div id="gravityArrow"></div>
    <button id="rewindButton"></button>
    <div id="gameBoard"></div>
  `;
}

beforeEach(() => {
  setupDom();
  gameState.board = Array.from({ length: settings.boardSize }, () => (
    Array.from({ length: settings.boardSize }, () => ({ id: null, value: 0 }))
  ));
  gameState.gameActive = true;
});

test('phase shift tiles use phase class', () => {
  spawnPhaseShiftTile(0, 0, 2);
  renderBoard();
  const tile = document.getElementById('gameBoard').children[0];
  expect(tile.classList.contains('phase')).toBe(true);
});

test('echo duplicate tiles use echo class', () => {
  spawnEchoDuplicateTile(0, 0, 2);
  renderBoard();
  const tile = document.getElementById('gameBoard').children[0];
  expect(tile.classList.contains('echo')).toBe(true);
});

test('nexus portal tiles use portal class', () => {
  spawnNexusPortalTile(0, 0, 2);
  renderBoard();
  const tile = document.getElementById('gameBoard').children[0];
  expect(tile.classList.contains('portal')).toBe(true);
});
