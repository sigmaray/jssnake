// Immutable helper functions
// Putting lib into window object to avoid eslint warnings

window.lib = {};

// Check if snake intersects with the food. Return true/false
window.lib.isEating = (snakeSegments, food) => {
  const head = snakeSegments.last();
  return head.x === food.x && head.y === food.y;
};

// Check if snake runs out of game board. Return true/false
window.lib.isOut = (snakeSegments, cellNum) => {
  let out = false;
  snakeSegments.forEach((segment) => {
    if (segment.x < 0 || segment.x > cellNum - 1 || segment.y < 0 || segment.y > cellNum - 1) {
      out = true;
    }
  });
  return out;
};

// Check if snake collides with itsef. Return true/false
window.lib.isColliding = (snakeSegments) => {
  let is = false;
  snakeSegments.forEach((segment, i) => {
    snakeSegments.forEach((segment2, j) => {
      if (i !== j) {
        if (segment.x === segment2.x && segment.y === segment2.y) is = true;
      }
    });
  });
  return is;
};

// Validate settings object. Return true/false
window.lib.validateSettings = (settings) => {
  let valid = true;
  ['cellSize', 'cellNum', 'intervalMilliseconds'].forEach((key) => {
    if (
      !settings[key]
      || Number.isNaN(Number.parseInt(settings[key], 10))
      || Number.parseInt(settings[key], 10) <= 0
    ) {
      valid = false;
    }
  });

  if (Number.parseInt(settings.cellNum, 10) < 2) {
    valid = false;
  }

  return valid;
};

// Draw a message on <canvas>
window.lib.drawGameIsOver = (elCanvas, message = 'Game is over') => {
  const ctx = elCanvas.getContext('2d');
  ctx.clearRect(0, 0, elCanvas.width, elCanvas.height);
  ctx.fillStyle = window.constants.COLORS.text;
  ctx.font = '30px Arial';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(message, elCanvas.width / 2, elCanvas.height / 2);
};

// Draw snake/food cell on canvas
window.lib.drawRectangle = (
  ctx,
  x,
  y,
  w,
  h,
  color = '#ccc',
  borderColor = 'SlateBlue',
  border = null,
  margin = null,
) => {
  let b = border;
  let m = margin;

  if (b === null) b = w * 0.05;
  if (m === null) m = w * 0.1;

  ctx.fillStyle = borderColor;
  ctx.fillRect(x + m, y + m, w - m * 2, h - m * 2);
  ctx.fillStyle = color;
  ctx.fillRect(x + b + m, y + b + m, w - b * 2 - m * 2, h - b * 2 - m * 2);
};

// Load settings from local storage and return them as object
window.lib.settingsFromStorage = () => {
  let settings;
  try {
    settings = JSON.parse(localStorage.getItem(window.constants.SETTINGS_STORAGE_KEY));
  } catch (error) {
    settings = {};
  }
  if (!settings || typeof settings !== 'object') settings = {};
  return settings;
};

// If settings object have wrong values: replace broken values with default values
window.lib.fixSettings = (settings, DEFAULT_SETTINGS) => {
  const fixedSettings = { ...settings };
  Object.keys(DEFAULT_SETTINGS).forEach((key) => {
    if (typeof DEFAULT_SETTINGS[key] === 'boolean') {
      if (typeof settings[key] !== 'boolean') {
        fixedSettings[key] = DEFAULT_SETTINGS[key];
      }
    } else if (typeof DEFAULT_SETTINGS[key] === 'number') {
      fixedSettings[key] = Number.parseInt(settings[key], 10);
      if (!fixedSettings[key] || fixedSettings[key] < 0) {
        fixedSettings[key] = DEFAULT_SETTINGS[key];
      }
    }
  });
  return fixedSettings;
};

// Put snake segments and food into 2d array that models game board
window.lib.snakeAndFoodToMatrix = (snakeSegments, cellNum, food = null) => {
  const matrix = Array.from(Array(cellNum)).map(
    // eslint-disable-next-line
    () => Array.from(Array(cellNum)).map(() => window.constants.CELL_TYPES.empty)
  );
  snakeSegments.forEach((segment, i) => {
    matrix[segment.y][segment.x] = i === snakeSegments.length - 1
      ? window.constants.CELL_TYPES.snakeHead
      : window.constants.CELL_TYPES.snakeSegment;
  });
  if (food) matrix[food.y][food.x] = window.constants.CELL_TYPES.food;
  return matrix;
};

// Generate new food at random board cell not occupied by snake
window.lib.generateFoodPosition = (snakeSegments, cellNum) => {
  const matrix = window.lib.snakeAndFoodToMatrix(snakeSegments, cellNum);
  const availableCells = [];
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === window.constants.CELL_TYPES.empty) {
        availableCells.push({
          x,
          y,
        });
      }
    });
  });
  return availableCells.random();
};

// Modify UI form elements according to settings object values
// Mutates dom elements (<input>) values
window.lib.settingsToFormElements = (settings) => {
  Object.keys(settings).forEach((key) => {
    const el = document.getElementById(key);
    if (el) {
      if (typeof settings[key] === 'boolean') {
        el.checked = settings[key];
      } else if (typeof settings[key] === 'number') {
        el.value = settings[key];
      }
    }
  });
};

// Draw matrix (2d array that models game board) on <canvas>
window.lib.renderMatrixToCanvas = (matrix, elCanvas, cellSize) => {
  const ctx = elCanvas.getContext('2d');
  ctx.clearRect(0, 0, elCanvas.width, elCanvas.height);
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      let color;
      if (value === window.constants.CELL_TYPES.empty) {
        color = window.constants.COLORS.emptyCell;
      }
      else if (value === window.constants.CELL_TYPES.snakeSegment) {
        color = window.constants.COLORS.snakeSegment;
      } else if (value === window.constants.CELL_TYPES.snakeHead) {
        color = window.constants.COLORS.snakeHead;
      } else if (value === window.constants.CELL_TYPES.food) {
        color = window.constants.COLORS.food;
      }

      window.lib.drawRectangle(
        ctx,
        x * cellSize,
        y * cellSize,
        cellSize,
        cellSize,
        color,
        window.constants.COLORS.segmentBorder,
        0,
        3,
      );
    });
  });
};

// Dynamicall add <canvas> element
window.lib.appendCanvas = (cellNum, cellSize) => {
  const elCanvas = document.createElement('canvas');
  elCanvas.setAttribute(
    'style',
    `
      background-color: ${window.constants.COLORS.canvasColor};
      margin-top: 2rem;
    `,
  );

  elCanvas.setAttribute('width', cellSize * cellNum);
  elCanvas.setAttribute('height', cellSize * cellNum);
  document.getElementById('canvasContainer').appendChild(elCanvas);
  return elCanvas;
};
