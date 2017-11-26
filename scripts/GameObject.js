//==============================================================================
// SpaceBallz Copyright © 2017 Robert Scott
// Source code licensed under the terms of the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.txt
//==============================================================================
// Based on ECS system from github.com/erikhazzard/RectangleEater.
//==============================================================================
function GameObject() {
	this.ID = GameObject.prototype.nextID++;
	this.components = {};
}

GameObject.prototype.nextID = 0;

GameObject.prototype.addComponent = function (component) {
	this.components[component.name] = component;
}

GameObject.prototype.removeComponent = function (component) {
	var name = component;
	if (typeof component === 'function') {
		name = component.prototype.name;
	}
	delete this.components[name];
}

GameObject.prototype.print = function () {
	console.log(JSON.stringify(this, null, 4));
}
