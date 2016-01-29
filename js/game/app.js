var Droplet = require('./../entities/droplet');
var gameManager = require('./gameManager');

var i = 0;
var space = 70;
for(i=0; i<400; i+=1) {
	gameManager.world.addEntity(new Droplet({
		x: 100 + Math.random() * 4850,
		y: 100 + Math.random() * 4850,
		color: ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'violet'][Math.floor(Math.random()*7)]
	}));
}

gameManager.init('canvas1', 'canvas2', 'canvas3');