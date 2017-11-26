//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function TransformComponent(position, rotation, scale, origin) {
	this.position = position;
	this.rotation = rotation;
	this.scale = scale;
	this.origin = origin;
	this.transformMatrix = new THREE.Matrix4();

	// Build the transform matrix
	var translation = new THREE.Matrix4().makeTranslation(this.position.x, this.position.y, 0);
	var rotation = new THREE.Matrix4().makeRotationZ(this.rotation);
	var scale = new THREE.Matrix4().makeScale(this.scale.x, this.scale.y, 1);
	var origin = new THREE.Matrix4().makeTranslation(this.origin.x, this.origin.y, 0);

	// Apply the transformations
	this.transformMatrix.identity();
	this.transformMatrix.multiply(translation);//4
	this.transformMatrix.multiply(rotation);//3
	this.transformMatrix.multiply(scale);//2
	this.transformMatrix.multiply(origin);//1
}
TransformComponent.prototype.name = 'transform';

function PhysicsComponent(mass, dragCoeff, velocity, accel) {
	this.mass = mass;
	this.dragCoeff = dragCoeff;
	this.velocity = velocity;
	this.accel = accel;
}
PhysicsComponent.prototype.name = 'physics';

PhysicsComponent.prototype.applyForce = function (force) {
	this.accel.add(force.divideScalar(this.mass));
}

function SteeringComponent(angularMass, angularCoeff) {
	this.angularMass = angularMass;
	this.angularCoeff = angularCoeff;
	this.angularVelocity = 0;
	this.angularAccel = 0;
}
SteeringComponent.prototype.name = 'steering';

SteeringComponent.prototype.applyForce = function (force) {
	this.angularAccel += force / this.angularMass;
}

function ControllerComponent() {
	this.controller = true;
	this.actionMap = 0;
}
ControllerComponent.prototype.name = 'controller';

function PlayerComponent() {
	this.score = 0;
	this.lives = 3;
	this.freeshipaward = 10000;
	this.nextfreeship = this.freeshipaward;
}
PlayerComponent.prototype.name = 'player';

function WeaponComponent() {
	this.bullets = [];
	this.firerate = 43;
}
WeaponComponent.prototype.name = 'weapon';

function TagComponent(tagValue) {
	this.tagValue = tagValue;
}
TagComponent.prototype.name = 'tag';

function CollisionComponent(enabled) {
	this.enabled = enabled || true;
	this.hasCollided = false;
	this.collidedWith = "";
	this.outofBounds = false;
	this.rectangle = {};
}
CollisionComponent.prototype.name = 'collision';

function TimeoutComponent(age, lifeTime) {
	this.age = age;
	this.lifeTime = lifeTime;
}
TimeoutComponent.prototype.name = 'timeout';

function PointComponent(pointValue) {
	this.pointValue = pointValue;
}
PointComponent.prototype.name = 'point';

function RenderComponent(sprite) {
	this.sprite = sprite;
}
RenderComponent.prototype.name = 'render';
