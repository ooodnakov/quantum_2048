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

describe('gravity relative movement', () => {
  beforeEach(() => {
    setupDom();
    gameState.board = Array.from({ length: settings.boardSize }, () => (
      Array.from({ length: settings.boardSize }, () => ({ id: null, value: 0 }))
    ));
    gameState.gameActive = true;
    gameState.gravity = 'east';
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    Math.random.mockRestore();
    jest.useRealTimers();
  });

  test('direction mapping follows gravity', () => {
    gameState.board[0][0] = { id: 1, value: 2 };
    move('up');
    jest.runAllTimers();
    expect(gameState.board[0][settings.boardSize - 1].value).toBe(2);
  });
});
