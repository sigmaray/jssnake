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
  emptyCell: 'LightGray',
  // snakeSegment: 'CornflowerBlue',
  snakeSegment: 'ForestGreen',
  // snakeHead: 'white',
  snakeHead: 'Chartreuse',
  // segmentBorder: 'SlateBlue',
  // food: '#DDA0DD',
  food: 'Red',
  text: 'SlateBlue',
  canvasColor: '#eee',
};

window.constants.DEFAULT_SETTINGS = {
  cellSize: 40,
  cellNum: 5,
  intervalMilliseconds: 220,
  checkIsOut: false,
  checkIsColliding: false,
  disableTimer: false,
  showDebug: false,
};
