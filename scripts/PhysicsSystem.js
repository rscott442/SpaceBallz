//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function PhysicsSystem(gameData) {
	BaseSystem.call(this);
	this.gameData = gameData;
}

PhysicsSystem.prototype = Object.create(BaseSystem.prototype);
PhysicsSystem.prototype.constructor = PhysicsSystem;

PhysicsSystem.prototype.update = function (dt) {
	var gameObjects = this.gameData.players[this.gameData.activePlayer].gameObjects;
	for (var key in gameObjects) {
		var gameObject = gameObjects[key];
		var transform = gameObject.components.transform;
		var physics = gameObject.components.physics;
		if (transform && physics) {
			// Apply drag
			var dragForce = physics.velocity.clone().normalize();
			dragForce.multiplyScalar(physics.dragCoeff * physics.velocity.lengthSq());
			physics.applyForce(dragForce);

			// Calculate velocity based on acceleration
			physics.velocity.add(physics.accel.clone().multiplyScalar(dt));

			// Calculate position based on velocity
			transform.position = transform.position.clone().add(physics.velocity.clone().multiplyScalar(dt));

			// Reset acceleration for next frame
			physics.accel.multiplyScalar(0);

			// If the gameObject has a steering component
			var steering = gameObject.components.steering;
			if (steering) {
				// Apply steering drag
				var dragSteering = steering.angularVelocity;
				dragSteering = steering.angularCoeff * steering.angularVelocity;
				steering.applyForce(dragSteering);

				// Calculate angularVelocity based on angularAcceleration
				steering.angularVelocity += steering.angularAccel * dt;

				// Calculate rotation based on angularVelocity
				transform.rotation += steering.angularVelocity * dt;

				// Reset angular acceleration for next frame
				steering.angularAccel = 0;
			}
		}
	}
}
