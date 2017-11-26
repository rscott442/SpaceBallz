//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function Console(context) {
	this.row = 0;
	this.column = 0;
	this.context = context
	this.enabled = false;
}

Console.prototype.writeLine = function (strMessage) {
	if (this.enabled) {
		this.context.font = "12px Verdana";
		this.context.fillStyle = "white";
		this.context.fillText(strMessage, this.column, this.row);
		this.row += 16;
	}
}

Console.prototype.toggle = function () {
	this.enabled = !this.enabled;
}