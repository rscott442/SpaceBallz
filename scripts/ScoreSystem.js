//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function ScoreSystem(gameData) {
	BaseSystem.call(this);
	this.gameData = gameData;
}

ScoreSystem.prototype = Object.create(BaseSystem.prototype);
ScoreSystem.prototype.constructor = ScoreSystem;

ScoreSystem.prototype.receiveMessage = function (message, parameter) {
	switch (message) {
		case GameMessage.AddToPlayerScore:
			this.addToPlayerScore(parameter);
			break;
		case GameMessage.PlayerGameOver:
			this.playerGameOver(parameter);
			break;
	}
}

ScoreSystem.prototype.addToPlayerScore = function (gameObject) {
	// If player is exploding, then only add to the score if player has lives left
	var player = this.gameData.players[this.gameData.activePlayer];
	if ((player.lives === 0 && player.spaceShip.state === SpaceShipState.EXPLODING) === false) {
		var gameObjects = player.gameObjects;
		var collision = gameObject.components.collision;
		if (collision && collision.collidedWith != "") {
			// Get the point value from the object that was collided with
			var points = gameObjects[collision.collidedWith].components.point;
			if (points) {
				player.score += points.pointValue;
				player.shotsHit++;
				// Did player win a free ship?
				if (player.score >= player.nextFreeShip) {
					// Yes, but cap the lives
					if (player.lives < player.maxLives) {
						player.lives++;
						this.gameData.game.sendMessage(GameMessage.FreeShipSound);
					}

					// Increase to the next free ship award
					player.nextFreeShip += player.freeShipAward;
				}
			}
		}
	}
}

function ScoreEntry(name, score) {
	this.name = name;
	this.score = score;
}

ScoreSystem.prototype.getLowestScore = function() {
	if (this.gameData.highScores.length === 0) {
		return 0;
	}

	return this.gameData.highScores[this.gameData.highScores.length - 1].score;
}

ScoreSystem.prototype.playerGameOver = function (player) {
	// Log the player stats to the console
	console.log(Helpers.getTimeStamp() + ", " +
		player.name + ", " +
		player.score + ", " +
		player.level + ", " +
		player.shotsHit + ", " +
		player.shotsFired + ", " +
		player.accuracy.toFixed(2) + ", " +
		player.totalPlayingTime.toFixed(2) + ", " +
		player.fuelBurned.toFixed(2) + ", " +
		player.hyperSpaceCount);

	// Did this player make the high score list?
	var highScores = this.gameData.highScores;
	if (highScores.length < 10 || player.score > this.getLowestScore()) {

		// Add it
		highScores.push(new ScoreEntry(player.name, player.score));

		// Sort the list in descending order
		highScores.sort(function (a, b) {
			return b.score - a.score;
		});

		// Remove lowest entry
		if (highScores.length > 10)
			highScores.pop();

		// Save the high score table
		this.gameData.settings.saveHighScores(highScores);
	}
}
