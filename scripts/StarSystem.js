//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function Star(position, size) {
	this.position = position;
	this.size = size;
}

function StarSystem(gameData) {
	BaseSystem.call(this);
	this.gameData = gameData;
	this.stars = [];
	this.maxStars = 128;

	// Create a random starfield
	for (var index = 0; index < this.maxStars; index++) {
		this.stars.push(new Star(new THREE.Vector2(Helpers.randomInt(0, this.gameData.canvas.width),
			Helpers.randomInt(0, this.gameData.canvas.height)),
			Helpers.randomInt(1, 4)));
	}
}
StarSystem.prototype = Object.create(BaseSystem.prototype);
StarSystem.prototype.constructor = StarSystem;

StarSystem.prototype.render = function () {
	// Render the starfield
	for (var index = 0; index < this.stars.length; index++) {
		var star = this.stars[index];
		this.gameData.context.fillStyle = "white";
		this.gameData.context.fillRect(star.position.x, star.position.y,
			star.size, star.size);
	}
}
