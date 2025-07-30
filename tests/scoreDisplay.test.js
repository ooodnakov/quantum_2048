const setupDom = () => {
  document.body.innerHTML = `
    <div id="score"></div>
    <div id="bestScore"></div>
    <div id="crystalCount"></div>
    <button id="rewindButton"></button>
    <div id="gameBoard"></div>
  `;
};

beforeEach(() => {
  jest.resetModules();
  setupDom();
});

test('updateDisplay shows short form for large scores', () => {
  const app = require('../app.js');
  app.gameState.score = 123456;
  app.gameState.bestScore = 54321;
  app.updateDisplay();
  expect(document.getElementById('score').textContent).toBe('123,456 (123k)');
  expect(document.getElementById('bestScore').textContent).toBe('54,321 (54k)');
});

test('updateDisplay shows raw numbers for small scores', () => {
  const app = require('../app.js');
  app.gameState.score = 512;
  app.gameState.bestScore = 256;
  app.updateDisplay();
  expect(document.getElementById('score').textContent).toBe('512');
  expect(document.getElementById('bestScore').textContent).toBe('256');
});

test('updateDisplay shows formatted numbers for scores between 1,000 and 9,999', () => {
  const app = require('../app.js');
  app.gameState.score = 1234;
  app.gameState.bestScore = 9999;
  app.updateDisplay();
  expect(document.getElementById('score').textContent).toBe('1,234');
  expect(document.getElementById('bestScore').textContent).toBe('9,999');
});
