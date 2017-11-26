//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function ControllerSystem(gameData) {
	BaseSystem.call(this);
	this.gameData = gameData;
}

ControllerSystem.prototype = Object.create(BaseSystem.prototype);
ControllerSystem.prototype.constructor = ControllerSystem;

ControllerSystem.prototype.update = function (dt) {
	// Update the controller(s)
	this.gameData.keyBoard.update(dt);
}
