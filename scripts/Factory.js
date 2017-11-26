//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function Factory(gameData) {
	this.gameData = gameData;
}

var Tag = new Enum(['SpaceShip', 'AlienShip', 'Ball', 'SpaceShipBullet', 'AlienShipBullet']);

// Factory methods to wire up specific game objects
Factory.prototype.createToken = function (position, rotation, scale) {
	var gameObject = new GameObject();
	var color = new Color(255, 255, 255, 255);
	var sprite = new Sprite(this.gameData.spriteSheet, new Rectangle(0, 0, 128, 64), color, 64, false);
	gameObject.addComponent(new TransformComponent(position, rotation, scale, sprite.origin));
	gameObject.addComponent(new RenderComponent(sprite));
	return gameObject;
}

Factory.prototype.createSpaceShip = function (position, rotation, color, godMode) {
	var gameObject = new GameObject();
	var sprite = new Sprite(this.gameData.spriteSheet, new Rectangle(0, 0, 128, 64), color, 64, false);
	gameObject.addComponent(new TransformComponent(position, rotation, new THREE.Vector2(0.75, 0.75), sprite.origin));
	gameObject.addComponent(new PhysicsComponent(1, -0.001, new THREE.Vector2(0, 0), new THREE.Vector2(0, 0)));
	gameObject.addComponent(new SteeringComponent(1, -8.5));
	gameObject.addComponent(new ControllerComponent());
	gameObject.addComponent(new WeaponComponent());
	gameObject.addComponent(new CollisionComponent(!godMode));
	gameObject.addComponent(new TagComponent(Tag.SpaceShip));
	gameObject.addComponent(new RenderComponent(sprite));
	return gameObject;
}

Factory.prototype.createAlienShip = function (position, scale, velocity, size, color, pointValue) {
	var gameObject = new GameObject();
	var sprite = new Sprite(this.gameData.spriteSheet, new Rectangle(0, 64, 128, 64), color, 64, false);
	gameObject.addComponent(new TransformComponent(position, 0, scale, sprite.origin));
	gameObject.addComponent(new PhysicsComponent(1, 0, velocity, new THREE.Vector2(0, 0)));
	gameObject.addComponent(new WeaponComponent());
	gameObject.addComponent(new CollisionComponent());
	gameObject.addComponent(new TagComponent(Tag.AlienShip));
	gameObject.addComponent(new PointComponent(pointValue));
	sprite.currentFrame = size;
	gameObject.addComponent(new RenderComponent(sprite));
	return gameObject;
}

Factory.prototype.createBall = function (position, scale, velocity, color, pointValue) {
	var gameObject = new GameObject();
	var sprite = new Sprite(this.gameData.spriteSheet, new Rectangle(0, 128, 84, 84), color, 84, true);
	gameObject.addComponent(new TransformComponent(position, 0, scale, sprite.origin));
	gameObject.addComponent(new PhysicsComponent(1, 0, velocity, new THREE.Vector2(0, 0)));
	gameObject.addComponent(new CollisionComponent());
	gameObject.addComponent(new TagComponent(Tag.Ball));
	gameObject.addComponent(new PointComponent(pointValue));
	gameObject.addComponent(new RenderComponent(sprite));
	return gameObject;
}

Factory.prototype.createSpaceShipBullet = function (position, velocity, lifeTime) {
	var gameObject = new GameObject();
	var color = new Color(255, 255, 255, 255);
	var sprite = new Sprite(this.gameData.spriteSheet, new Rectangle(0, 212, 3, 3), color, 3, false);
	gameObject.addComponent(new TransformComponent(position, 0, new THREE.Vector2(1, 1), sprite.origin));
	gameObject.addComponent(new PhysicsComponent(1, 0, velocity, new THREE.Vector2(0, 0)));
	gameObject.addComponent(new TimeoutComponent(0, lifeTime));
	gameObject.addComponent(new CollisionComponent());
	gameObject.addComponent(new TagComponent(Tag.SpaceShipBullet));
	gameObject.addComponent(new RenderComponent(sprite));
	return gameObject;
}

Factory.prototype.createAlienShipBullet = function (position, velocity, lifeTime) {
	var gameObject = new GameObject();
	var color = new Color(255, 255, 255, 255);
	var sprite = new Sprite(this.gameData.spriteSheet, new Rectangle(0, 212, 3, 3), color, 3, false);
	gameObject.addComponent(new TransformComponent(position, 0, new THREE.Vector2(1, 1), sprite.origin));
	gameObject.addComponent(new PhysicsComponent(1, 0, velocity, new THREE.Vector2(0, 0)));
	gameObject.addComponent(new TimeoutComponent(0, lifeTime));
	gameObject.addComponent(new CollisionComponent());
	gameObject.addComponent(new TagComponent(Tag.AlienShipBullet));
	gameObject.addComponent(new RenderComponent(sprite));
	return gameObject;
}
