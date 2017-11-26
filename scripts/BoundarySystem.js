//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function BoundarySystem(gameData, canvas) {
	BaseSystem.call(this);
	this.gameData = gameData;
	this.canvas = canvas;
}

BoundarySystem.prototype = Object.create(BaseSystem.prototype);
BoundarySystem.prototype.constructor = BoundarySystem;

BoundarySystem.prototype.update = function (dt) {
	var gameObjects = this.gameData.players[this.gameData.activePlayer].gameObjects;

	// Check all boundaries
	for (var key in gameObjects) {
		var gameObject = gameObjects[key];
		var transform = gameObject.components.transform;
		var tag = gameObject.components.tag;
		if (transform && tag) {
			// Only the alienShip does not wrap around on the x axis
			if (transform.position.x >= this.canvas.width) {
				if (tag.tagValue === Tag.AlienShip) {
					this.gameData.game.sendMessage(GameMessage.AlienShipHitBoundary);
				}

				else {
					transform.position.x -= this.canvas.width;
				}
			}

			if (transform.position.x < 0) {
				if (tag.tagValue === Tag.AlienShip) {
					this.gameData.game.sendMessage(GameMessage.AlienShipHitBoundary);
				}

				else {
					transform.position.x += this.canvas.width;
				}
			}

			// Wrap around on y axis
			if (transform.position.y >= this.canvas.height) {
				transform.position.y -= this.canvas.height;
			}

			if (transform.position.y < 0) {
				transform.position.y += this.canvas.height;
			}
		}
	}
}
