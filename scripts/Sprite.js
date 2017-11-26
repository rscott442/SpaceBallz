//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function Sprite(spriteSheet, strip, color, frameWidth, applyTint) {
	this.frames = [];
	this.numFrames = 0;
	this.currentFrame = 0;
	this.spriteCanvas = document.createElement('canvas');
	this.spriteCanvas.width = strip.width;
	this.spriteCanvas.height = strip.height;
	this.spriteContext = this.spriteCanvas.getContext('2d');
	this.imageData;
	this.color = color;
	this.applyTint = applyTint;
	this.origin;

	// Draw the strip from the spriteSheet onto the sprite canvas
	this.spriteContext.drawImage(spriteSheet, strip.x, strip.y, strip.width, strip.height,
		0, 0, strip.width, strip.height);

	// Get the pixel data from the strip
	this.imageData = this.spriteContext.getImageData(0, 0, strip.width, strip.height);

	if (this.applyTint === true) {
		// Apply the color to the pixel data
		this.applyColor(this.imageData.data, this.color);

		// Put the pixel data back onto the strip
		this.spriteContext.putImageData(this.imageData, 0, 0);
	}

	// Make frames
	this.numFrames = strip.width / frameWidth;
	for (var x = 0; x < this.numFrames; x++) {
		this.frames.push(new Rectangle(x * frameWidth, 0, frameWidth, strip.height));
	}

	// Make origin
	if (this.numFrames > 0) {
		this.origin = new THREE.Vector2(this.frames[0].width * -0.5, this.frames[0].height * -0.5);
	}
}

Sprite.prototype.applyColor = function (rgba, color) {
	// Apply the specified color directly to the pixel data
	for (var pixel = 0; pixel < rgba.length; pixel += 4) {
		var r = rgba[pixel];
		var g = rgba[pixel + 1];
		var b = rgba[pixel + 2];
		var a = rgba[pixel + 3];

		rgba[pixel] = r * color.r / 255;
		rgba[pixel + 1] = g * color.g / 255;
		rgba[pixel + 2] = b * color.b / 255;
		rgba[pixel + 3] = a * color.a / 255;
	}
}
