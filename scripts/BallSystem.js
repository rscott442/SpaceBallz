//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function BallSystem(gameData, factory) {
	BaseSystem.call(this);
	this.gameData = gameData;
	this.factory = factory;

	this.StartVelocity = new THREE.Vector2(87, 65);
	this.SplitVelocity = new THREE.Vector2(200, 150);
	this.StartNullZone = 40;
	this.SplitNullZone = 100;

	// Balls will spawn outside the safe zone
	this.safeZone = new Rectangle(this.gameData.canvas.width * 0.1, this.gameData.canvas.height * 0.1,
		this.gameData.canvas.width * 0.8, this.gameData.canvas.height * 0.8);

	// Balls are ready
	for (var index = 0; index < this.gameData.players.length; index++) {
		var player = this.gameData.players[index];
		player.balls.state = BallState.READY;
		player.balls.spawnTimer.set(2, 2);
	}
}

BallSystem.prototype = Object.create(BaseSystem.prototype);
BallSystem.prototype.constructor = BallSystem;

var BallState = new Enum(['READY', 'PLAYING']);

BallSystem.prototype.receiveMessage = function (message, parameter) {
	var player = this.gameData.players[this.gameData.activePlayer];

	switch (message) {
		case GameMessage.StartNewGame:
			this.startNewGame();
			break;
		case GameMessage.NextLevel:
			player.balls.state = BallState.READY;
			break;
		case GameMessage.BallCollided:
			this.ballCollided(parameter);
			break;
	}
}

BallSystem.prototype.startNewGame = function () {
	for (var index = 0; index < this.gameData.players.length; index++) {
		var player = this.gameData.players[index];
		player.balls.state = BallState.READY;
		player.balls.spawnTimer.set(0, 2);
	}
}

BallSystem.prototype.ballCollided = function (parameter) {
	var player = this.gameData.players[this.gameData.activePlayer];
	var gameObjects = player.gameObjects;
	var gameObject = parameter;

	var transform = gameObject.components.transform;
	if (transform) {
		this.gameData.game.sendMessage(GameMessage.ExplosionSound);

		// If this ball is large or medium size
		if (transform.scale.x > 0.4) {
			// Need to break it into two balls
			var newScale;
			var pointValue;

			// If it's a large ball
			if (transform.scale.x === 1) {
				// Break it into two medium balls
				newScale = new THREE.Vector2(0.667, 0.667);
				pointValue = 50;
			}

			// If it's a medium ball
			else if (transform.scale.x === 0.667) {
				// Break it into two small balls
				newScale = new THREE.Vector2(0.333, 0.333);
				pointValue = 100;
			}

			// Create the two new balls
			for (var i = 0; i < 2; i++) {
				gameObjects["ball" + this.gameData.nextID++] = this.factory.createBall(
					transform.position,
					newScale,
					this.getNewBallVelocity(this.SplitVelocity.x, this.SplitVelocity.y, this.SplitNullZone),
					this.getNewBallColor(),
					pointValue);
			}
		}
	}
}

BallSystem.prototype.update = function (dt) {
	var player = this.gameData.players[this.gameData.activePlayer];
	var gameObjects = player.gameObjects;

	switch (player.balls.state) {
		case BallState.READY:
			this.ready(dt);
			break;
		case BallState.PLAYING:
			this.playing(dt);
			break;
	}
}

BallSystem.prototype.ready = function (dt) {
	var player = this.gameData.players[this.gameData.activePlayer];
	var gameObjects = player.gameObjects;

	// If alienShip is not attacking
	if (player.alienShip.state != AlienShipState.ATTACKING) {
		// And it's time to spawn
		if (player.balls.spawnTimer.hasElapsed(dt)) {
			// Spawn the number of balls based on player level (cap at 12)
			var numBalls = (2 + ((player.level < 6) ? (player.level * 2) : 10));
			for (var index = 0; index < numBalls; index++) {
				gameObjects["ball" + this.gameData.nextID++] = this.factory.createBall(
					this.getNewBallPosition(),
					new THREE.Vector2(1, 1),
					this.getNewBallVelocity(this.StartVelocity.x, this.StartVelocity.y, this.StartNullZone),
					this.getNewBallColor(),
					20);
			}

			player.balls.state = BallState.PLAYING;
			player.balls.spawnTimer.reset();
		}
	}
}

BallSystem.prototype.playing = function (dt) {
	var player = this.gameData.players[this.gameData.activePlayer];
	var gameObjects = player.gameObjects;

	// Count the number of balls
	var ballCount = 0;
	for(var key in gameObjects) {
		var gameObject = gameObjects[key];
		var tag = gameObject.components.tag;
		if (tag !== undefined && tag.tagValue === Tag.Ball) {
			ballCount++;
		}
	}

	// If no balls remaining, advance player to next level
	if (ballCount === 0) {
		player.level++;
		this.gameData.game.sendMessage(GameMessage.NextLevel);
	}
}

BallSystem.prototype.getNewBallPosition = function () {
	var pointX = 0;
	var pointY = 0;

	// New balls need to start near the edge of the screen
	do {
		pointX = Helpers.randomInt(0, this.gameData.canvas.width);
		pointY = Helpers.randomInt(0, this.gameData.canvas.height);
	} while (this.safeZone.contains(pointX, pointY));

	return new THREE.Vector2(pointX, pointY);
}

BallSystem.prototype.getNewBallVelocity = function (xRange, yRange, nullZone) {
	var velX = 0;
	var velY = 0;

	// New balls need a specific range of slower velocities
	do {
		velX = Helpers.randomFloat(-xRange, xRange);
		velY = Helpers.randomFloat(-yRange, yRange);
	} while (velX > -nullZone && velX < nullZone && velY > -nullZone && velY < nullZone);

	return new THREE.Vector2(velX, velY);
}

BallSystem.prototype.getNewBallColor = function () {
	var color;

	// New balls need colors that are not too dark
	do {
		color = Helpers.randomColor();
	} while (color.r + color.g + color.b < 256);

	return color;
}
