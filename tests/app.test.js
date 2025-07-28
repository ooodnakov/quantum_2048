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

describe('touch swipe controls', () => {
  let app;
  beforeAll(() => {
    setupDom();
    app = require('../app.js');
  });

  beforeEach(() => {
    app.gameState.gameActive = true;
    app.gameState.board = Array.from({ length: app.BOARD_SIZE }, () => (
      Array.from({ length: app.BOARD_SIZE }, () => ({ id: null, value: 0 }))
    ));
  });

  afterEach(() => {
    jest.clearAllMocks();
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
