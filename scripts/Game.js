//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function Game() {
	this.appVer = "1.00";
	this.canvas;
	this.context;
	this.spriteSheet;
	this.gameData;
	this.factory;
	this.systems;
	this.systemTimer;
	this.keyBoard;
}

var GameMessage = new Enum(['StartNewGame', 'SpaceShipCollided', 'AlienShipCollided', 'AlienShipHitBoundary',
	'GameOver', 'GamePaused', 'PlayerGameOver', 'NextPlayer', 'NextLevel', 'ToggleGodMode', 'ToggleBotMode',
	'ToggleConsole', 'BallCollided', 'AddToPlayerScore', 'CreateParticles', 'AlienLargeSoundPlay',
	'AlienLargeSoundStop', 'AlienSmallSoundPlay', 'AlienSmallSoundStop', 'BulletSound', 'ExplosionSound',
	'FreeShipSound', 'VolumeUp', 'VolumeDown', 'ToggleHitBoxes']);

Game.prototype.initialize = function () {
	this.canvas = document.getElementById('gameCanvas');
	this.context = this.canvas.getContext('2d');
	this.context.textBaseline = "top";
	this.keyBoard = new Keyboard();
	this.keyBoard.initialize();
	this.systems = [];

	// Initialize the game after the spriteSheet is loaded
	this.spriteSheet = new Image();
	this.spriteSheet.addEventListener('load', function () {
		// Create game database
		this.gameData = new GameData(this, this.canvas, this.context,
			this.spriteSheet, this.keyBoard, new Settings());

		// Create factory
		this.factory = new Factory(this.gameData);

		// Create systems
		this.systems.push(new ControllerSystem(this.gameData));
		this.systems.push(new BotSystem(this.gameData));
		this.systems.push(new StarSystem(this.gameData));
		this.systems.push(new SpaceShipSystem(this.gameData, this.factory));
		this.systems.push(new AlienShipSystem(this.gameData, this.factory));
		this.systems.push(new BallSystem(this.gameData, this.factory));
		this.systems.push(new PhysicsSystem(this.gameData));
		this.systems.push(new BoundarySystem(this.gameData, this.canvas));
		this.systems.push(new CollisionDetectSystem(this.gameData));
		this.systems.push(new ScoreSystem(this.gameData));
		this.systems.push(new CollisionResponseSystem(this.gameData));
		this.systems.push(new TimeoutSystem(this.gameData));
		this.systems.push(new GarbageSystem(this.gameData));
		this.systems.push(new RenderSystem(this.gameData, this.canvas, this.context, this.spriteSheet));
		this.systems.push(new HUDSystem(this.gameData, this.factory));
		this.systems.push(new ParticleSystem(this.gameData, this.factory));
		this.systems.push(new ProfileSystem(this.gameData));
		this.systems.push(new MenuSystem(this.gameData, this.factory));
		this.systems.push(new SoundSystem(this.gameData));

		// Create the system timer to provide elapsed time between frames
		this.systemTimer = new SystemTimer();

		// Start the game loop
		this.gameLoop();

	}.bind(this));

	// Load the spriteSheet
	this.spriteSheet.src = 'images/spriteSheet.png';
}

Game.prototype.sendMessage = function (message, parameter) {
	// Send this message to all systems
	for (var i = 0; i < this.systems.length; i++) {
		this.systems[i].receiveMessage(message, parameter);
	}
}

Game.prototype.gameLoop = function () {
	// Main game loop
	requestAnimationFrame(this.gameLoop.bind(this));
	this.update(this.systemTimer.getElapsedTime());
	this.render();
}

Game.prototype.update = function (dt) {
	// Update the controller first (must be index 0)
	this.systems[0].update(dt);

	// Check for pause key
	var keyBoard = this.gameData.keyBoard;
	if (keyBoard.wasKeyPressed(Keys.Escape) === true ||	keyBoard.wasKeyPressed(Keys.Pause) === true) {
		this.gameData.paused = !this.gameData.paused;
		this.gameData.game.sendMessage(GameMessage.GamePaused);
	}

	// If we're not paused
	if (this.gameData.paused === false) {
		// Update all systems
		for (var i = 1; i < this.systems.length; i++) {
			this.systems[i].update(dt);
		}
	}
}

Game.prototype.render = function () {
	// Clear the canvas
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

	// Restart the console messages at the top row
	this.gameData.console.row = 0;

	// Render all systems
	for (var i = 0; i < this.systems.length; i++) {
		this.systems[i].render();
	}
}

window.onload = function () {
	// Write header to browser console for player stats
	console.log("DateTime,Name,Score,Level,ShotsHit,ShotFired,Accuracy,PlayTime,FuelBurned,HyperSpaceCount");

	// Start the game
	var game = new Game();
	game.initialize();
}
