var Camera = require('./../world/camera');
var Droplet = require('./../entities/droplet');
var Circle = require('./../entities/circle');
var AICircle = require('./../entities/aiCircle');
var aiStates = require('./../entities/ai/aiStates');
var World = require('./../world/world');
var MouseHandler = require('./../input/mouseHandler');

var gameManager = (function() {
	var canvasGrid = null;
	var canvasEnt = null;
	var canvasQuadtree = null;
	var ctxGrid = null;
	var ctxEnt = null;
	var ctxQuadTree = null;
	
	var dTime = 1 / 60;
	var world = new World({x: 0, y: 0, width: 5000, height: 5000});
	var player = null;
	var drwQuad = 0;
	
	var init = function(cvsGridId, cvsEntId, cvsQuadtree) {
		canvasGrid = document.getElementById(cvsGridId);
		canvasEnt = document.getElementById(cvsEntId);
		canvasQuadtree = document.getElementById(cvsQuadtree);
		ctxGrid = canvasGrid.getContext('2d');
		ctxEnt = canvasEnt.getContext('2d');
		ctxQuadtree = canvasQuadtree.getContext('2d');
		
		fitToContainer(canvasGrid);
		fitToContainer(canvasEnt);
		
		ctxGrid.fillStyle = '#F0FBFF';
		ctxGrid.strokeStyle = '#BFBFBF';
		ctxGrid.lineWidth = 1;
		
		MouseHandler.init(document);
		
		player = new Circle({
			x: 2500,
			y: 2500,
			color: 'red',
			mass: 1000
		});
		
		var aiCirc = new AICircle({
			x: 2500,
			y: 2500,
			color: 'lime',
			mass: 1000,
			world: world
		});
		
		for(var i=0; i <10; i++) {
			world.addEntity(new AICircle({
				x: 100 + Math.random() * 4500,
				y: 100 + Math.random() * 4500,
				color:  ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'violet'][Math.floor(Math.random()*7)],
				mass: 1000,
				world: world
			}));
		}
		
		Camera.init(ctxEnt, player);
		
		world.addEntity(player);
		world.addEntity(aiCirc);
		gameloop();
	};
	
	var handleInput = function() {
		if(MouseHandler.isMouseIn() === false) {
			player.setAttr({ velX: 0, velY: 0 });
			return;
		}
		
		var pAttr = player.getAttr();
		var rPlyrPos = Camera.getRelPos(player.getAttr());
		var mPos = MouseHandler.getPos();
		var dX = mPos.x - rPlyrPos.x;
		var dY = mPos.y - rPlyrPos.y;
		
		var vLength = Math.sqrt( (dX*dX) + (dY*dY) );
		
		var normX = dX / vLength;
		var normY = dY / vLength;
		
		vLength = (vLength > 100)? 100: vLength;
		
		var newVelX = normX * (pAttr.maxVel * (vLength/100));
		var newVelY = normY * (pAttr.maxVel * (vLength/100));
		
		player.setAttr({
			velX: newVelX,
			velY: newVelY
		});
	};
	
	var drawGrid = function() {
		var camPos = Camera.getPos();
		var camSize = Camera.getSize();
		
		var start = Math.floor(camPos.x / 40);
		var relX = Camera.getRelPos({x: (start*40), y: 0}).x;
		
		var numLines = camSize.width / 40;
		var i = 0;
		
		
		ctxGrid.fillRect(0, 0, canvasGrid.width, canvasGrid.height);
		
		for(i=0; i<numLines; i+=1) {
			ctxGrid.beginPath();
			ctxGrid.moveTo(relX + (40 * i), 0);
			ctxGrid.lineTo(relX + (40 * i), camSize.height);
			ctxGrid.stroke();
		}
		
		start = Math.floor(camPos.y / 40);
		var relY = Camera.getRelPos({x: 0, y: (start * 40)}).y;
		numLines = camSize.height / 40;
		
		for(i=0; i<numLines; i+=1) {
			ctxGrid.beginPath();
			ctxGrid.moveTo(0, relY + (40 * i));
			ctxGrid.lineTo(camSize.width, relY + (40 * i));
			ctxGrid.stroke();
		}
	};
	
	var genRandomDroplet = function() {
		world.addEntity(new Droplet({
			x: 20 + Math.random() * (world.borders.width - 20),
			y: 20 + Math.random() * (world.borders.height - 20),
			color: ['red','blue','green','yellow','purple','brown','violet'][Math.floor(Math.random()*7)]
		}));
	};
	
	var handleCollisions = function() {
		var possibleColl = [];
		var collisions = [];
		var coll = null;
		var entity = null;
		var ent = null;
		var entMass = 0;
		var circle = null;
		var crc = null;
		
		for(var i in world.circles) {
			circle = world.circles[i];
			crc = circle.getAttr();
			
			possibleColl = world.getPossibleCollisions(circle);
			
			while(entity = possibleColl.pop()) {
				
				if(circle.intersects(entity)) {
					ent = entity.getAttr();
				
					if(crc.mass > (1.5 * ent.mass)) {
						entity.active = false;
						world.removeEntity(entity);
						circle.incMass(ent.mass);
						genRandomDroplet();
					}
				}
				
			}
		}
	};
	
	var handleBounds = function() {
		world.entityBag.forEach(function(entity) {
			var ent = entity.getAttr();
			var borders = world.borders;
			
			if(entity.getType() !== 'Circle') {
				return;
			}
			
			if((ent.x-ent.radius) < 0) {
				entity.setAttr({x: ent.radius});
			} else if((ent.x+ent.radius) > (borders.x+borders.width)) {
				entity.setAttr({x: (borders.x+borders.width)-ent.radius});
			}
			
			if((ent.y-ent.radius) < 0) {
				entity.setAttr({y: ent.radius});
			} else if((ent.y+ent.radius) > (borders.y+borders.height)) {
				entity.setAttr({y: (borders.y+borders.height)-ent.radius});
			}
		});
	};
	
	var fitToContainer = function(canvas) {
		canvas.style.width='100%';
		canvas.style.height='100%';
		canvas.width  = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
	};
	
	var gameloop = function() {
		var len = world.entityBag.length;
		var i = 0;
		var ent = null;
		
		handleInput();
		Camera.update();
		
		drawGrid();
		
		if(drwQuad === 5) {
			ctxQuadtree.fillStyle = 'white';
			ctxQuadtree.fillRect(0, 0, 250, 250);
			world.qTree.drawTree(ctxQuadtree);
			drwQuad = 0;
		}
		drwQuad += 1;
		
		ctxEnt.clearRect(0, 0, canvasEnt.width, canvasEnt.height)
		
		for(i=0; i<len; i+=1) {
			ent = world.entityBag[i];
			
			if(ent.update) {
				ent.update(dTime);
			}
			
			if(ent.draw) {
				ent.draw(ctxEnt, Camera);
			}
		}
		
		handleCollisions();
		handleBounds();
		
		setTimeout(gameloop, dTime * 1000);
	};
	
	return {
		init: init,
		world: world
	};
}());

module.exports = gameManager;