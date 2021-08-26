// Entry point of the game.
// Here we have state variables, functions coupled with the state,
// and game loop. You can find helper functions in snake-lib.js

const endGame = (message = "Game is over") => {
  drawGameIsOver(message);
  clearInterval(interval);
};

const gameCycle = () => {
  let ateFood = false;

  if (isEating(state.snakeSegments, state.food)) {
    ateFood = true;
  }

  const head = state.snakeSegments.last();
  let newHead = JSON.parse(JSON.stringify(head));
  switch (state.snakeDirection) {
    case "right":
      if (head.x < settings.cellNum - 1 || settings.checkIsOut) {
        newHead = {
          x: head.x + 1,
          y: head.y,
        };
      } else {
        newHead = {
          x: 0,
          y: head.y,
        };
      }

      break;
    case "left":
      if (head.x > 0 || settings.checkIsOut) {
        newHead = {
          x: head.x - 1,
          y: head.y,
        };
      } else {
        newHead = {
          x: settings.cellNum - 1,
          y: head.y,
        };
      }

      break;
    case "up":
      if (head.y > 0 || settings.checkIsOut) {
        newHead = {
          x: head.x,
          y: head.y - 1,
        };
      } else {
        newHead = {
          x: head.x,
          y: settings.cellNum - 1,
        };
      }

      break;
    case "down":
      if (head.y < settings.cellNum - 1 || settings.checkIsOut) {
        newHead = {
          x: head.x,
          y: head.y + 1,
        };
      } else {
        newHead = {
          x: head.x,
          y: 0,
        };
      }

      break;
  }

  if (!ateFood) state.snakeSegments.shift();
  else {
    state.food = generateFoodPosition(
      state.snakeSegments,
      settings.cellNum,
      state.food
    );
    if (!state.food) {
      endGame("You won!");
      return;
    }
  }

  state.snakeSegments.push(newHead);

  if (settings.checkIsOut && isOut(state.snakeSegments, settings.cellNum)) {
    endGame("Snake is out of board. You lost");
    return;
  }

  if (settings.checkIsColliding && isColliding(state.snakeSegments)) {
    endGame("Snake collision. You lost");
    return;
  }

  renderMatrixToCanvas(
    snakeAndFoodToMatrix(state.snakeSegments, settings.cellNum, state.food),
    elCanvas,
    segmentWidth,
    segmentHeight
  );

  state.switchingDirection = false;
};

const unpauseGame = () => {
  state.isPaused = false;
  interval = setInterval(gameCycle, settings.intervalMilliseconds);
};

const pauseUnpause = () => {
  if (!state.isPaused) {
    state.isPaused = true;
    clearInterval(interval);
  } else {
    unpauseGame();
  }
};

const handleEvents = () => {
  document.getElementById("pauseUnpause").onclick = (e) => {
    e.preventDefault();
    pauseUnpause();
  };

  document.getElementById("resetSettings").onclick = (e) => {
    e.preventDefault();
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
    location.reload();
  };

  document.addEventListener("keydown", (e) => {
    const keyCodes = {
      left: 37,
      right: 39,
      up: 38,
      down: 40,
      space: 32,
      p: 80,
    };

    const values = Object.keys(keyCodes).map((e) => keyCodes[e]);

    if (values.includes(e.keyCode)) {
      e.preventDefault();

      switch (e.keyCode) {
        case keyCodes.right:
          if (
            !state.switchingDirection &&
            state.snakeDirection != "right" &&
            state.snakeDirection != "left"
          )
            state.snakeDirection = "right";
          state.switchingDirection = true;
          break;
        case keyCodes.left:
          if (
            !state.switchingDirection &&
            state.snakeDirection != "left" &&
            state.snakeDirection != "right"
          )
            state.snakeDirection = "left";
          state.switchingDirection = true;
          break;
        case keyCodes.up:
          if (
            !state.switchingDirection &&
            state.snakeDirection != "up" &&
            state.snakeDirection != "down"
          )
            state.snakeDirection = "up";
          state.switchingDirection = true;
          break;
        case keyCodes.down:
          if (
            !state.switchingDirection &&
            state.snakeDirection != "down" &&
            state.snakeDirection != "up"
          )
            state.snakeDirection = "down";
          state.switchingDirection = true;
          break;
        case keyCodes.p:
          pauseUnpause();
          break;
      }
    }
  });

  document.querySelector("form").onsubmit = (e) => {
    e.preventDefault();
    let settings = {};
    const elInputs = document.querySelectorAll(
      'form input:not([type="submit"])'
    );
    elInputs.forEach((elInput) => {
      if (elInput.type === "text") {
        settings[elInput.id] = elInput.value;
      } else if (elInput.type === "checkbox") {
        settings[elInput.id] = elInput.checked;
      }
    });
    if (validateSettings(settings)) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      location.reload();
    } else {
      alert("Wrong values. Try to change values and save one more time");
    }
  };
};

const defaultSettings = {
  canvasSize: 500,
  cellNum: 15,
  intervalMilliseconds: 150,
  checkIsOut: false,
  checkIsColliding: false,
};

let interval;

let settings = settingsFromStorage();
settings = fixSettings(settings, defaultSettings);

const segmentWidth = settings.canvasSize / settings.cellNum;
const segmentHeight = settings.canvasSize / settings.cellNum;

settingsToElements(settings);

localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

const snakeSegments = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 3, y: 0 },
  { x: 4, y: 0 },
];

const food = generateFoodPosition(snakeSegments, settings.cellNum);

let state = {
  snakeDirection: "right",
  isPaused: true,
  snakeSegments,
  food,
  switchingDirection: false,
};

// Canvas size depends on settings, that's why we append canvas dynamically
const elCanvas = appendCanvas(settings.canvasSize);

handleEvents();

unpauseGame();

renderMatrixToCanvas(
  snakeAndFoodToMatrix(state.snakeSegments, settings.cellNum, state.food),
  elCanvas,
  segmentWidth,
  segmentHeight
);
