//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
var Helpers = {

	getTimeStamp: function() {
		return new Date().toLocaleString();
	},

	getForwardVector: function(rotation) {
		var forward = new THREE.Vector2(0, 0);
		forward.x = Math.cos(rotation);
		forward.y = Math.sin(rotation);
		forward.normalize();
		return forward;
	},

	clamp: function(value, min, max) {
		return Math.min(max, Math.max(min, value));
	},

	randomInt: function(min, max) {
		var num = Math.floor(Math.random() * (max - min)) + min;
		return num;
	},

	randomFloat: function(min, max) {
		var num = Math.random() * (max - min) + min;
		return num;
	},

	randomColor: function() {
		return new Color(this.randomInt(0, 256),
			this.randomInt(0, 256),
			this.randomInt(0, 256),
			255);
	}
};

function Enum(constants) {
	for (var i in constants) {
		this[constants[i]] = parseInt(i, 10);
	}
}

function Rectangle(x, y, width, height) {
	this.x = x || 0;
	this.y = y || 0;
	this.width = width || 0;
	this.height = height || 0;
}

Rectangle.prototype.intersects = function (rect) {
	return (this.x <= rect.x + rect.width &&
		rect.x <= this.x + this.width &&
		this.y <= rect.y + rect.height &&
		rect.y <= this.y + this.height);
}

Rectangle.prototype.contains = function (pointX, pointY) {
	return (pointX >= this.x && pointX <= this.x + this.width &&
		pointY >= this.y && pointY <= this.y + this.height);
}

function Color(r, g, b, a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
}
