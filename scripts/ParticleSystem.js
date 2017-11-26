//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function Particle() {
	this.position = new THREE.Vector2(0, 0);
	this.velocity = new THREE.Vector2(0, 0);
	this.accel = new THREE.Vector2(0, 0);
	this.mass = 1;
	this.dragCoeff = 0;
	this.size = 0;
	this.color = new Color(0, 0, 0, 255);
	this.lifeTime = 0;
}

Particle.prototype.applyForce = function (force) {
	this.accel.add(force.divideScalar(this.mass));
}

function ParticleSystem(gameData, factory) {
	this.gameData = gameData;
	this.factory = factory;
	this.particles = [];
	this.nextIndex = 0;
	this.maxLength = 200;
	this.count = 0;
	this.appliedForce = new THREE.Vector2(0, 0);

	// Fill the particles
	for (var index = 0; index < this.maxLength; index++) {
		this.particles.push(new Particle());
	}
}

ParticleSystem.prototype = Object.create(BaseSystem.prototype);
ParticleSystem.prototype.constructor = ParticleSystem;

ParticleSystem.prototype.receiveMessage = function (message, parameter) {
	switch (message) {
		case GameMessage.CreateParticles:
			this.createParticles(parameter);
			break;
	}
}

ParticleSystem.prototype.createParticles = function (gameObject) {
	// Add particles at this gameObject's location using the gameObject's color
	var transform = gameObject.components.transform;
	var render = gameObject.components.render;
	if (transform && render) {
		var position = transform.position;
		var color = render.sprite.color;
		var numParticles = Helpers.randomInt(20, 25);

		for (var index = 0; index < numParticles; index++) {
			var size = Helpers.randomInt(1, 4);
			var lifeTime = Helpers.randomFloat(0.4, 1.5);
			this.add(position, size, color, lifeTime);
		}
	}
}

ParticleSystem.prototype.add = function (position, size, color, lifeTime) {
	// If we have room
	if (this.count < this.particles.length) {
		// Find an open slot
		do {
			this.nextIndex = (this.nextIndex + 1) % this.particles.length;
		} while (this.particles[this.nextIndex].lifeTime > 0);

		// Create the particle
		var particle = this.particles[this.nextIndex];
		particle.position.copy(position);
		particle.velocity.set(0, 0);
		particle.accel.set(0, 0);
		particle.mass = 1;
		particle.dragCoeff = -0.012;
		particle.size = size;
		particle.color = color;
		particle.lifeTime = lifeTime;
		this.appliedForce.set(Helpers.randomFloat( -16000, 16000), Helpers.randomFloat(-16000, 16000));
		particle.applyForce(this.appliedForce);
		this.count++;
	}
}

ParticleSystem.prototype.update = function (dt) {
	// Update all particles that have life
	for (var index = 0; index < this.particles.length; index++) {
		var particle = this.particles[index];
		if (particle.lifeTime > 0) {
			// Apply drag
			var dragForce = particle.velocity.clone().normalize();
			dragForce.multiplyScalar(particle.dragCoeff * particle.velocity.lengthSq());
			particle.applyForce(dragForce);

			// Calculate velocity based on acceleration
			particle.velocity.add(particle.accel.clone().multiplyScalar(dt));

			// Calculate position based on velocity
			particle.position.add(particle.velocity.clone().multiplyScalar(dt));

			// Reset acceleration for next frame
			particle.accel.multiplyScalar(0);

			// Update and check the lifetime
			particle.lifeTime -= dt;
			if (particle.lifeTime <= 0) {
				this.count--;
			}
		}
	}
}

ParticleSystem.prototype.render = function () {
	// Render all particles that have life
	for (var index = 0; index < this.particles.length; index++) {
		var particle = this.particles[index];
		if (particle.lifeTime > 0) {
			this.gameData.context.fillStyle = 'rgba(' + particle.color.r + ', ' +
				particle.color.g + ', ' +
				particle.color.b + ', ' +
				particle.color.a + ')';
			this.gameData.context.fillRect(particle.position.x, particle.position.y,
				particle.size, particle.size);
		}
	}
}
