const {JSDOM} = require('jsdom');

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
  const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost" });
  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = window.localStorage;
  return dom;
}

describe('touch swipe controls', () => {
  let app;
  beforeEach(() => {
    setupDom();
    app = require('../app.js');
    app.gameState.gameActive = true;
    app.gameState.board = Array(4).fill(null).map(() => Array(4).fill(0));
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('swipe right triggers move right', () => {
    const startEvent = { touches: [{ clientX: 0, clientY: 0 }], preventDefault: jest.fn() };
    app.handleTouchStart(startEvent);

    const endEvent = { changedTouches: [{ clientX: 100, clientY: 0 }], preventDefault: jest.fn() };
    const result = app.handleTouchEnd(endEvent);

    expect(result).toBe('right');
  });

  test('short swipe does not trigger move', () => {
    const startEvent = { touches: [{ clientX: 0, clientY: 0 }], preventDefault: jest.fn() };
    app.handleTouchStart(startEvent);

    const endEvent = { changedTouches: [{ clientX: 10, clientY: 0 }], preventDefault: jest.fn() };
    const result = app.handleTouchEnd(endEvent);

    expect(result).toBeNull();
  });

  test('vertical swipe triggers move up', () => {
    const startEvent = { touches: [{ clientX: 0, clientY: 100 }], preventDefault: jest.fn() };
    app.handleTouchStart(startEvent);

    const endEvent = { changedTouches: [{ clientX: 0, clientY: 0 }], preventDefault: jest.fn() };
    const result = app.handleTouchEnd(endEvent);

    expect(result).toBe('up');
  });
});
