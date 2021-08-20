// Entry point of the game.
// Here we have state variables, functions coupled with the state,
// and game loop. You can find helper functions in snake-lib.js

const endGame = (message = "Game is over") => {
  drawGameIsOver(message);
  clearInterval(interval);
};

const gameCycle = () => {
  let ate = false;

  if (isEating(snakeSegments, food)) {
    ate = true;
  }

  const head = snakeSegments.last();
  let newHead = JSON.parse(JSON.stringify(head));
  switch (snakeDirection) {
    case "right":
      if (head.x < settings.cell_num - 1 || settings.check_is_out) {
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
      if (head.x > 0 || settings.check_is_out) {
        newHead = {
          x: head.x - 1,
          y: head.y,
        };
      } else {
        newHead = {
          x: settings.cell_num - 1,
          y: head.y,
        };
      }

      break;
    case "up":
      if (head.y > 0 || settings.check_is_out) {
        newHead = {
          x: head.x,
          y: head.y - 1,
        };
      } else {
        newHead = {
          x: head.x,
          y: settings.cell_num - 1,
        };
      }

      break;
    case "down":
      if (head.y < settings.cell_num - 1 || settings.check_is_out) {
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

  if (!ate) snakeSegments.shift();
  else {
    food = generateFoodPosition(snakeSegments, food);
    if (!food) {
      endGame("You won!");
      return;
    }
  }

  snakeSegments.push(newHead);

  if (settings.check_is_out && isOut(snakeSegments, settings.cell_num)) {
    endGame("Snake is out of board. You lost");
    return;
  }

  if (settings.check_is_colliding && isColliding(snakeSegments)) {
    endGame("Snake collision. You lost");
    return;
  }

  renderMatrixToCanvas(
    snakeAndFoodToMatrix(snakeSegments, food),
    elCanvas,
    segmentWidth,
    segmentHeight
  );
};

const unpauseGame = () => {
  isPaused = false;
  interval = setInterval(gameCycle, settings.interval_milliseconds);
};

const pauseUnpause = () => {
  if (!isPaused) {
    isPaused = true;
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
    localStorage.setItem("settings", JSON.stringify(defaultSettings));
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

    const values = Object.keys(keyCodes).map(e => keyCodes[e])

    if (values.includes(e.keyCode)) {
      e.preventDefault();

      switch (e.keyCode) {
        case keyCodes.right:
          if (snakeDirection != "right" && snakeDirection != "left")
            snakeDirection = "right";
          break;
        case keyCodes.left:
          if (snakeDirection != "left" && snakeDirection != "right")
            snakeDirection = "left";
          break;
        case keyCodes.up:
          if (snakeDirection != "up" && snakeDirection != "down")
            snakeDirection = "up";
          break;
        case keyCodes.down:
          if (snakeDirection != "down" && snakeDirection != "up")
            snakeDirection = "down";
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
      localStorage.setItem("settings", JSON.stringify(settings));
      location.reload();
    } else {
      alert("Wrong values. Try to change values and save one more time");
    }
  };
};

const defaultSettings = {
  canvas_size: 500,
  cell_num: 15,
  interval_milliseconds: 150,
  check_is_out: false,
  check_is_colliding: false,
};

let snakeSegments = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 3, y: 0 },
  { x: 4, y: 0 },
];

let snakeDirection = "right";

let interval;

let isPaused = true;

let settings = settingsFromStorage();
settings = fixSettings(settings, defaultSettings);

const segmentWidth = settings.canvas_size / settings.cell_num;
const segmentHeight = settings.canvas_size / settings.cell_num;

settingsToElements(settings);

localStorage.setItem("settings", JSON.stringify(settings));

let food = generateFoodPosition(snakeSegments);

const elCanvas = appendCanvas(settings.canvas_size);

handleEvents();

unpauseGame();

renderMatrixToCanvas(
  snakeAndFoodToMatrix(snakeSegments, food),
  elCanvas,
  segmentWidth,
  segmentHeight
);
