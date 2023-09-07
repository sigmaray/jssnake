// Putting constants into window object to avoid eslint warnings

window.constants = {};

window.constants.SETTINGS_STORAGE_KEY = 'JSSnakeSettings';

window.constants.CELL_TYPES = {
  empty: 'empty',
  food: 'food',
  snakeSegment: 'snakeSegment',
  snakeHead: 'snakeHead',
};

window.constants.COLORS = {
  snakeSegment: 'CornflowerBlue',
  snakeHead: 'white',
  segmentBorder: 'SlateBlue',
  food: '#DDA0DD',
  text: 'SlateBlue',
  canvasColor: '#eee',
};

window.constants.DEFAULT_SETTINGS = {
  cellSize: 20,
  cellNum: 5,
  intervalMilliseconds: 150,
  checkIsOut: false,
  checkIsColliding: false,
  disableTimer: false,
  showDebug: false,
};
