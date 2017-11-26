//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function MenuSystem(gameData, factory) {
	BaseSystem.call(this);
	this.gameData = gameData;
	this.factory = factory;
	this.keyBoard = this.gameData.keyBoard;
	this.volumeKeyTimer = new GameTimer(0, 0.05);
	this.menuState;
	this.menuTimer;

	if (this.gameData.highScores.length > 0) {
		this.menuState = MenuState.HIGHSCORES;
		this.menuTimer = new GameTimer(0, 6);
	}
	else {
		this.menuState = MenuState.MENU;
		this.menuTimer = new GameTimer(0, 4);
	}

	this.renderPosition = new THREE.Vector2(this.gameData.canvas.width * 0.5,
		this.gameData.canvas.height * 0.20);
}

MenuSystem.prototype = Object.create(BaseSystem.prototype);
MenuSystem.prototype.constructor = MenuSystem;

var MenuState = new Enum(['HIDE', 'MENU', 'HIGHSCORES']);

MenuSystem.prototype.receiveMessage = function (message, parameter) {
	switch (message) {
		case GameMessage.GameOver:
			this.gameOver();
			break;
	}
}

MenuSystem.prototype.gameOver = function() {
	this.gameData.demoMode = true;
	this.menuState = MenuState.HIGHSCORES;
	this.menuTimer.set(0, 6);
}

MenuSystem.prototype.startNewGame = function (numPlayers) {
	// Clear existing players
	this.gameData.players.length = 0;

	// Create new players
	for (var index = 0; index < numPlayers; index++) {
		var player = new Player(index);
		this.gameData.players.push(player);
	}

	// Start new game
	this.gameData.activePlayer = 0;
	this.menuState = MenuState.HIDE;
	this.gameData.demoMode = false;
	this.gameData.game.sendMessage(GameMessage.StartNewGame);
}

MenuSystem.prototype.update = function (dt) {
	// Check keypresses
	if (this.keyBoard.wasKeyPressed(Keys.One)) {
		this.startNewGame(1);
	}
	else if (this.keyBoard.wasKeyPressed(Keys.Two)) {
		this.startNewGame(2);
	}
	else if (this.keyBoard.wasKeyPressed(Keys.Three)) {
		this.startNewGame(3);
	}
	else if (this.keyBoard.wasKeyPressed(Keys.Four)) {
		this.startNewGame(4);
	}
	else if (this.keyBoard.wasKeyPressed(Keys.G)) {
		this.gameData.game.sendMessage(GameMessage.ToggleGodMode);
	}
	else if (this.keyBoard.wasKeyPressed(Keys.B)) {
		this.gameData.game.sendMessage(GameMessage.ToggleBotMode);
	}
	else if (this.keyBoard.wasKeyPressed(Keys.H)) {
		this.gameData.game.sendMessage(GameMessage.ToggleHitBoxes);
	}
	else if (this.keyBoard.wasKeyPressed(Keys.Tilde)) {
		this.gameData.console.toggle();
	}
	else if (this.keyBoard.isKeyDown(Keys.Shift) && this.gameData.keyBoard.isKeyDown(Keys.X)) {
		// Clear high scores
		if (this.gameData.highScores.length > 0) {
			this.gameData.settings.clearHighScores(this.gameData.highScores);
			if (this.menuState === MenuState.HIGHSCORES) {
				this.menuState = MenuState.MENU;
				this.menuTimer.set(0, 4);
			}
		}
	}
	else if (this.keyBoard.isKeyDown(Keys.Minus) ||
		this.keyBoard.isKeyDown(Keys.NumMinus) ||
		this.keyBoard.isKeyDown(Keys.MinusFF)) {
		// Decrease volume
		if (this.volumeKeyTimer.hasElapsed(dt)) {
			this.volumeKeyTimer.reset();
			this.gameData.game.sendMessage(GameMessage.VolumeDown);
		}
	}
	else if (this.keyBoard.isKeyDown(Keys.Plus) ||
		this.keyBoard.isKeyDown(Keys.NumPlus) ||
		this.keyBoard.isKeyDown(Keys.PlusFF)) {
		// Increase volume
		if (this.volumeKeyTimer.hasElapsed(dt)) {
			this.volumeKeyTimer.reset();
			this.gameData.game.sendMessage(GameMessage.VolumeUp);
		}
	}

	// Toggle menu and high scores
	if (this.menuState != MenuState.HIDE) {
		if (this.gameData.highScores.length > 0) {
			if (this.menuTimer.hasElapsed(dt)) {
				if (this.menuState === MenuState.MENU) {
					this.menuState = MenuState.HIGHSCORES;
					this.menuTimer.set(0, 6);
				}
				else if (this.menuState === MenuState.HIGHSCORES) {
					this.menuState = MenuState.MENU;
					this.menuTimer.set(0, 4);
				}
			}
		}
	}
}

MenuSystem.prototype.render = function () {
	if (this.gameData.paused === false) {
		var context = this.gameData.context;
		var highScores = this.gameData.highScores;
		var yPos = this.renderPosition.y;

		// Display the high scores
		if (this.menuState === MenuState.HIGHSCORES) {
			if (highScores.length > 0) {
				context.font = "20px Comic Sans MS";
				context.fillStyle = "white";

				var strHighScores = "HIGH SCORES";
				context.fillText(strHighScores, this.renderPosition.x - context.measureText(strHighScores).width * 0.5,
					yPos += 32);

				// Measure the first entry only
				var strEntry = highScores[0].score + " " + highScores[0].name;
				var xPos = this.renderPosition.x - context.measureText(strEntry).width * 0.5;

				// Render the high scores
				for (var index = 0; index < highScores.length; index++) {
					context.fillText(highScores[index].score + " " + highScores[index].name,
						xPos, yPos += 32);
				}
			}
		}

		// Or display the menu
		else if (this.menuState === MenuState.MENU) {
			context.font = "20px Comic Sans MS";
			context.fillStyle = "white";

			var strEntry1 = "Start New Game";
			context.fillText(strEntry1, this.renderPosition.x - context.measureText(strEntry1).width * 0.5,
				yPos += 32);

			var strEntry2 = "Press (1-4) Players";
			context.fillText(strEntry2, this.renderPosition.x - context.measureText(strEntry2).width * 0.5,
				yPos += 32);
		}
	}
}
