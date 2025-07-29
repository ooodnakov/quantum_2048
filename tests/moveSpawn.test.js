function setupDom() {
  const html = `
    <div id="score"></div>
    <div id="bestScore"></div>
    <div id="crystalCount"></div>
    <div id="gravityArrow"></div>
    <button id="rewindButton"></button>
    <div id="gameBoard"></div>
    <div id="gameScreen"></div>
    <div id="particlesContainer"></div>
  `;
  document.body.innerHTML = html;
}
setupDom();
const { gameState, move, settings } = require('../app.js');

beforeEach(() => {
  gameState.board = Array.from({ length: settings.boardSize }, () => (
    Array.from({ length: settings.boardSize }, () => ({ id: null, value: 0 }))
  ));
  gameState.gameActive = true;
});

test('move merges tiles before spawning new one', () => {
  // Arrange board so first row has two tiles to merge
  gameState.board[0][0].value = 2;
  gameState.board[0][1].value = 2;
  jest
    .spyOn(Math, 'random')
    .mockReturnValueOnce(0) // choose first empty cell (0,1) after merge
    .mockReturnValueOnce(0); // exponent offset
  // Act
  move('left');
  // Assert
  expect(gameState.board[0][0].value).toBe(4);
  expect(gameState.board[0][1].value).toBe(2);
  Math.random.mockRestore();
});
