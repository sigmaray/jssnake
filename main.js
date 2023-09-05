function JSSnake() {
  // Game variables
  this.settings = {}; // game settings that are being loaded from web storage or saved into it
  this.state = {}; // game state
  this.elCanvas = null; // <canvas> element added dynamically from javascript
  this.interval = null; // intervalID set by setInterval

  // Entry point: initialize game variables and start the game
  // Mutates: this.settings, this.state, this.elCanvas, this.interval
  this.init = () => {
    this.settings = window.lib.settingsFromStorage();

    // We can have broken settings in web storage (for example settings from previous version
    // of the game).
    // If settings have wrong values fix them (replace broken values with default values)
    this.settings = window.lib.fixSettings(this.settings, window.constants.DEFAULT_SETTINGS);

    // Load settings from local storage into form inputs
    window.lib.settingsToFormElements(this.settings);

    // Write fixed settings into local storage
    localStorage.setItem(window.constants.SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));

    const snakeSegments = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
    ];

    // Generate food in random cell not occupied by the snake
    const food = window.lib.generateFoodPosition(snakeSegments, this.settings.cellNum);

    // Game state
    this.state = {
      snakeDirection: 'right',
      isPaused: false,
      snakeSegments,
      food,
      switchingDirection: false,
    };

    // Canvas size depends on settings, that's why we append canvas dynamically
    this.elCanvas = window.lib.appendCanvas(this.settings.cellNum, this.settings.cellSize);

    // Bind browser events to handler functions
    this.handleEvents();

    // Trigger game logic every N milliseconds
    if (!this.settings.disableTimer) {
      this.interval = setInterval(this.gameIteration, this.settings.intervalMilliseconds);
    }

    // Draw matrix (2D array) values on <canvas>
    window.lib.renderMatrixToCanvas(
      window.lib.snakeAndFoodToMatrix(
        this.state.snakeSegments,
        this.settings.cellNum,
        this.state.food,
      ),
      this.elCanvas,
      this.settings.cellSize,
    );
  };

  // End the game: reset timer and show a message
  // Mutates: this.interval
  this.endGame = (message = 'Game is over') => {
    window.lib.drawGameIsOver(this.elCanvas, message);
    clearInterval(this.interval);
  };

  // Game logic triggered by the timer every N milliseconds:
  // * Move snake inside the matrix (2d array)
  // * If food was eaten: increase snake length and generate new food
  // * Check snake conditions. If any of them is true end the game
  // * Render matrix (2d array) on <canvas>
  //
  // Moving of snake is done by removing tail and adding head
  //
  // Mutates: this.state, this.interval
  this.gameIteration = () => {
    const ateFood = window.lib.isEating(this.state.snakeSegments, this.state.food);

    // Deep copy last segment of snake
    const head = this.state.snakeSegments.last();
    let newHead = JSON.parse(JSON.stringify(head));

    // Move new snake head by 1 board cell according to snakeDirection
    switch (this.state.snakeDirection) {
      case 'right':
        if (head.x < this.settings.cellNum - 1 || this.settings.checkIsOut) {
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
      case 'left':
        if (head.x > 0 || this.settings.checkIsOut) {
          newHead = {
            x: head.x - 1,
            y: head.y,
          };
        } else {
          newHead = {
            x: this.settings.cellNum - 1,
            y: head.y,
          };
        }

        break;
      case 'up':
        if (head.y > 0 || this.settings.checkIsOut) {
          newHead = {
            x: head.x,
            y: head.y - 1,
          };
        } else {
          newHead = {
            x: head.x,
            y: this.settings.cellNum - 1,
          };
        }

        break;
      case 'down':
        if (head.y < this.settings.cellNum - 1 || this.settings.checkIsOut) {
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

    if (!ateFood) {
      // Snake didn't eat food. Delete snake tail
      this.state.snakeSegments.shift();
    } else {
      // Snake ate food. Generate new food in random board cell not occupied by snake
      this.state.food = window.lib.generateFoodPosition(
        this.state.snakeSegments,
        this.settings.cellNum,
        this.state.food,
      );
      if (!this.state.food) {
        // Could not generate new food. Each board cell is occupied by snake. Finish the game
        this.endGame('You won!');
        return;
      }
    }

    // Insert new head
    this.state.snakeSegments.push(newHead);

    if (
      this.settings.checkIsOut
      && window.lib.isOut(this.state.snakeSegments, this.settings.cellNum)
    ) {
      // Snake went out of game board. End the game
      this.endGame('Snake is out of board. You lost');
      return;
    }

    if (this.settings.checkIsColliding && window.lib.isColliding(this.state.snakeSegments)) {
      // Snake collided with itself. End the game
      this.endGame('Snake collision. You lost');
      return;
    }

    // Draw matrix (2d array) on <canvas>
    window.lib.renderMatrixToCanvas(
      window.lib.snakeAndFoodToMatrix(
        this.state.snakeSegments,
        this.settings.cellNum,
        this.state.food,
      ),
      this.elCanvas,
      this.settings.cellSize,
    );

    if (this.state.switchingDirection) this.state.switchingDirection = false;
  };

  // On pause/unpause button click (or on "P" key press)
  // Mutates: this.state, this.interval
  this.pauseUnpause = () => {
    if (!this.state.isPaused) {
      this.state.isPaused = true;
      clearInterval(this.interval);
    } else {
      this.state.isPaused = false;
      this.interval = setInterval(this.gameIteration, this.settings.intervalMilliseconds);
    }
  };

  // Connect browser events with handle functions
  // Mutates: this.state, this.interval. Writes to local storage
  this.handleEvents = () => {
    // When pause/unpause button is clicked:
    document.getElementById('pauseUnpause').onclick = () => {
      this.pauseUnpause();
    };

    // When reset settings button is clicked:
    // * Write default settings into local storage (override existing settings with default ones)
    // * Restart the game by reloading web page
    document.getElementById('resetSettings').onclick = () => {
      localStorage.setItem(
        window.constants.SETTINGS_STORAGE_KEY,
        JSON.stringify(window.constants.DEFAULT_SETTINGS),
      );
      window.location.reload();
    };

    // When show help button is clicked: show alert with help message
    document.getElementById('showHelp').onclick = () => {
      alert(
        `
  Help
  ----
  Controls:      
  * pause/unpause: p key
  * move: left/right/up/down keys
  * restart: ctrl+r/f5
  
  Settings are being saved in web storage
      `.trim(),
      );
    };

    // When allowed key is pressed:
    // * When P key is pressed: pause/unpause the game
    // * When arrow key is pressed: change direction of the snake
    document.addEventListener('keydown', (e) => {
      const keyCodes = {
        left: 37,
        right: 39,
        up: 38,
        down: 40,
        p: 80,
      };

      const values = Object.keys(keyCodes).map((key) => keyCodes[key]);

      if (values.includes(e.keyCode)) {
        // Prevent default browser events to avoid scrolling of webpage when arrow key was pressed
        e.preventDefault();

        if (e.keyCode === keyCodes.p) {
          this.pauseUnpause();
        }

        // Don't allow user to switch direction untill previous switching is not finished.
        // Switching will be finished in setInterval callback.
        if (!this.state.switchingDirection && !this.state.isPaused) {
          let toSpeedUp = false;

          switch (e.keyCode) {
            case keyCodes.right:
              if (this.state.snakeDirection === 'right') {
                toSpeedUp = true;
              } else if (this.state.snakeDirection !== 'left') {
                this.state.snakeDirection = 'right';
                this.state.switchingDirection = true;
              }
              break;
            case keyCodes.left:
              if (this.state.snakeDirection === 'left') {
                toSpeedUp = true;
              } else if (this.state.snakeDirection !== 'left' && this.state.snakeDirection !== 'right') {
                this.state.snakeDirection = 'left';
                this.state.switchingDirection = true;
              }
              break;
            case keyCodes.up:
              if (this.state.snakeDirection === 'up') {
                toSpeedUp = true;
              } else if (this.state.snakeDirection !== 'up' && this.state.snakeDirection !== 'down') {
                this.state.snakeDirection = 'up';
                this.state.switchingDirection = true;
              }
              break;
            case keyCodes.down:
              if (this.state.snakeDirection === 'down') {
                toSpeedUp = true;
              } else if (this.state.snakeDirection !== 'down' && this.state.snakeDirection !== 'up') {
                this.state.snakeDirection = 'down';
                this.state.switchingDirection = true;
              }
              break;
          }

          // If user pressed key equal to snake direction: move snake faster
          if (toSpeedUp || this.settings.disableTimer) {
            this.gameIteration();
          }
        }
      }
    });

    // When settings form is being submitted:
    // * Validate new settings
    // * If new settings are wrong, show alert and do nothing
    // * If new settings are valid,
    //   write new settings into local storage and reset the game by reloading a page
    document.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      const settings = {};
      const elInputs = document.querySelectorAll('form input:not([type="submit"])');
      elInputs.forEach((elInput) => {
        if (elInput.type === 'text') {
          settings[elInput.id] = elInput.value;
        } else if (elInput.type === 'checkbox') {
          settings[elInput.id] = elInput.checked;
        }
      });
      if (window.lib.validateSettings(settings)) {
        localStorage.setItem(window.constants.SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        window.location.reload();
      } else {
        alert('Wrong values. Try to change values and save one more time');
      }
    };
  };
}

new JSSnake().init();
