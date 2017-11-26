//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function SpaceShipSystem(gameData, factory) {
	BaseSystem.call(this);
	this.gameData = gameData;
	this.factory = factory;
	this.keyBoard = this.gameData.keyBoard;

	this.thrust = new THREE.Vector2(0, 0);
	this.bulletTimerMax = 0.18;
	this.bulletSpeed = 512;
	this.bulletLifetime = 1.3;
	this.maxBullets = 4;
	this.godMode = false;

	// Define safe zone for spawning
	this.spawnSafeZone = new Rectangle(this.gameData.canvas.width * 0.37, this.gameData.canvas.height * 0.37,
		this.gameData.canvas.width * 0.26, this.gameData.canvas.height * 0.26);

	// Define safe zone for hyperspace
	this.hyperSafeZone = new Rectangle(this.gameData.canvas.width * 0.1, this.gameData.canvas.height * 0.1,
		this.gameData.canvas.width * 0.8, this.gameData.canvas.height * 0.8);
}

SpaceShipSystem.prototype = Object.create(BaseSystem.prototype);
SpaceShipSystem.prototype.constructor = SpaceShipSystem;

var SpaceShipState = new Enum(['IDLE', 'READY', 'SPAWNING', 'PLAYING', 'EXPLODING']);

SpaceShipSystem.prototype.receiveMessage = function (message, parameter) {
	switch (message) {
		case GameMessage.StartNewGame:
			this.startNewGame();
			break;
		case GameMessage.NextPlayer:
			this.nextPlayer();
			break;
		case GameMessage.SpaceShipCollided:
			this.spaceShipCollided();
			break;
		case GameMessage.ToggleGodMode:
			this.toggleGodMode();
			break;
	}
}

SpaceShipSystem.prototype.startNewGame = function() {
	for (var index = 0; index < this.gameData.players.length; index++) {
		var player = this.gameData.players[index];
		player.spaceShip.spawnTimer.set(0, 2);
		player.spaceShip.explodeTimer.set(0, 2);
		player.spaceShip.bulletTimer.set(this.bulletTimerMax, this.bulletTimerMax);
		player.spaceShip.state = SpaceShipState.IDLE;
	}

	this.gameData.players[this.gameData.activePlayer].spaceShip.state = SpaceShipState.READY;
}

SpaceShipSystem.prototype.nextPlayer = function () {
	var player = this.gameData.players[this.gameData.activePlayer];
	player.spaceShip.state = SpaceShipState.READY;
}

SpaceShipSystem.prototype.spaceShipCollided = function () {
	var player = this.gameData.players[this.gameData.activePlayer];
	var gameObjects = player.gameObjects;

	player.spaceShip.state = SpaceShipState.EXPLODING;
	this.gameData.game.sendMessage(GameMessage.ExplosionSound);
}

SpaceShipSystem.prototype.toggleGodMode = function () {
	var player = this.gameData.players[this.gameData.activePlayer];
	var gameObjects = player.gameObjects;

	var gameObject = gameObjects["spaceship"];
	var collision = gameObject.components.collision;
	if (collision) {
		this.godMode = !this.godMode;
		collision.enabled = !this.godMode;
	}
}

SpaceShipSystem.prototype.update = function (dt) {
	var player = this.gameData.players[this.gameData.activePlayer];
	var gameObjects = player.gameObjects;

	switch (player.spaceShip.state) {
		case SpaceShipState.IDLE:
			this.idle(dt);
			break;
		case SpaceShipState.READY:
			this.ready(dt);
			break;
		case SpaceShipState.SPAWNING:
			this.spawning(dt);
			break;
		case SpaceShipState.PLAYING:
			this.playing(dt);
			break;
		case SpaceShipState.EXPLODING:
			this.exploding(dt);
			break;
	}
}

SpaceShipSystem.prototype.idle = function (dt) {

}

SpaceShipSystem.prototype.ready = function (dt) {
	var player = this.gameData.players[this.gameData.activePlayer];

	if(player.spaceShip.spawnTimer.hasElapsed(dt)) {
		player.spaceShip.spawnTimer.reset();
		player.spaceShip.state = SpaceShipState.SPAWNING;
	}
}

SpaceShipSystem.prototype.spawning = function (dt) {
	var player = this.gameData.players[this.gameData.activePlayer];
	var gameObjects = player.gameObjects;

	var safeToSpawn = true;
	for (var key in gameObjects) {
		var gameObject = gameObjects[key];
		var collision = gameObject.components.collision;
		if (collision) {
			// If any gameObject is in the safeZone, then don't spawn
			if(this.spawnSafeZone.intersects(collision.rectangle) === true) {
				safeToSpawn = false;
				break;
			}
		}
	}

	// Now it's safe to spawn
	if (safeToSpawn) {
		gameObjects["spaceship"] = this.factory.createSpaceShip(
			new THREE.Vector2(this.gameData.canvas.width * 0.5, this.gameData.canvas.height * 0.5),
			Helpers.randomFloat(0, 2 * Math.PI),
			new Color(255, 0, 0, 255),
			this.godMode);

		player.lives--;
		player.spaceShip.state = SpaceShipState.PLAYING;
	}
}

SpaceShipSystem.prototype.playing = function (dt) {
	var player = this.gameData.players[this.gameData.activePlayer];
	var gameObjects = player.gameObjects;
	var keyBoard = this.gameData.keyBoard;

	// Count total playing time
	player.totalPlayingTime += dt;

	// Count bullets
	var bulletCount = 0;
	for (var key in gameObjects) {
		var gameObject = gameObjects[key];
		var tag = gameObject.components.tag;
		if (tag && tag.tagValue === Tag.SpaceShipBullet) {
			bulletCount++;
		}
	}

	var gameObject = gameObjects["spaceship"];

	var transform = gameObject.components.transform;
	var physics = gameObject.components.physics;
	var render = gameObject.components.render;
	var steering = gameObject.components.steering;

	if (transform && physics && render && steering) {
		// Steer left
		if (this.keyBoard.isKeyDown(Keys.Left)) {
			steering.applyForce(-35);
		}

		// Steer right
		if (this.keyBoard.isKeyDown(Keys.Right)) {
			steering.applyForce(35);
		}

		// Apply thrust
		if (this.keyBoard.isKeyDown(Keys.Up)) {
			this.thrust.set(Math.cos(transform.rotation) * 350, Math.sin(transform.rotation) * 350);
			physics.applyForce(this.thrust);
			render.sprite.currentFrame = 1;
			player.fuelBurned += dt;
		}
		else {
			render.sprite.currentFrame = 0;
		}

		// Fire Bullet
		player.spaceShip.bulletTimer.update(dt);
		if (this.keyBoard.isKeyDown(Keys.Ctrl)) {
			if (player.spaceShip.bulletTimer.hasExpired()) {
				if (bulletCount < this.maxBullets) {
					player.spaceShip.bulletTimer.reset();
					var newPosition = transform.position.clone().add(Helpers.getForwardVector(transform.rotation)
						.multiply(transform.scale)
						.multiplyScalar(render.sprite.frames[0].width * 0.4));
					var newVelocity = physics.velocity.clone().add(Helpers.getForwardVector(transform.rotation)
						.multiplyScalar(this.bulletSpeed));
					gameObjects["bullet" + this.gameData.nextID++] = this.factory.createSpaceShipBullet(
						newPosition, newVelocity, this.bulletLifetime);
					this.gameData.game.sendMessage(GameMessage.BulletSound);
					player.shotsFired++;
					player.accuracy = (player.shotsFired > 0) ? player.shotsHit / player.shotsFired * 100 : 0;
				}
			}
		}

		// Activate hyperspace
		if (this.keyBoard.wasKeyPressed(Keys.Enter) || this.keyBoard.wasKeyPressed(Keys.Space)) {
			transform.position = new THREE.Vector2(Helpers.randomInt(this.hyperSafeZone.x,
				this.hyperSafeZone.x + this.hyperSafeZone.width),
				Helpers.randomInt(this.hyperSafeZone.y, this.hyperSafeZone.y + this.hyperSafeZone.height));
			transform.rotation = Helpers.randomFloat(0, 2 * Math.PI);
			physics.velocity.set(0, 0);
			steering.angularVelocity = 0;
			player.hyperSpaceCount++
		}
	}
}

SpaceShipSystem.prototype.exploding = function (dt) {
	var player = this.gameData.players[this.gameData.activePlayer];

	if (player.spaceShip.explodeTimer.hasElapsed(dt)) {
		player.spaceShip.explodeTimer.reset();

		// Is game over for this player?
		if (player.lives === 0) {
			this.gameData.game.sendMessage(GameMessage.PlayerGameOver, player);
		}

		// Count players remaining
		var playersRemaining = 0;
		for (var index = 0; index < this.gameData.players.length; index++) {
			if (this.gameData.players[index].lives > 0) {
				playersRemaining++;
			}
		}

		// If all players are dead,
		if (playersRemaining === 0) {
			// Then entire game is over
			player.spaceShip.state = SpaceShipState.IDLE;
			this.gameData.game.sendMessage(GameMessage.GameOver);
		}

		else { // No, select the next player
			// Turn off alien sound for current player
			if (player.alienShip.size === AlienSize.LARGE) {
				this.gameData.game.sendMessage(GameMessage.AlienLargeSoundStop);
			}
			else {
				this.gameData.game.sendMessage(GameMessage.AlienSmallSoundStop);
			}

			// Select next player
			do {
				this.gameData.activePlayer = (this.gameData.activePlayer + 1) % this.gameData.players.length;
			} while (this.gameData.players[this.gameData.activePlayer].lives === 0);

			// Tell him to spawn
			this.gameData.game.sendMessage(GameMessage.NextPlayer);
		}
	}
}
