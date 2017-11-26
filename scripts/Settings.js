//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
function Settings() {

}

Settings.prototype.getHighScores = function() {
	// Get and return the high scores
	var highScores = [];
	var data = localStorage.getItem("highScores");
	if (data !== null) {
		var parsed = JSON.parse(data);
		if (parsed.length > 0) {
			if (parsed[0].hasOwnProperty("score")) {
				highScores = parsed;
			}
		}
	}

	return highScores;
}

Settings.prototype.saveHighScores = function (highScores) {
	// Save the high scores
	localStorage.setItem("highScores", JSON.stringify(highScores));
}

Settings.prototype.clearHighScores = function (highScores) {
	// Erase the high scores
	highScores.length = 0;
	localStorage.removeItem("highScores");
}

Settings.prototype.getVolume = function () {
	// Get the saved volume and return it
	var volume = localStorage.getItem("volume");
	if (volume !== null) {
		return parseFloat(volume);
	}
	return 0.1;
}

Settings.prototype.saveVolume = function (volume) {
	// Save the volume
	localStorage.setItem("volume", volume);
}
