const {
  gameState,
  settings,
  renderBoard,
  spawnPhaseShiftTile,
  spawnEchoDuplicateTile,
  spawnNexusPortalTile
} = require('../app.js');

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

const cases = [
  ['phase shift', spawnPhaseShiftTile, 'phase'],
  ['echo duplicate', spawnEchoDuplicateTile, 'echo'],
  ['nexus portal', spawnNexusPortalTile, 'portal']
];

test.each(cases)('%s tiles use %s class', (_name, spawnFn, className) => {
  spawnFn(0, 0, 2);
  renderBoard();
  const tile = document.getElementById('gameBoard').children[0];
  expect(tile.classList.contains(className)).toBe(true);
});
