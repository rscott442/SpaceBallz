//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function TimeoutSystem(gameData) {
	BaseSystem.call(this);
	this.gameData = gameData;
}

TimeoutSystem.prototype = Object.create(BaseSystem.prototype);
TimeoutSystem.prototype.constructor = TimeoutSystem;

TimeoutSystem.prototype.update = function (dt) {
	var gameObjects = this.gameData.players[this.gameData.activePlayer].gameObjects;

	// Age all timeout components
	for (var key in gameObjects) {
		var gameObject = gameObjects[key];
		var timeout = gameObject.components.timeout;
		if (timeout) {
			timeout.age += dt;
		}
	}
}
