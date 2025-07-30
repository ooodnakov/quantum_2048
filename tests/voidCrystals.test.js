const { gameState, move, settings, deleteTileAt } = require('../app.js');

function setupDom() {
  document.body.innerHTML = `
    <div id="score"></div>
    <div id="bestScore"></div>
    <div id="crystalCount"></div>
    <div id="deleteCount"></div>
    <div id="gravityArrow"></div>
    <button id="rewindButton"></button>
    <button id="deleteModeButton"></button>
    <div id="gameBoard"></div>
    <div id="gameScreen"></div>
    <div id="particlesContainer"></div>
    <div id="achievementPopup" class="hidden"></div>
    <div id="achievementText"></div>
  `;
}

describe('void crystals', () => {
  beforeEach(() => {
    setupDom();
    gameState.board = Array.from({ length: settings.boardSize }, () => (
      Array.from({ length: settings.boardSize }, () => ({ id: null, value: 0 }))
    ));
    gameState.voidCrystals = 0;
    gameState.highestTile = 2;
    gameState.gameActive = true;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    if (Math.random.mockRestore) {
      Math.random.mockRestore();
    }
  });

  test('gaining new max tile grants a void crystal', () => {
    gameState.board[0][0] = { id: 1, value: 2 };
    gameState.board[0][1] = { id: 2, value: 2 };
    jest.spyOn(Math, 'random').mockReturnValue(0);
    move('left');
    jest.runAllTimers();
    expect(gameState.voidCrystals).toBe(1);
  });

  test('deleteTileAt consumes a crystal and clears tile', () => {
    gameState.board[0][0] = { id: 1, value: 4 };
    gameState.voidCrystals = 1;
    const result = deleteTileAt(0, 0);
    expect(result).toBe(true);
    expect(gameState.board[0][0].value).toBe(0);
    expect(gameState.voidCrystals).toBe(0);
  });

  test('deleting highest tile updates gameState.highestTile', () => {
    gameState.board[0][0] = { id: 1, value: 16 };
    gameState.board[0][1] = { id: 2, value: 8 };
    gameState.highestTile = 16;
    gameState.voidCrystals = 1;

    deleteTileAt(0, 0);

    expect(gameState.highestTile).toBe(8);
  });
});
