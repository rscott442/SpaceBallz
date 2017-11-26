//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
var Keys = {
	Backspace: 8, Tab: 9, Enter: 13, Escape: 27, Space: 32, Pageup: 33, Pagedown: 34, End: 35, Home: 36,
	Left: 37, Up: 38, Right: 39, Down: 40, Insert: 45, Delete: 46, Shift: 16, Ctrl: 17, Alt: 18, Pause: 19,
	Zero: 48, One: 49, Two: 50, Three: 51, Four: 52, Five: 53, Six: 54, Seven: 55, Eight: 56, Nine: 57,
	Minus: 189, Plus: 187, NumMinus: 109, NumPlus: 107, MinusFF: 173, PlusFF: 61,
	A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77,
	N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
	Tilde: 192
};

function Keyboard() {
	this.keys = [];
	this.currKeys = [];
	this.prevKeys = [];
}

Keyboard.prototype.view = window;

Keyboard.prototype.initialize = function () {
	this.view.addEventListener('keydown', function (e) {
		this.keys[e.keyCode] = true;
	}.bind(this), false);

	this.view.addEventListener('keyup', function (e) {
		this.keys[e.keyCode] = false;
	}.bind(this), false);
}

Keyboard.prototype.update = function (dt) {
	this.prevKeys = this.currKeys.slice(0);
	this.currKeys = this.keys.slice(0);
}

Keyboard.prototype.clear = function () {
	this.keys.length = 0;
	this.currKeys.length = 0;
	this.prevKeys.length = 0;
}

Keyboard.prototype.insertKey = function (key, value) {
	this.keys[key] = value;
}

Keyboard.prototype.isKeyDown = function (key) {
	return this.currKeys[key] === true;
}

Keyboard.prototype.isKeyUp = function (key) {
	return this.currKeys[key] === false;
}

Keyboard.prototype.wasKeyPressed = function (key) {
	if (this.currKeys[key] === true &&
		(this.prevKeys[key] === undefined || this.prevKeys[key] === false)) {
		return true;
	}

	return false;
}

