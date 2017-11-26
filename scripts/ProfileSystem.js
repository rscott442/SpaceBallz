//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function ProfileSystem(gameData) {
	BaseSystem.call(this);
	this.gameData = gameData;
	this.elapsedTime = 0;
	this.totalFrames = 0;
	this.FPS = 0;
}

ProfileSystem.prototype = Object.create(BaseSystem.prototype);
ProfileSystem.prototype.constructor = ProfileSystem;

ProfileSystem.prototype.receiveMessage = function (message, parameter) {

}

ProfileSystem.prototype.update = function (dt) {
	this.elapsedTime += dt;
	this.totalFrames++;

	if (this.elapsedTime > 1) {
		this.FPS = this.totalFrames;
		this.elapsedTime = 0;
		this.totalFrames = 0;
	}
}

ProfileSystem.prototype.render = function () {
	var gameObjects = this.gameData.players[this.gameData.activePlayer].gameObjects;

	this.gameData.console.writeLine("ver: " + this.gameData.game.appVer);
	this.gameData.console.writeLine("fps: " + this.FPS);
}
