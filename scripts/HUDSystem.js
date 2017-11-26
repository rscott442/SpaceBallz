//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function HUDSystem(gameData, factory) {
	BaseSystem.call(this);
	this.gameData = gameData;
	this.factory = factory;

	var width = this.gameData.canvas.width;
	var height = this.gameData.canvas.height;

	this.scorePositions = [
		new THREE.Vector2(width * 0.19, 8),
		new THREE.Vector2(width * 0.77, 8),
		new THREE.Vector2(width * 0.19, height - 32),
		new THREE.Vector2(width * 0.77, height - 32)
	];

	this.tokenPositions = [
		new THREE.Vector2(width * 0.165, height * 0.073),
		new THREE.Vector2(width * 0.745, height * 0.073),
		new THREE.Vector2(width * 0.165, height * 0.93),
		new THREE.Vector2(width * 0.745, height * 0.93)
	];

	this.highScorePosition = new THREE.Vector2(width * 0.5, 8),
	this.pausedPosition = new THREE.Vector2(width * 0.5, height * 0.20),
	this.readyPosition = new THREE.Vector2(width * 0.5, height * 0.20);
	this.gameOverPosition = new THREE.Vector2(width * 0.5, height * 0.20);
	this.volumePosition = new THREE.Vector2(width * 0.5, height * 0.85);

	this.token = this.factory.createToken(
		new THREE.Vector2(0, 0),
		-90 * Math.PI / 180,
		new THREE.Vector2(0.50, 0.50));

	this.tokenWidth = 32;

	this.showVolumeTimer = new GameTimer(0, 3);
}

HUDSystem.prototype = Object.create(BaseSystem.prototype);
HUDSystem.prototype.constructor = HUDSystem;

HUDSystem.prototype.update = function (dt) {
	this.showVolumeTimer.update(dt);
}

HUDSystem.prototype.render = function () {
	this.renderPaused();
	this.renderReady();
	this.renderGameOver();
	this.renderScores();
	this.renderTokens();
	this.renderHighScore();
	this.renderVolume();
}

HUDSystem.prototype.receiveMessage = function (message) {
	switch (message) {
		case GameMessage.VolumeDown:
			this.volumeDown();
			break;
		case GameMessage.VolumeUp:
			this.volumeUp();
			break;
	}
}

HUDSystem.prototype.renderPaused = function () {
	if (this.gameData.paused === true) {
		var context = this.gameData.context;
		context.font = "20px Comic Sans MS";
		context.fillStyle = "white";
		var strPaused = "PAUSED";
		context.fillText(strPaused, this.pausedPosition.x - context.measureText(strPaused).width * 0.5,
			this.pausedPosition.y);

		// Measure center with an average sized string
		var strEntry = "Right Arrow = Steer Right";
		var xPos = this.pausedPosition.x - context.measureText(strEntry).width * 0.5;
		var yPos = this.pausedPosition.y;

		context.fillText("Number of Players : Press (1-4)", xPos, yPos += 32);
		context.fillText("ESC/Pause = Toggle Pause", xPos, yPos += 32);
		context.fillText("-/+ = Volume Down/Up", xPos, yPos += 32);
		context.fillText("Up Arrow = Thrust", xPos, yPos += 32);
		context.fillText("Left Arrow = Steer Left", xPos, yPos += 32);
		context.fillText("Right Arrow = Steer Right", xPos, yPos += 32);
		context.fillText("LeftCtrl/RightCtrl = Fire Bullet", xPos, yPos += 32);
		context.fillText("Enter/Space = HyperSpace", xPos, yPos += 32);
		context.fillText("Tilde = Toggle Console", xPos, yPos += 32);
		context.fillText("Shift-X = Clear High Scores", xPos, yPos += 32);
		context.fillText("H = Toggle Hitboxes", xPos, yPos += 32);
		context.fillText("B = Toggle Bot Mode", xPos, yPos += 32);
		context.fillText("G = Toggle God Mode", xPos, yPos += 32);
	}
}

HUDSystem.prototype.renderReady = function () {
	if (this.gameData.paused === false) {
		// Render the ready message
		if (this.gameData.players[this.gameData.activePlayer].spaceShip.state === SpaceShipState.READY) {
			this.gameData.context.font = "20px Comic Sans MS";
			this.gameData.context.fillStyle = "white";
			var strEntry = "READY";
			this.gameData.context.fillText(strEntry, this.readyPosition.x - this.gameData.context.measureText(strEntry).width * 0.5,
				this.readyPosition.y);
			var strPlayer = "PLAYER " + (this.gameData.activePlayer + 1).toString();
			this.gameData.context.fillText(strPlayer, this.readyPosition.x - this.gameData.context.measureText(strPlayer).width * 0.5,
				this.readyPosition.y + 32);
		}
	}
}

HUDSystem.prototype.renderGameOver = function () {
	if (this.gameData.paused === false) {
		// Render the game over message
		if (this.gameData.players[this.gameData.activePlayer].spaceShip.state === SpaceShipState.EXPLODING &&
		this.gameData.players[this.gameData.activePlayer].lives === 0) {
			this.gameData.context.font = "20px Comic Sans MS";
			this.gameData.context.fillStyle = "white";
			var strEntry = "GAME OVER";
			this.gameData.context.fillText(strEntry, this.gameOverPosition.x - this.gameData.context.measureText(strEntry).width * 0.5,
				this.gameOverPosition.y);
			var strPlayer = "PLAYER " + (this.gameData.activePlayer + 1).toString();
			this.gameData.context.fillText(strPlayer, this.gameOverPosition.x - this.gameData.context.measureText(strPlayer).width * 0.5,
				this.gameOverPosition.y + 32);
		}
	}
}

HUDSystem.prototype.renderScores = function () {
	// Render all player scores
	for (var index = 0; index < this.gameData.players.length; index++) {
		var player = this.gameData.players[index];
		this.gameData.context.font = "20px Comic Sans MS";
		if (index === this.gameData.activePlayer && this.gameData.demoMode == false) {
			this.gameData.context.fillStyle = "yellow";
		}
		else {
			this.gameData.context.fillStyle = "white";
		}
		this.gameData.context.fillText(player.score, this.scorePositions[index].x, this.scorePositions[index].y);
	}
}

HUDSystem.prototype.renderTokens = function () {
	// Render all player tokens
	var transform = this.token.components.transform;
	var render = this.token.components.render;
	if (transform && render) {
		for (var playerindex = 0; playerindex < this.gameData.players.length; playerindex++) {
			var player = this.gameData.players[playerindex];
			var tokenPosition = this.tokenPositions[playerindex].clone();
			for (var tokenindex = 0; tokenindex < player.lives; tokenindex++) {
				this.gameData.context.save();
				this.gameData.context.translate(tokenPosition.x, tokenPosition.y);//4
				this.gameData.context.rotate(transform.rotation);//3
				this.gameData.context.scale(transform.scale.x, transform.scale.y);//2
				this.gameData.context.translate(transform.origin.x, transform.origin.y);//1
				var frame = render.sprite.frames[render.sprite.currentFrame];
				this.gameData.context.drawImage(render.sprite.spriteCanvas, frame.x, frame.y, frame.width, frame.height,
					0, 0, frame.width, frame.height);
				this.gameData.context.restore();
				tokenPosition.x += this.tokenWidth;
			}
		}
	}
}

HUDSystem.prototype.renderHighScore = function () {
	// Render high score at the top of the screen
	if (this.gameData.highScores.length > 0) {
		this.gameData.context.fillStyle = "cyan";
		var strEntry = this.gameData.highScores[0].score.toString();
		this.gameData.context.fillText(strEntry, this.highScorePosition.x - this.gameData.context.measureText(strEntry).width * 0.5,
			this.highScorePosition.y);
	}
}

HUDSystem.prototype.renderVolume = function () {
	// Render the volume graphic
	if (this.gameData.soundEnabled === true) {
		// If the showVolume timer has not expired
		if (this.showVolumeTimer.hasExpired() === false) {
			// Then show the volume graphic
			this.gameData.context.fillStyle = "white";
			var strEntry = "-/+ = VOLUME : " + (100 * this.gameData.volume).toFixed(0).toString();
			this.gameData.context.fillText(strEntry, this.volumePosition.x - this.gameData.context.measureText(strEntry).width * 0.5,
				this.volumePosition.y);
		}
	}
}

HUDSystem.prototype.volumeUp = function () {
	this.showVolumeTimer.reset();
}

HUDSystem.prototype.volumeDown = function () {
	this.showVolumeTimer.reset();
}
