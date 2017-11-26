//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
// The pixel perfect collision code is based on the XNA C# 2D Collision with Transformed Objects tutorial.
//==============================================================================
function CollisionDetectSystem(gameData) {
	BaseSystem.call(this);
	this.gameData = gameData;
}

CollisionDetectSystem.prototype = Object.create(BaseSystem.prototype);
CollisionDetectSystem.prototype.constructor = CollisionDetectSystem;

// This table shows which gameObjects collide with which gameObjects
// SpaceShip, AlienShip, Ball, SpaceShipBullet, AlienShipBullet
CollisionDetectSystem.prototype.collisionTable = [
  [false, true, true, false, true],
  [true, false, false, true, false],
  [true, false, false, true, true],
  [false, true, true, false, false],
  [true, false, true, false, false]
];

CollisionDetectSystem.prototype.update = function (dt) {
	var gameObjects = this.gameData.players[this.gameData.activePlayer].gameObjects;

	// Update all collision rectangles
	for (var key in gameObjects) {
		var gameObject = gameObjects[key];
		var collision = gameObject.components.collision;
		if (collision) {
			var transform = gameObject.components.transform;
			var render = gameObject.components.render;
			if (transform && render) {
				this.updateRectangle(transform, render, collision);
			}
		}
	}

	// Get Array of Keys
	var keys = Object.keys(gameObjects);
	this.gameData.numObjects = keys.length;

	// Check collisions on gameObjects that have collision components
	for (var i = 0; i < keys.length - 1; i++) {
		for (var j = i + 1; j < keys.length; j++) {

			var gameObject1 = gameObjects[keys[i]];
			var gameObject2 = gameObjects[keys[j]];

			var collision1 = gameObject1.components.collision;
			var collision2 = gameObject2.components.collision;

			if (collision1 && collision2) {
				if (collision1.enabled === true && collision1.hasCollided === false &&
					collision2.enabled === true && collision2.hasCollided === false) {

					var tag1 = gameObject1.components.tag;
					var tag2 = gameObject2.components.tag;

					if (tag1 && tag2) {
						if (this.collisionTable[tag1.tagValue][tag2.tagValue] === true) {
							if (this.checkCollision(gameObject1, gameObject2) === true) {
								collision1.hasCollided = true;
								collision1.collidedWith = keys[j];
								collision2.hasCollided = true;
								collision2.collidedWith = keys[i];
							}
						}
					}
				}
			}
		}
	}
}

CollisionDetectSystem.prototype.updateRectangle = function (transform, render, collision) {

	// Build the transforms
	var translation = new THREE.Matrix4().makeTranslation(transform.position.x, transform.position.y, 0);
	var rotation = new THREE.Matrix4().makeRotationZ(transform.rotation);
	var scale = new THREE.Matrix4().makeScale(transform.scale.x, transform.scale.y, 1);
	var origin = new THREE.Matrix4().makeTranslation(transform.origin.x, transform.origin.y, 0);

	// Apply the transformations
	transform.transformMatrix.identity();
	transform.transformMatrix.multiply(translation);//4
	transform.transformMatrix.multiply(rotation);//3
	transform.transformMatrix.multiply(scale);//2
	transform.transformMatrix.multiply(origin);//1

	// Calculate bounding rectangle
	collision.rectangle = this.calculateBoundingRectangle(
		new Rectangle(0, 0, render.sprite.frames[render.sprite.currentFrame].width,
			render.sprite.frames[render.sprite.currentFrame].height),
			transform.transformMatrix);
}

CollisionDetectSystem.prototype.calculateBoundingRectangle = function (rectangle, transform) {
	// Get all four corners in local space
	var leftTop = new THREE.Vector3(rectangle.x, rectangle.y, 0);
	var rightTop = new THREE.Vector3(rectangle.x + rectangle.width, rectangle.y, 0);
	var leftBottom = new THREE.Vector3(rectangle.x, rectangle.y + rectangle.height, 0);
	var rightBottom = new THREE.Vector3(rectangle.x + rectangle.width, rectangle.y + rectangle.height, 0);

	// Transform all four corners into world space
	leftTop.applyMatrix4(transform);
	rightTop.applyMatrix4(transform);
	leftBottom.applyMatrix4(transform);
	rightBottom.applyMatrix4(transform);

	// Convert to vector2
	var leftTop2 = new THREE.Vector2(leftTop.x, leftTop.y);
	var rightTop2 = new THREE.Vector2(rightTop.x, rightTop.y);
	var leftBottom2 = new THREE.Vector2(leftBottom.x, leftBottom.y);
	var rightBottom2 = new THREE.Vector2(rightBottom.x, rightBottom.y);

	// Find the minimum and maximum extents of the rectangle in world space
	var min1 = leftTop2.clone().min(rightTop2);
	var min2 = leftBottom2.clone().min(rightBottom2);
	var min = min1.clone().min(min2);
	var max1 = leftTop2.clone().max(rightTop2);
	var max2 = leftBottom2.clone().max(rightBottom2);
	var max = max1.clone().max(max2);

	// Return that as a rectangle
	return new Rectangle(min.x, min.y, (max.x - min.x), (max.y - min.y));
}

CollisionDetectSystem.prototype.checkCollision = function (gameObject1, gameObject2) {
	if (gameObject1 && gameObject2) {
		var collision1 = gameObject1.components.collision;
		var collision2 = gameObject2.components.collision;
		if (collision1 && collision2) {
			// First check if Rectangles intersect
			if (collision1.rectangle.intersects(collision2.rectangle) === true) {
				// If so, then start checking for pixel perfect collisions
				var transform1 = gameObject1.components.transform;
				var transform2 = gameObject2.components.transform;
				var render1 = gameObject1.components.render;
				var render2 = gameObject2.components.render;
				if (transform1 && transform2 && render1 && render2) {
					var transformA = transform1.transformMatrix;
					var widthA = render1.sprite.frames[render1.sprite.currentFrame].width;
					var heightA = render1.sprite.frames[render1.sprite.currentFrame].height;
					var dataA = render1.sprite.imageData;

					var transformB = transform2.transformMatrix;
					var widthB = render2.sprite.frames[render2.sprite.currentFrame].width;
					var heightB = render2.sprite.frames[render2.sprite.currentFrame].height;
					var dataB = render2.sprite.imageData;

					// Check if pixels intersect
					if (this.intersectPixels(transformA, widthA, heightA, dataA, render1.sprite.numFrames,
											 transformB, widthB, heightB, dataB, render2.sprite.numFrames) === true) {
						return true;
					}
				}
			}
		}
	}

	return false;
}

CollisionDetectSystem.prototype.transformNormal = function (normal, matrix) {
	// M11=0 M12=1 M21=4 M22=5
	return new THREE.Vector2(
		(normal.x * matrix.elements[0]) +
		(normal.y * matrix.elements[4]),
		(normal.x * matrix.elements[1]) +
		(normal.y * matrix.elements[5]));
}

CollisionDetectSystem.prototype.transform = function (position, matrix) {
	// M11=0 M12=1 M21=4 M22=5 M41=12 M42=13
	return new THREE.Vector2(
		(position.x * matrix.elements[0]) +
		(position.y * matrix.elements[4]) +
		matrix.elements[12],
		(position.x * matrix.elements[1]) +
		(position.y * matrix.elements[5]) +
		matrix.elements[13]);
}

CollisionDetectSystem.prototype.intersectPixels = function (transformA, widthA, heightA, dataA, numFramesA,
															transformB, widthB, heightB, dataB, numFramesB) {
	// Calculate a matrix which transforms from A's local space into
	// world space and then into B's local space
	var transformAToB = transformA.clone().premultiply(new THREE.Matrix4().getInverse(transformB, true));

	// When a point moves in A's local space, it moves in B's local space with a
	// fixed direction and distance proportional to the movement in A.
	// This algorithm steps through A one pixel at a time along A's X and Y axes
	// Calculate the analogous steps in B:
	var stepX = this.transformNormal(new THREE.Vector2(1, 0), transformAToB);
	var stepY = this.transformNormal(new THREE.Vector2(0, 1), transformAToB);

	// Calculate the top left corner of A in B's local space
	// This variable will be reused to keep track of the start of each row
	var yPosInB = this.transform(new THREE.Vector2(0, 0), transformAToB);
	var posInB = new THREE.Vector2(0, 0);

	// For each row of pixels in A
	for (var yA = 0; yA < heightA; yA++) {

		// Start at the beginning of the row
		posInB.copy(yPosInB);

		// For each pixel in this row
		for (var xA = 0; xA < widthA; xA++) {

			// Round to the nearest pixel
			var xB = Math.round(posInB.x);
			var yB = Math.round(posInB.y);

			// If the pixel lies within the bounds of B
			if (xB >= 0 && xB < widthB &&
				yB >= 0 && yB < heightB) {

				// Get the alpha of the overlapping pixels
				var alphaA = dataA.data[((xA * 4) + (yA * widthA * numFramesA * 4)) + 3];
				var alphaB = dataB.data[((xB * 4) + (yB * widthB * numFramesB * 4)) + 3];

				// If both pixels are not completely transparent,
				if (alphaA !== 0 && alphaB !== 0) {
					// then an intersection has been found
					return true;
				}
			}

			// Move to the next pixel in the row
			posInB.add(stepX);
		}

		// Move to the next row
		yPosInB.add(stepY);
	}

	// No intersection found
	return false;
}
