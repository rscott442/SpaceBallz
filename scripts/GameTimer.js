//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function GameTimer(timer, alarm) {
	this.timer = timer || 0;
	this.alarm = alarm || 0;
}

GameTimer.prototype.set = function (timer, alarm) {
	this.timer = timer;
	this.alarm = alarm;
}

GameTimer.prototype.reset = function () {
	this.timer = 0;
}

GameTimer.prototype.update = function (dt) {
	this.timer += dt;
}

GameTimer.prototype.hasElapsed = function (dt) {
	this.timer += dt;
	return this.timer >= this.alarm;
}

GameTimer.prototype.forceExpire = function () {
	this.timer = this.alarm;
}

GameTimer.prototype.hasExpired = function () {
	return this.timer >= this.alarm;
}
