const { getTileColor, formatNumber, TILE_COLORS } = require('./app.js');

describe('getTileColor', () => {
  test('returns predefined colors without modifying table', () => {
    const copy = {...TILE_COLORS};
    const color = getTileColor(256);
    expect(color).toBe('#f5f5f5');
    expect(TILE_COLORS).toEqual(copy);
  });

  test('generates and caches colors for new values', () => {
    const before = TILE_COLORS[2048];
    expect(before).toBeUndefined();
    const color1 = getTileColor(2048);
    const color2 = getTileColor(2048);
    expect(color1).toEqual(color2);
    expect(color1.startsWith('hsl(')).toBe(true);
    expect(TILE_COLORS[2048]).toBeUndefined();
  });
});

describe('formatNumber', () => {
  test('returns numbers under 10000 unchanged', () => {
    expect(formatNumber(5000)).toBe('5000');
  });

  test('abbreviates thousands and millions', () => {
    expect(formatNumber(10000)).toBe('10k');
    expect(formatNumber(1500000)).toBe('1m');
  });

  test('caps suffix at z for huge numbers', () => {
    const big = 10 ** 96; // results in index 31 -> 'z'
    expect(formatNumber(big)).toBe('1z');
  });
});
