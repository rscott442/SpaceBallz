//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function SystemTimer() {
	this.t0 = new Date().getTime();
	this.t1 = 0;
	this.dt = 0;
}

SystemTimer.prototype.getElapsedTime = function () {
	// Get elasped time
	this.t1 = new Date().getTime();
	this.dt = 0.001 * (this.t1 - this.t0);
	this.t0 = this.t1;
	return this.dt;
}
