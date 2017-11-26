//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function BotSystem(gameData) {
	BaseSystem.call(this);
	this.gameData = gameData;
	this.keyBoard = this.gameData.keyBoard;
	this.actionTimer = new GameTimer(0, 0);
	this.newGameTimer = new GameTimer(0, 8);
}

BotSystem.prototype = Object.create(BaseSystem.prototype);
BotSystem.prototype.constructor = BotSystem;

BotSystem.prototype.receiveMessage = function (message, parameter) {
	switch (message) {
		case GameMessage.ToggleBotMode:
			this.toggleBotMode();
			break;
	}
}

BotSystem.prototype.toggleBotMode = function () {
	this.gameData.botMode = !this.gameData.botMode;

	if (this.gameData.botMode === true) {
		this.actionTimer.reset();

		if (this.gameData.demoMode === true) {
			this.newGameTimer.forceExpire();
		}
		else {
			this.newGameTimer.reset();
		}
	}
	else {
		this.keyBoard.clear();
	}
}

BotSystem.prototype.steerShip = function (dt) {
	if (this.actionTimer.hasElapsed(dt)) {
		this.actionTimer.set(0, Helpers.randomFloat(0.05, 0.3));
		if (Helpers.randomInt(0, 100) > 79) {
			this.keyBoard.insertKey(Keys.Up, true);
		}

		if (Helpers.randomInt(0, 100) > 19) {
			this.keyBoard.insertKey(Keys.Up, false);
		}

		if (Helpers.randomInt(0, 100) > 49) {
			this.keyBoard.insertKey(Keys.Left, true);
		}

		if (Helpers.randomInt(0, 100) > 49) {
			this.keyBoard.insertKey(Keys.Left, false);
		}

		if (Helpers.randomInt(0, 100) > 49) {
			this.keyBoard.insertKey(Keys.Right, true);
		}

		if (Helpers.randomInt(0, 100) > 49) {
			this.keyBoard.insertKey(Keys.Right, false);
		}

		if (Helpers.randomInt(0, 100) > 29) {
			this.keyBoard.insertKey(Keys.Ctrl, true);
		}

		if (Helpers.randomInt(0, 100) > 69) {
			this.keyBoard.insertKey(Keys.Ctrl, false);
		}

		if (Helpers.randomInt(0, 100) > 94) {
			this.keyBoard.insertKey(Keys.Enter, true);
		}

		if (Helpers.randomInt(0, 100) > 4) {
			this.keyBoard.insertKey(Keys.Enter, false);
		}
	}
}

BotSystem.prototype.update = function (dt) {
	if (this.gameData.botMode === true) {
		if (this.gameData.demoMode === true) {
			if (this.newGameTimer.hasElapsed(dt) === true) {
				this.newGameTimer.reset();
				this.keyBoard.clear();

				// Time to choose a new game
				switch (Helpers.randomInt(1, 5)) {
					case 1:
						this.keyBoard.insertKey(Keys.One, true);
						break;
					case 2:
						this.keyBoard.insertKey(Keys.Two, true);
						break;
					case 3:
						this.keyBoard.insertKey(Keys.Three, true);
						break;
					case 4:
						this.keyBoard.insertKey(Keys.Four, true);
						break;
				}
			}
		}

		else {
			this.steerShip(dt);
		}
	}
}
