SETTINGS_STORAGE_KEY = "JSSnakeSettings";

const CELL_TYPES = {
  empty: "empty",
  food: "food",
  snakeSegment: "snakeSegment",
  snakeHead: "snakeHead",
};

COLORS = {
  snakeSegment: "CornflowerBlue",
  snakeHead: "white",
  segmentBorder: "SlateBlue",
  food: "#DDA0DD",
  text: "SlateBlue",
  canvasColor: '#eee'
};

const DEFAULT_SETTINGS = {
  canvasSize: 500,
  cellNum: 15,
  intervalMilliseconds: 150,
  checkIsOut: false,
  checkIsColliding: false,
};
