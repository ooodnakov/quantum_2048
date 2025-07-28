const sum = require('../src/sum');

describe('sum', () => {
  test('adds two positive numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });

  test('adds negative numbers', () => {
    expect(sum(-1, -1)).toBe(-2);
  });

  test('adds with zero', () => {
    expect(sum(0, 5)).toBe(5);
  });
});
