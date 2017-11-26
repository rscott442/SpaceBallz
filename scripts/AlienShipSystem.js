//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function AlienShipSystem(gameData, factory) {
	BaseSystem.call(this);
	this.gameData = gameData;
	this.factory = factory;

	this.speedX = 93;
	this.speedY = 70;
	this.spawnSmallPct = 0;
	this.spawnSmallPctDemo = 50;
	this.spawnCounterDemo = 7;
	this.spawnCounterMin = 4;
	this.spawnCounterMax = 24;
	this.spawnCounterVelocity = 0.38;
	this.spawnCounterAccel = 0.53;
	this.directionTimerMax = 2;
	this.explodeTimerMax = 2;
	this.bulletTimerMax = 1;
	this.bulletSpeed = 288;
	this.bulletLifetime = 2.2;

	this.initialize();
	this.initializeDemo();
}

AlienShipSystem.prototype = Object.create(BaseSystem.prototype);
AlienShipSystem.prototype.constructor = AlienShipSystem;

var AlienShipState = new Enum(['IDLE', 'READY', 'SPAWNING', 'ATTACKING', 'EXPLODING']);
var AlienSize = new Enum(['LARGE', 'SMALL']);

AlienShipSystem.prototype.initialize = function () {
	for (var index = 0; index < this.gameData.players.length; index++) {
		var player = this.gameData.players[index];

		player.alienShip.speedX = this.speedX;
		player.alienShip.speedY = this.speedY;
		player.alienShip.spawnSmallPct = this.spawnSmallPct;
		player.alienShip.size = AlienSize.LARGE;
		player.alienShip.spawnCounter = this.spawnCounterMax;
		player.alienShip.spawnCounterVelocity = this.spawnCounterVelocity;
		player.alienShip.spawnCounterAccel = this.spawnCounterAccel;
		player.alienShip.spawnTimer.set(0.0, player.alienShip.spawnCounter);
		player.alienShip.directionTimer.set(0.0, this.directionTimerMax);
		player.alienShip.explodeTimer.set(0.0, this.explodeTimerMax);
		player.alienShip.bulletTimer.set(0.0, this.bulletTimerMax);
		player.alienShip.state = AlienShipState.READY;
	}
}

AlienShipSystem.prototype.initializeDemo = function () {
	var player = this.gameData.players[this.gameData.activePlayer];
	player.alienShip.spawnSmallPct = this.spawnSmallPctDemo;
	player.alienShip.spawnCounter = this.spawnCounterDemo;
	player.alienShip.spawnTimer.set(0.0, player.alienShip.spawnCounter);
}

AlienShipSystem.prototype.receiveMessage = function (message, parameter) {
	switch (message)
	{
		case GameMessage.StartNewGame:
			this.startNewGame();
			break;

		case GameMessage.NextLevel:
			this.nextLevel();
			break;

		case GameMessage.NextPlayer:
			this.nextPlayer();
			break;

		case GameMessage.AlienShipCollided:
			this.alienShipCollided();
			break;

		case GameMessage.AlienShipHitBoundary:
			this.alienShipHitBoundary();
			break;

		case GameMessage.GameOver:
			this.gameOver();
			break;
	}
}

AlienShipSystem.prototype.startNewGame = function () {
	this.gameData.game.sendMessage(GameMessage.AlienLargeSoundStop);
	this.gameData.game.sendMessage(GameMessage.AlienSmallSoundStop);
	this.initialize();
}

AlienShipSystem.prototype.nextLevel = function () {
	var player = this.gameData.players[this.gameData.activePlayer];

	if (this.gameData.demoMode === true) {
		player.alienShip.spawnCounter = this.spawnCounterDemo;
		player.alienShip.spawnSmallPct = this.spawnSmallPctDemo;
	}

	else {
		player.alienShip.spawnTimer.reset();
		player.alienShip.spawnCounter = this.spawnCounterMax;
	}

	player.alienShip.spawnTimer.set(0, player.alienShip.spawnCounter);

	player.alienShip.directionTimer.reset();
}

AlienShipSystem.prototype.nextPlayer = function () {
	var player = this.gameData.players[this.gameData.activePlayer];

	if (player.alienShip.state === AlienShipState.ATTACKING) {
		if (player.alienShip.size === AlienSize.LARGE)
			this.gameData.game.sendMessage(GameMessage.AlienLargeSoundPlay);
		else
			this.gameData.game.sendMessage(GameMessage.AlienSmallSoundPlay);
	}
}

AlienShipSystem.prototype.alienShipCollided = function () {
	var player = this.gameData.players[this.gameData.activePlayer];

	if (player.alienShip.size === AlienSize.LARGE)
		this.gameData.game.sendMessage(GameMessage.AlienLargeSoundStop);
	else
		this.gameData.game.sendMessage(GameMessage.AlienSmallSoundStop);

	this.gameData.game.sendMessage(GameMessage.ExplosionSound);

	player.alienShip.state = AlienShipState.EXPLODING;
}

AlienShipSystem.prototype.alienShipHitBoundary = function () {
	var player = this.gameData.players[this.gameData.activePlayer];
	var gameObjects = player.gameObjects;

	if (player.alienShip.size === AlienSize.LARGE)
		this.gameData.game.sendMessage(GameMessage.AlienLargeSoundStop);
	else
		this.gameData.game.sendMessage(GameMessage.AlienSmallSoundStop);

	var gameObject = gameObjects["alienship"];
	if (gameObject) {
		var collision = gameObject.components.collision;
		if (collision) {
			collision.outofBounds = true;
		}
	}

	player.alienShip.state = AlienShipState.READY;
}

AlienShipSystem.prototype.gameOver = function () {
	this.initializeDemo();
}

AlienShipSystem.prototype.update = function (dt) {
	var player = this.gameData.players[this.gameData.activePlayer];

	switch (player.alienShip.state)
	{
		case AlienShipState.IDLE:
			this.idle(dt);
			break;

		case AlienShipState.READY:
			this.ready(dt);
			break;

		case AlienShipState.SPAWNING:
			this.spawning(dt);
			break;

		case AlienShipState.ATTACKING:
			this.attacking(dt);
			break;

		case AlienShipState.EXPLODING:
			this.exploding(dt);
			break;
	}
}

AlienShipSystem.prototype.idle = function (dt) {

}

AlienShipSystem.prototype.ready = function (dt) {
	var player = this.gameData.players[this.gameData.activePlayer];

	if (player.alienShip.spawnTimer.hasElapsed(dt))
	{
		player.alienShip.state = AlienShipState.SPAWNING;
		player.alienShip.spawnTimer.reset();
	}
}

AlienShipSystem.prototype.spawning = function (dt) {
	var player = this.gameData.players[this.gameData.activePlayer];
	var gameObjects = player.gameObjects;

	var viewWidth = this.gameData.canvas.width;
	var viewHeight = this.gameData.canvas.height;

	var position;
	var scale;
	var velocity;
	var pointValue;

	// Choose a random position and direction
	if (Helpers.randomInt(0, 100) > 49) {
		position = new THREE.Vector2(0, Helpers.randomFloat(viewHeight * 0.1, viewHeight * 0.9));
		velocity = new THREE.Vector2(player.alienShip.speedX, 0);
	}

	else {
		position = new THREE.Vector2(viewWidth, Helpers.randomFloat(viewHeight * 0.1, viewHeight * 0.9));
		velocity = new THREE.Vector2(-player.alienShip.speedX, 0);
	}

	// Choose a size based on probability
	if (Helpers.randomInt(0, 100) >= player.alienShip.spawnSmallPct) {
		player.alienShip.size = AlienSize.LARGE;
		pointValue = 250;
		scale = new THREE.Vector2(1, 1);
		this.gameData.game.sendMessage(GameMessage.AlienLargeSoundPlay);
	}

	else {
		player.alienShip.size = AlienSize.SMALL;
		pointValue = 1000;
		scale = new THREE.Vector2(0.667, 0.667);
		this.gameData.game.sendMessage(GameMessage.AlienSmallSoundPlay);
	}

	// Spawn the alienShip
	gameObjects["alienship"] = this.factory.createAlienShip(position, scale, velocity,
		player.alienShip.size, new Color(0, 255, 0, 255), pointValue);

	// If we're not in demoMode
	if (this.gameData.demoMode === false) {
		// Then increase the chance to spawn small next time
		player.alienShip.spawnSmallPct += 6.4;
		player.alienShip.spawnSmallPct = Helpers.clamp(player.alienShip.spawnSmallPct, 0, 96);
		
		// Reduce the time for next spawn
		player.alienShip.spawnCounter -= player.alienShip.spawnCounterVelocity;
		player.alienShip.spawnCounter = Helpers.clamp(player.alienShip.spawnCounter, this.spawnCounterMin, this.spawnCounterMax);
		player.alienShip.spawnCounterVelocity += player.alienShip.spawnCounterAccel;
		player.alienShip.spawnCounterVelocity = Helpers.clamp(player.alienShip.spawnCounterVelocity, this.spawnCounterVelocity, 20);
		player.alienShip.spawnTimer.set(0, player.alienShip.spawnCounter);
	}

	// Start attacking
	player.alienShip.state = AlienShipState.ATTACKING;
}

AlienShipSystem.prototype.attacking = function (dt) {
	var player = this.gameData.players[this.gameData.activePlayer];
	var gameObjects = player.gameObjects;

	// Is it time to change direction
	if (player.alienShip.directionTimer.hasElapsed(dt)) {
		player.alienShip.directionTimer.reset();

		var gameObject = gameObjects["alienship"];
		if (gameObject) {
			var physics = gameObject.components.physics;
			if (physics) {
				var num = Helpers.randomInt(0, 30);
				if (num > 19) {
					physics.velocity.y = -player.alienShip.speedY;
				}
				else if (num > 9) {
					physics.velocity.y = 0;
				}
				else {
					physics.velocity.y = player.alienShip.speedY;
				}
			}
		}
	}

	// Is it time to fire a bullet
	if (player.alienShip.bulletTimer.hasElapsed(dt)) {
		player.alienShip.bulletTimer.reset();

		// Yes, get reference to spaceShip and alienShip
		var spaceShip = gameObjects["spaceship"];
		var alienShip = gameObjects["alienship"];
		var targetPosition;

		// If the spaceShip is active
		if (spaceShip) {
			// Get the spaceShip's position
			var transform = spaceShip.components.transform;
			if (transform) {
				// If alienShip is small, target the spacehip
				if (player.alienShip.size === AlienSize.SMALL) {
					targetPosition = new THREE.Vector2(transform.position.x + Helpers.randomFloat(-96, 96),
													   transform.position.y + Helpers.randomFloat(-72, 72));
				}

				// If alienShip is large, shoot randomly
				else {
					targetPosition = new THREE.Vector2(Helpers.randomFloat(-this.gameData.canvas.width, 2 * this.gameData.canvas.width),
													   Helpers.randomFloat(-this.gameData.canvas.height, 2 * this.gameData.canvas.height));
				}
			}
		}

		// No, spaceShip is not active, so shoot randomly
		else {
			targetPosition = new THREE.Vector2(Helpers.randomFloat(-this.gameData.canvas.width, 2 * this.gameData.canvas.width),
											   Helpers.randomFloat(-this.gameData.canvas.height, 2 * this.gameData.canvas.height));
		}

		// Fire a bullet
		if (alienShip) {
			var transform = alienShip.components.transform;
			if (transform) {
				var bulletVelocity = new THREE.Vector2(targetPosition.x - transform.position.x,
													   targetPosition.y - transform.position.y);
				bulletVelocity.normalize();
				bulletVelocity.multiplyScalar(this.bulletSpeed);
				gameObjects["bullet" + this.gameData.nextID++] = this.factory.createAlienShipBullet(
					transform.position, bulletVelocity, this.bulletLifetime);
				this.gameData.game.sendMessage(GameMessage.BulletSound);
			}
		}
	}
}

AlienShipSystem.prototype.exploding = function (dt) {
	var player = this.gameData.players[this.gameData.activePlayer];

	if (player.alienShip.explodeTimer.hasElapsed(dt)) {
		player.alienShip.explodeTimer.reset();
		player.alienShip.state = AlienShipState.READY;
	}
}
