//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function GarbageSystem(gameData) {
	BaseSystem.call(this);
	this.gameData = gameData;
}

GarbageSystem.prototype = Object.create(BaseSystem.prototype);
GarbageSystem.prototype.constructor = GarbageSystem;

GarbageSystem.prototype.update = function (dt) {
	var gameObjects = this.gameData.players[this.gameData.activePlayer].gameObjects;

	// Remove alienship that is out of bounds
	var key = "alienship";
	var gameObject = gameObjects[key];
	if (gameObject) {
		var collision = gameObject.components.collision;
		if (collision && collision.outofBounds) {
			delete gameObjects[key];
		}
	}

	// Remove all gameobjects that have collided
	for (var key in gameObjects) {
		var gameObject = gameObjects[key];
		var collision = gameObject.components.collision;
		if (collision && collision.hasCollided) {
			delete gameObjects[key];
		}
	}

	// Remove all gameobjects that have expired
	for (var key in gameObjects) {
		var gameObject = gameObjects[key];
		var timeout = gameObject.components.timeout;
		if (timeout && timeout.age > timeout.lifeTime) {
			delete gameObjects[key];
		}
	}
}
