//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function RenderSystem(gameData, canvas, context, spriteSheet) {
	BaseSystem.call(this);
	this.gameData = gameData;
	this.canvas = canvas;
	this.context = context;
	this.spriteSheet = spriteSheet;
	this.showHitBoxes = false;
}

RenderSystem.prototype = Object.create(BaseSystem.prototype);
RenderSystem.prototype.constructor = RenderSystem;

RenderSystem.prototype.receiveMessage = function (message, parameter) {
	switch (message) {
		case GameMessage.ToggleHitBoxes:
			this.toggleHitBoxes();
			break;
	}
}

RenderSystem.prototype.toggleHitBoxes = function (transform, render, collision) {
	this.showHitBoxes = !this.showHitBoxes;
}

RenderSystem.prototype.render = function () {
	// Render all gameObjects for active player
	var player = this.gameData.players[this.gameData.activePlayer];
	var gameObjects = player.gameObjects;
	for (var key in gameObjects) {
		var gameObject = gameObjects[key];
		var transform = gameObject.components.transform;
		var render = gameObject.components.render;
		if (transform && render) {
			// Apply transforms
			this.context.save();
			this.context.translate(transform.position.x, transform.position.y);//4
			this.context.rotate(transform.rotation);//3
			this.context.scale(transform.scale.x, transform.scale.y);//2
			this.context.translate(transform.origin.x, transform.origin.y);//1
			var frame = render.sprite.frames[render.sprite.currentFrame];
			// Render the gameObject
			this.context.drawImage(render.sprite.spriteCanvas, frame.x, frame.y, frame.width, frame.height,
				0, 0, frame.width, frame.height);
			this.context.restore();

			// Render hitboxes
			if (this.showHitBoxes === true) {
				var collision = gameObject.components.collision;
				if (collision) {
					this.renderHitbox(transform, render, collision);
				}
			}
		}
	}
}

RenderSystem.prototype.renderHitbox = function (transform, render, collision) {
	if (transform && render && collision) {
		this.context.save();

		// Collision rectangle
		this.context.strokeStyle = "#FF0000";
		this.context.strokeRect(collision.rectangle.x, collision.rectangle.y,
			collision.rectangle.width, collision.rectangle.height);

		// GameObject transform
		this.context.setTransform(transform.transformMatrix.elements[0],
			transform.transformMatrix.elements[1],
			transform.transformMatrix.elements[4],
			transform.transformMatrix.elements[5],
			transform.transformMatrix.elements[12],
			transform.transformMatrix.elements[13]);

		// Render the hitbox
		this.context.strokeStyle = "#FFFFFF";
		this.context.strokeRect(0, 0,
			render.sprite.frames[render.sprite.currentFrame].width,
			render.sprite.frames[render.sprite.currentFrame].height);

		this.context.restore();
	}
}
