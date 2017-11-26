//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function SoundSystem(gameData) {
	BaseSystem.call(this);
	this.gameData = gameData;
	this.audioContext;
	this.sourceList = {};
	this.bufferList = {};
	this.gain;

	// Does this browser support Web Audio API?
	var soundCheck = document.createElement('audio');
	if (soundCheck.canPlayType('audio/ogg;codecs=vorbis') === 'probably') {
		this.gameData.soundEnabled = true;
	}

	// If yes, then initialize the sound system
	if (this.gameData.soundEnabled === true) {
		// Load sounds
		this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
		this.loadSound('alienLargeSound', 'sounds/alien-large.ogg');
		this.loadSound('alienSmallSound', 'sounds/alien-small.ogg');
		this.loadSound('bulletSound', 'sounds/bullet.ogg');
		this.loadSound('explosionSound', 'sounds/explosion.ogg');
		this.loadSound('freeShipSound', 'sounds/freeship.ogg');

		// Create the gain node
		this.gain = this.audioContext.createGain();

		// No sound since we start in demoMode
		this.gain.gain.value = 0;

		// Listen to the visibilitychange event to manage sound volume
		var self = this;
		document.addEventListener('visibilitychange', function () {
			if (document.hidden) {
				// Page is hidden, so mute the volume
				self.gain.gain.value = 0;
			} else {
				// Now the page is visible, so if not paused and not demoMode
				if (self.gameData.paused === false && self.gameData.demoMode === false) {
					// Unmute the volume
					self.gain.gain.value = self.gameData.volume;
				}
			}
		});
	}
}

SoundSystem.prototype = Object.create(BaseSystem.prototype);
SoundSystem.prototype.constructor = SoundSystem;

SoundSystem.prototype.receiveMessage = function (message, parameter) {
	if (this.gameData.soundEnabled === true) {
		switch (message) {

			case GameMessage.StartNewGame:
				this.startNewGame();
				break;

			case GameMessage.GameOver:
				this.gameOver();
				break;

			case GameMessage.GamePaused:
				this.gamePaused();
				break;

			case GameMessage.VolumeDown:
				this.volumeDown();
				break;

			case GameMessage.VolumeUp:
				this.volumeUp();
				break;

			case GameMessage.AlienLargeSoundPlay:
				this.play('alienLargeSound', true);
				break;
			case GameMessage.AlienLargeSoundStop:
				this.stop('alienLargeSound');
				break;
			case GameMessage.AlienSmallSoundPlay:
				this.play('alienSmallSound', true);
				break;
			case GameMessage.AlienSmallSoundStop:
				this.stop('alienSmallSound');
				break;
			case GameMessage.BulletSound:
				this.play('bulletSound');
				break;
			case GameMessage.ExplosionSound:
				this.play('explosionSound');
				break;
			case GameMessage.FreeShipSound:
				this.play('freeShipSound');
				break;
		}
	}
}

SoundSystem.prototype.loadSound = function (key, url) {
	if (this.gameData.soundEnabled === true) {
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		var self = this;

		request.onload = function () {
			self.audioContext.decodeAudioData(request.response,
				function (buffer) {
					self.bufferList[key] = buffer;
				},

			function (e) {
				this.gameData.soundEnabled = false;
				console.log('Error decoding audio file: ', e.err);
			});
		}

		request.onerror = function () {
			this.gameData.soundEnabled = false;
			console.log('Error loading audio file.');
		}

		request.send();
	}
}

SoundSystem.prototype.play = function (key, loop) {
	var source = this.audioContext.createBufferSource();
	this.sourceList[key] = source;
	source.buffer = this.bufferList[key];
	source.loop = (loop === undefined) ? false : loop;

	source.connect(this.gain);
	this.gain.connect(this.audioContext.destination);
	source.start();
}

SoundSystem.prototype.stop = function (key) {
	var source = this.sourceList[key];

	if (source) {
		source.stop();
	}
}

SoundSystem.prototype.startNewGame = function () {
	this.gain.gain.value = this.gameData.volume;
}

SoundSystem.prototype.gameOver = function () {
	this.gain.gain.value = 0;
}

SoundSystem.prototype.gamePaused = function () {
	if (this.gameData.paused === true) {
		this.gain.gain.value = 0;
	}
	else {
		if (this.gameData.demoMode === false) {
			this.gain.gain.value = this.gameData.volume;
		}
	}
}

SoundSystem.prototype.volumeDown = function() {
	this.gameData.volume -= 0.01;

	if(this.gameData.volume < 0)
		this.gameData.volume = 0;

	this.gain.gain.value = this.gameData.volume;
	this.gameData.settings.saveVolume(this.gameData.volume);
}

SoundSystem.prototype.volumeUp = function() {
	this.gameData.volume += 0.01;

	if(this.gameData.volume > 1)
		this.gameData.volume = 1;

	this.gain.gain.value = this.gameData.volume;
	this.gameData.settings.saveVolume(this.gameData.volume);
}
