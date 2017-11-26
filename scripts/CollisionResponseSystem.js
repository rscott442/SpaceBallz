//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function CollisionResponseSystem(gameData) {
	BaseSystem.call(this);
	this.gameData = gameData;
}

CollisionResponseSystem.prototype = Object.create(BaseSystem.prototype);
CollisionResponseSystem.prototype.constructor = CollisionResponseSystem;

CollisionResponseSystem.prototype.update = function (dt) {
	var gameObjects = this.gameData.players[this.gameData.activePlayer].gameObjects;

	// Send appropriate messages for each collision that occurred this frame.
	for (var key in gameObjects) {
		var gameObject = gameObjects[key];
		var collision = gameObject.components.collision;
		var tag = gameObject.components.tag;
		if (collision && tag) {
			if (collision.hasCollided === true) {
				switch(tag.tagValue) {
					case Tag.SpaceShip:
						this.gameData.game.sendMessage(GameMessage.SpaceShipCollided);
						this.gameData.game.sendMessage(GameMessage.CreateParticles, gameObject);
						break;
					case Tag.SpaceShipBullet:
						this.gameData.game.sendMessage(GameMessage.AddToPlayerScore, gameObject);
						break;
					case Tag.AlienShip:
						this.gameData.game.sendMessage(GameMessage.AlienShipCollided);
						this.gameData.game.sendMessage(GameMessage.CreateParticles, gameObject);
						break;
					case Tag.Ball:
						this.gameData.game.sendMessage(GameMessage.BallCollided, gameObject);
						this.gameData.game.sendMessage(GameMessage.CreateParticles, gameObject);
						break;
				}
			}
		}
	}
}
