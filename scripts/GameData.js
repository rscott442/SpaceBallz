//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function GameData(game, canvas, context, spriteSheet, keyBoard, settings) {
	this.game = game;
	this.canvas = canvas;
	this.context = context;
	this.spriteSheet = spriteSheet;
	this.players = [];
	this.maxPlayers = 4;
	this.players.push(new Player(0));
	this.activePlayer = 0;
	this.keyBoard = keyBoard;
	this.demoMode = true;
	this.paused = false;
	this.botMode = false;
	this.nextID = 0;
	this.numObjects = 0;
	this.console = new Console(this.context);
	this.settings = settings;
	this.highScores = this.settings.getHighScores();
	this.soundEnabled = false;
	this.volume = this.settings.getVolume();
}
