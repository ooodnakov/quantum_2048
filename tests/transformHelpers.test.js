const { BOARD_SIZE, transformBoard, transformCoord } = require('../app.js');

function makeBoard() {
  return Array.from({ length: BOARD_SIZE }, (_, r) => (
    Array.from({ length: BOARD_SIZE }, (_, c) => ({ id: null, value: r * BOARD_SIZE + c + 1 }))
  ));
}

function valuesOnly(board) {
  return board.map(row => row.map(cell => cell.value));
}

describe('transform helpers', () => {
  const directions = ['left', 'right', 'up', 'down'];

  function manualTransform(board, direction, reverse = false) {
    const newBoard = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE));
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const { r: newR, c: newC } = transformCoord(r, c, direction, reverse);
        if (reverse) {
          newBoard[newR][newC] = board[r][c];
        } else {
          newBoard[r][c] = board[newR][newC];
        }
      }
    }
    return newBoard;
  }

  test.each(directions)('forward transform %s matches manual calculation', dir => {
    const board = makeBoard();
    const result = transformBoard(board, dir);
    const manual = manualTransform(board, dir);
    expect(valuesOnly(result)).toEqual(valuesOnly(manual));
  });

});
