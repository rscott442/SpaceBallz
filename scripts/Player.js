//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function Player(index) {
	this.gameObjects = {};
	this.name = "Player" + (index + 1).toString();
	this.score = 0;
	this.lives = 3;
	this.maxLives = 8;
	this.level = 1;
	this.shotsHit = 0;
	this.shotsFired = 0;
	this.accuracy = 0;
	this.totalPlayingTime = 0;
	this.fuelBurned = 0;
	this.hyperSpaceCount = 0;
	this.freeShipAward = 10000;
	this.nextFreeShip = this.freeShipAward;

	this.spaceShip = new SpaceShip();
	this.alienShip = new AlienShip();
	this.balls = new Balls();
}

function SpaceShip() {
	this.spawnTimer = new GameTimer();
	this.explodeTimer = new GameTimer();
	this.bulletTimer = new GameTimer();
	this.state = SpaceShipState.IDLE;
}

function AlienShip() {
	this.speedX = 0;
	this.speedY = 0;
	this.spawnSmallPct = 0;
	this.spawnCounter = 0;
	this.spawnCounterVelocity = 0;
	this.spawnCounterAccel = 0;
	this.size = 0;
	this.spawnTimer = new GameTimer();
	this.directionTimer = new GameTimer();
	this.explodeTimer = new GameTimer();
	this.bulletTimer = new GameTimer();
	this.state = AlienShipState.READY;
}

function Balls() {
	this.spawnTimer = new GameTimer();
	this.state = BallState.IDLE;
}
