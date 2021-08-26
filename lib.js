// Helper functions that are not coupled with game state

const isEating = (snakeSegments, food) => {
  const head = snakeSegments.last();
  return head.x == food.x && head.y == food.y;
};

const isOut = (snakeSegments, cellNum) => {
  let is = false;
  snakeSegments.forEach((segment) => {
    if (
      segment.x < 0 ||
      segment.x > cellNum - 1 ||
      segment.y < 0 ||
      segment.y > cellNum - 1
    ) {
      is = true;
    }
  });
  return is;
};

const isColliding = (snakeSegments) => {
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

const validateSettings = (settings) => {
  let valid = true;
  ["canvasSize", "cellNum", "intervalMilliseconds"].forEach((key) => {
    if (!settings[key] || Number.parseInt(settings[key]) <= 0) {
      valid = false;
    }
  });

  if (
    Number.parseInt(settings["canvasSize"]) < Number.parseInt(settings["cells"])
  )
    valid = false;

  if (Number.parseInt(settings["canvasSize"]) < 10) {
    valid = false;
  }

  if (Number.parseInt(settings["cellNum"]) < 2) {
    valid = false;
  }

  return valid;
};

const drawGameIsOver = (message = "Game is over") => {
  const ctx = elCanvas.getContext("2d");
  ctx.clearRect(0, 0, elCanvas.width, elCanvas.height);
  ctx.fillStyle = COLORS.text;
  ctx.font = "30px Arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(message, elCanvas.width / 2, elCanvas.height / 2);
};

const drawRectangle = (
  ctx,
  x,
  y,
  w,
  h,
  color = "#ccc",
  borderColor = "SlateBlue",
  thickness = 2,
  margin = 5
) => {
  ctx.fillStyle = borderColor;
  ctx.fillRect(x + margin, y + margin, w - margin * 2, h - margin * 2);
  ctx.fillStyle = color;
  ctx.fillRect(
    x + thickness + margin,
    y + thickness + margin,
    w - thickness * 2 - margin * 2,
    h - thickness * 2 - margin * 2
  );
};

const settingsFromStorage = () => {
  let settings;
  try {
    settings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY));
  } catch {}
  if (!settings || typeof settings !== "object") settings = {};
  return settings;
};

const fixSettings = (settings, DEFAULT_SETTINGS) => {
  Object.keys(DEFAULT_SETTINGS).forEach((key) => {
    if (typeof DEFAULT_SETTINGS[key] == "boolean") {
      if (typeof settings[key] !== "boolean") {
        settings[key] = DEFAULT_SETTINGS[key];
      }
    } else if (typeof DEFAULT_SETTINGS[key] == "number") {
      settings[key] = Number.parseInt(settings[key]);
      if (!settings[key] || settings[key] < 0) {
        settings[key] = DEFAULT_SETTINGS[key];
      }
    }
  });
  return settings;
};

const snakeAndFoodToMatrix = (snakeSegments, cellNum, food = null) => {
  const matrix = Array.from(Array(cellNum)).map((_) =>
    Array.from(Array(cellNum)).map((_) => CELL_TYPES.empty)
  );
  snakeSegments.forEach((segment, i) => {
    matrix[segment.y][segment.x] =
      i == snakeSegments.length - 1
        ? CELL_TYPES.snakeHead
        : CELL_TYPES.snakeSegment;
  });
  if (food) matrix[food.y][food.x] = CELL_TYPES.food;
  return matrix;
};

const generateFoodPosition = (snakeSegments, cellNum, food = null) => {
  const matrix = snakeAndFoodToMatrix(snakeSegments, cellNum);
  const availableCells = [];
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === CELL_TYPES.empty) {
        availableCells.push({
          x,
          y,
        });
      }
    });
  });
  return availableCells.random();
};

const settingsToElements = (settings) => {
  Object.keys(settings).forEach((key) => {
    const el = document.getElementById(key);
    if (el) {
      if (typeof settings[key] == "boolean") {
        el.checked = settings[key];
      } else if (typeof settings[key] == "number") {
        el.value = settings[key];
      }
    }
  });
};

const renderMatrixToCanvas = (
  matrix,
  elCanvas,
  segmentWidth,
  segmentHeight
) => {
  const ctx = elCanvas.getContext("2d");
  ctx.clearRect(0, 0, elCanvas.width, elCanvas.height);
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== CELL_TYPES.empty) {
        let color;
        if (value === CELL_TYPES.snakeSegment) {
          color = COLORS.snakeSegment;
        } else if (value === CELL_TYPES.snakeHead) {
          color = COLORS.snakeHead;
        } else if (value === CELL_TYPES.food) {
          color = COLORS.food;
        }

        drawRectangle(
          ctx,
          x * segmentWidth,
          y * segmentHeight,
          segmentHeight,
          segmentWidth,
          color,
          COLORS.segmentBorder
        );
      }
    });
  });
};

const appendCanvas = (canvasSize) => {
  const elCanvas = document.createElement("canvas");
  elCanvas.setAttribute(
    "style",
    `
      background-color: ${COLORS.canvasColor};    
      margin-top: 2rem;
    `
  );

  elCanvas.setAttribute("width", canvasSize);
  elCanvas.setAttribute("height", canvasSize);
  document.body.appendChild(elCanvas);
  return elCanvas;
};
