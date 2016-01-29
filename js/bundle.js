(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Circle = require('./circle');
var aiStates = require('./ai/aiStates');

function AICircle(attr) {
	var newCircle = Circle(attr);
	var world = attr.world || null;
	
	var viewRange2 = 750 * 750;
	var chaseRange2 = 400 * 400;
	var escapeRange2 = 300 * 300;
	var AIState = null;
	
	var setAIState = function(state) {
		if(AIState) {
			AIState.exit();
		}
		AIState = state;
		AIState.enter();
	};
	
	var oldUpdate = newCircle.update;
	
	var update = function(dTime) {
		oldUpdate(dTime);
		AIState.update();
	};
	
	newCircle.viewRange2 = viewRange2;
	newCircle.chaseRange2 = chaseRange2;
	newCircle.escapeRange2 = escapeRange2;
	newCircle.update = update;
	newCircle.setAIState = setAIState;
	
	setAIState(aiStates.lookForFood(world, newCircle));
	
	return newCircle;
}

module.exports = AICircle;
},{"./ai/aiStates":2,"./circle":3}],2:[function(require,module,exports){
var World = require('./../../world/world');

function LookForFood(world, circle) {
	var crcl = circle.getAttr();
	var target = null;
	
	var enter = function() {
		console.log('LookForFood: enter');
	};
	
	var exit = function() {
		console.log('LookForFood: exit');
	};
	
	var update = function() {
		var possibleTgts = null;
		var possibleTarget = null;
		var crcl = circle.getAttr();
		var pt = null;
		var tgt = null;
		var dist2 = 0;
		var closerTarget = null;
		var closerDist = 0;
		
		possibleTgts = world.getPossibleCollisions(circle);
		
		if(possibleTgts.some(function(element) {
			var elmnt = element.getAttr();
			var elType = element.getType();
			var elMass = elmnt.mass;
			var distToElement = World.getDistance2(element, circle);
			
			if(elType !== 'Circle' || distToElement > circle.chaseRange2) {
				return false;
			}
			
			if((elMass) >= crcl.mass && distToElement <= circle.escapeRange2) {
				circle.setAIState(Escape(world, circle, element));
				return true;
			}
			
			if((elMass * 1.5) <= crcl.mass && distToElement <= circle.chaseRange2) {
				circle.setAIState(Chase(world, circle, element));
				return true;
			}
			
		}) ) {
			return;
		}
		
		if(!target) {
			
			closerDist = 9999999999;
			
			while(possibleTarget = possibleTgts.pop()) {
				if(possibleTarget.getType() === 'Circle') {
					continue;
				}
				
				if(closerDist > World.getDistance2(circle, possibleTarget)) {
					closerTarget = possibleTarget;
					closerDist = World.getDistance2(circle, closerTarget);
				}
			}
			
			if(closerDist < circle.viewRange2) {
				target = closerTarget;
			}
		}
		
		if(target === null) {
			return;
		}
		
		if(!target.active) {
			target = null;
			return;
		}
		
		crcl = circle.getAttr();
		tgt = target.getAttr();
		var dX = tgt.x - crcl.x;
		var dY = tgt.y - crcl.y;
		
		var vLength = Math.sqrt( (dX*dX) + (dY*dY) );
		
		var normX = dX / vLength;
		var normY = dY / vLength;
		
		var newVelX = normX * crcl.maxVel;
		var newVelY = normY * crcl.maxVel;
		
		circle.setAttr({
			velX: newVelX,
			velY: newVelY
		});
		
	};
	
	return {
		enter: enter,
		exit: exit,
		update: update
	};
}

function Chase(world, circle, target) {
	var crcl = null;
	var tgt = null;
	
	var enter = function() {
		console.log('Chase: enter');
	};
	
	var exit = function() {
		console.log('Chase: exit');
	};
	
	var update = function() {
		crcl = circle.getAttr();
		tgt = target.getAttr();
		
		if(!target.active ||
			circle.chaseRange2 < World.getDistance2(circle, target) ||
			(tgt.mass * 1.5) >= crcl.mass) {
			
			circle.setAIState(LookForFood(world, circle));
			return;
		}

		var dX = tgt.x - crcl.x;
		var dY = tgt.y - crcl.y;
		
		var vLength = Math.sqrt( (dX*dX) + (dY*dY) );
		
		var normX = dX / vLength;
		var normY = dY / vLength;
		
		var newVelX = normX * crcl.maxVel;
		var newVelY = normY * crcl.maxVel;
		
		circle.setAttr({
			velX: newVelX,
			velY: newVelY
		});
	};
	
	return {
		enter: enter,
		exit: exit,
		update: update
	};
}

function Escape(world, circle, target) {
	var crcl = null;
	var tgt = null;
	
	var enter = function() {
		console.log('Escape: enter');
	};
	
	var exit = function() {
		console.log('Escape: exit');
	};
	
	var update = function() {
		crcl = circle.getAttr();
		tgt = target.getAttr();
	
		if(!target.active ||
			circle.chaseRange2 < World.getDistance2(circle, target) ||
			(tgt.mass / 1.5) <= crcl.mass ) {
			
			circle.setAIState(LookForFood(world, circle));
			return;
		}
		
		var dX = tgt.x - crcl.x;
		var dY = tgt.y - crcl.y;
		
		var vLength = Math.sqrt( (dX*dX) + (dY*dY) );
		
		var normX = dX / vLength;
		var normY = dY / vLength;
		
		var newVelX = normX * crcl.maxVel;
		var newVelY = normY * crcl.maxVel;
		
		circle.setAttr({
			velX: -newVelX,
			velY: -newVelY
		});
	};
	
	return {
		enter: enter,
		exit: exit,
		update: update
	};
}

exports.lookForFood = LookForFood;
exports.chase = Chase;
exports.escape = Escape;
},{"./../../world/world":10}],3:[function(require,module,exports){
function Circle(attr) {
	attr = attr || {};
	
	var x = attr.x || 0;
	var y = attr.y || 0;
	var mass = attr.mass || 500;
	var color = attr.color || 'white';
	var borderColor = attr.borderColor || 'black';
	var velX = attr.velX || 0;
	var velY = attr.velY || 0;
	var type = 'Circle';
	var active = true;
	
	var maxVel = 200 * (200 / Math.sqrt(mass));
	var radius = Math.sqrt( mass / Math.PI ); //1 unit of area === 1 unit of mass
	
	var getType = function () {
		return type;
	};
	
	var getAttr = function() {
		return {
			x: x,
			y: y,
			mass: mass,
			radius: radius,
			color: color,
			velX: velX,
			velY: velY,
			maxVel: maxVel,
			type: type
		};
	};
	
	var setAttr = function(attr) {
		x = (attr.x !== undefined)? attr.x: x;
		y = (attr.y !== undefined)? attr.y: y;
		mass = (attr.mass !== undefined)? attr.mass: mass;
		color = (attr.color !== undefined)? attr.color: color;
		velX = (attr.velX !== undefined)? attr.velX: velX;
		velY = (attr.velY !== undefined)? attr.velY: velY;
	};
	
	var incMass = function(dMass) {
		mass += dMass;
		maxVel = 200 * (200 / Math.sqrt(mass));
		radius = Math.sqrt( mass / Math.PI );
	};
	
	var intersects = function(ent2) {
		var ent2Attr = ent2.getAttr();
		
		var dx2 = Math.pow(ent2Attr.x - x, 2);
		var dy2 = Math.pow(ent2Attr.y - y, 2);
		var dist2 = dx2 + dy2;
		var maxRadius2 = Math.pow(ent2Attr.radius + radius, 2);
		
		return (dist2 < maxRadius2);
	};
	
	var draw = function(ctx, cam) {
		var camSize = cam.getSize();
		var rPos = cam.getRelPos(getAttr());
		
		//if outside Cam view
		if((rPos.x + radius) <  0 || (rPos.y + radius) <  0 || (rPos.x - radius) >  camSize.width || (rPos.y - radius) > camSize.height) {
			return;
		}
		
		ctx.fillStyle = color;
		ctx.strokeStyle = borderColor;
		ctx.lineWidth = 5;
		
		ctx.beginPath();
		ctx.arc(rPos.x, rPos.y, radius, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.stroke();
	};
	
	var update = function(dTime) {
		x += velX * dTime;
		y += velY * dTime;
	};
	
	var getBounds = function() {
		return {
			x: x-radius,
			y: y-radius,
			width: radius*2,
			height: radius*2,
		};
	};
	
	return {
		getType: getType,
		getBounds: getBounds,
		getAttr: getAttr,
		setAttr: setAttr,
		incMass: incMass,
		intersects: intersects,
		draw: draw,
		update: update,
		active: active
	};
}

module.exports = Circle;
},{}],4:[function(require,module,exports){
function Droplet(attr) {
	attr = attr || {};
	
	var x = attr.x || 0;
	var y = attr.y || 0;
	var mass = attr.mass || 500;
	var color = attr.color || 'white';
	var type = 'Droplet';
	var active = true;
	
	var radius = Math.sqrt( mass / Math.PI ); //1 unit of area === 1 unit of mass
	
	var getType = function() {
		return type;
	};
	
	var getAttr = function() {
		return {
			x: x,
			y: y,
			mass: mass,
			radius: radius,
			color: color,
			type: type
		};
	};
	
	var intersects = function(ent2) {
		var ent2Attr = ent2.getAttr();
		
		var dx2 = Math.pow(ent2Attr.x - x, 2);
		var dy2 = Math.pow(ent2Attr.y - y, 2);
		var dist2 = dx2 + dy2;
		var maxRadius2 = Math.pow(ent2Attr.radius + radius, 2);
		
		return (dist2 < maxRadius2);
	};
	
	var draw = function(ctx, cam) {
		var camSize = cam.getSize();
		var rPos = cam.getRelPos(getAttr());
		
		//if outside Cam view
		if((rPos.x + radius) <  0 || (rPos.y + radius) <  0 || (rPos.x - radius) >  camSize.width || (rPos.y - radius) > camSize.height) {
			return;
		}
		
		ctx.fillStyle = color;
		ctx.lineWidth = 5;
		
		ctx.beginPath();
		ctx.arc(rPos.x, rPos.y, radius, 0, 2 * Math.PI, false);
		ctx.fill();
	};
	
	var getBounds = function() {
		return {
			x: x-radius,
			y: y-radius,
			width: radius*2,
			height: radius*2,
		};
	};
	
	return {
		getType: getType,
		getAttr: getAttr,
		intersects: intersects,
		draw: draw,
		getBounds: getBounds,
		active: active
	};
}

module.exports = Droplet;
},{}],5:[function(require,module,exports){
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
},{"./../entities/droplet":4,"./gameManager":6}],6:[function(require,module,exports){
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
},{"./../entities/ai/aiStates":2,"./../entities/aiCircle":1,"./../entities/circle":3,"./../entities/droplet":4,"./../input/mouseHandler":7,"./../world/camera":9,"./../world/world":10}],7:[function(require,module,exports){
var MouseHandler = (function() {
	var x = 0;
	var y = 0;
	var mouseIn = false;
	
	var init = function(eventSrc) {
		eventSrc.addEventListener('mousemove', onMouseMove);
		eventSrc.addEventListener('mouseout', onMouseOut);
		eventSrc.addEventListener('mouseover', onMouseOver);
	};
	
	var onMouseOut  = function() {
		mouseIn = false;
	};
	
	var onMouseOver = function() {
		mouseIn = true;
	};
	
	var onMouseMove = function(e) {
		x = e.clientX;
		y = e.clientY;
	};
	
	var getPos = function() {
		return {
			x: x,
			y: y
		};
	};
	
	var isMouseIn = function() {
		return mouseIn;
	};
	
	return {
		init: init,
		getPos: getPos,
		isMouseIn: isMouseIn
	};
}());

module.exports = MouseHandler;
},{}],8:[function(require,module,exports){
function Quadtree(lvl, bnds) {
    var level = lvl;
    var bounds = bnds;
    var objects = [];
    var nodes = [];
    
	var MAX_OBJECTS = 5;
	var MAX_LEVEL = 5;
	
    var xMiddle = bounds.x + (bounds.width / 2);
    var yMiddle = bounds.y + (bounds.height / 2);
    
	var clear = function() {
		objects = [];
		nodes = [];
	};
	
    var split = function() {
        nodes[0] = new Quadtree(level+1, {x: xMiddle, y: bounds.y , width: bounds.width/2, height: bounds.height/2});
        nodes[1] = new Quadtree(level+1, {x: bounds.x, y: bounds.y, width: bounds.width/2, height: bounds.height/2});
        nodes[2] = new Quadtree(level+1, {x: bounds.x, y: yMiddle, width: bounds.width/2, height: bounds.height/2});
        nodes[3] = new Quadtree(level+1, {x: xMiddle, y: yMiddle, width: bounds.width/2, height: bounds.height/2});
    };
    
    var getIndex = function(rec) {
        var top = (rec.y > bounds.y && (rec.y+rec.height) < yMiddle);
        var bottom = (rec.y > yMiddle && (rec.y+rec.height) < (bounds.y+bounds.height));
        
        if(rec.x > bounds.x && (rec.x+rec.width) < xMiddle) {
            if(top) {
                return 1;
            } else if(bottom) {//LEFT
                return 2;
            }
        } else if(rec.x > xMiddle && (rec.x+rec.width) < (bounds.x+bounds.width)) {
            if(top) {
                return 0;
            } else if(bottom) {//RIGHT
                return 3;
            }
        }        
        return -1;
    };
    
    var insert = function(ent) {
		var rec = ent.getBounds();
        var index = getIndex(rec);
        var len = 0;
        var i = 0;
        
        if(nodes[0] && index !== -1) {
            nodes[index].insert(ent);
            return;
        }
        
        objects.push(ent);
        
        if(objects.length > MAX_OBJECTS && level < MAX_LEVEL) {
            if(!nodes[0]) {
                split();
            }
            
            len = objects.length;
            while(i < objects.length) {
                index = getIndex(objects[i].getBounds());
                
                if(index !== -1) {
                    nodes[index].insert(objects[i]);
                    objects.splice(i, 1);
                } else {
                    i += 1;
                }
            }
            
        }
    };
    
	var retrieve = function (list, ent) {
		var rec1 = bounds;
		var rec2 = ent.getBounds();
		
		if(rec2.x < (rec1.x+rec1.width)  && (rec2.x+rec2.width)  > rec1.x &&
		   rec2.y < (rec1.y+rec1.height) && (rec2.y+rec2.height) > rec1.y) {
			
			for(var o in objects) {
				if(objects[o] !== ent) {
					list.push(objects[o]);
				}
			}
			
			if(nodes.length) {
				nodes[0].retrieve(list, ent);
				nodes[1].retrieve(list, ent);
				nodes[2].retrieve(list, ent);
				nodes[3].retrieve(list, ent);
			}
		}
		
		return list;
	};
	
	var drawTree = function(ctx) {
		draw(ctx);
		if(nodes[0]) {
			nodes[0].drawTree(ctx);
			nodes[1].drawTree(ctx);
			nodes[2].drawTree(ctx);
			nodes[3].drawTree(ctx);
		}
	};
	
	var draw = function(ctx) {
		var entAttr = null
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
		ctx.strokeRect(bounds.x/20, bounds.y/20, bounds.width/20, bounds.height/20);
		
		ctx.fillStyle = 'gray';
		for(o in objects) {
			entAttr = objects[o].getAttr();
			ctx.fillRect(entAttr.x/20, entAttr.y/20, 3, 3);
		}
	};
	
    var toString = function() {
        return '('+bounds.x+','+bounds.y+')'+'['+bounds.width+','+bounds.height+']';
    };
    
    return {
        clear: clear,
        insert: insert,
        retrieve: retrieve,
		drawTree: drawTree,
        toString: toString,
    };
}

module.exports = Quadtree;
},{}],9:[function(require,module,exports){
var Camera = (function() {
	var x = 0;
	var y = 0;
	var width = 0;
	var height = 0;
	var ctx = null;
	var player = null;
	
	
	var init = function(_ctx, plyr) {
		ctx = _ctx;
		player = plyr;
		width = ctx.canvas.width;
		height = ctx.canvas.height;
	};
	
	var update = function() {
		width = ctx.canvas.width;
		height = ctx.canvas.height;
		
		var plyrAttr = player.getAttr();
		x = (plyrAttr.x - width / 2);
		y = (plyrAttr.y - height / 2);
	};
	
	var getRelPos = function(entAttr) {
		
		var relX = entAttr.x - x;
		var relY = entAttr.y - y;
		
		return {
			x: relX,
			y: relY
		};
	};
	
	var getPos = function() {
		return {
			x: x,
			y: y
		};
	};
	
	var getSize = function() {
		return {
			width: width,
			height: height
		};
	};
	
	return {
		init: init,
		update: update,
		getRelPos: getRelPos,
		getPos: getPos,
		getSize: getSize
	};
}());

module.exports = Camera;
},{}],10:[function(require,module,exports){
var Quadtree = require('./../util/quadtree');

function World(brds) {//derp
	
	var borders = brds;
	var entityBag = [];
	var qTree = new Quadtree(0, borders);
	var circles = [];
	
	var addEntity = function(entity) {
		var ent = entity.getAttr();
		
		entityBag.push(entity);
		if(ent.type && ent.type === 'Circle') {
			circles.push(entity);
		}
	};
	
	var removeEntity = function(entity) {
		var ent = entity.getAttr();
		var len =  entityBag.length;
		var i = 0;
		var indx = -1;
		
		if(ent.type && ent.type === 'Circle') {
			if((indx = circles.indexOf(entity)) !== -1) {
				circles.splice(indx, 1);
			}
		}
		
		for(i=0; i<len; i+=1) {
			if(entity === entityBag[i]) {
				entityBag.splice(i, 1);
				return;
			}
		}
	};
	
	var regenQT = function() {
		qTree.clear();
		
		entityBag.forEach(function(ent) {
			qTree.insert(ent);
		});
	};
	
	var getPossibleCollisions = function(entityToTest) {
		regenQT();
		return qTree.retrieve([], entityToTest);
	};
	
	var draw = function(ctx) {
		qt.draw(ctx);
	};
	
	return {
		addEntity: addEntity,
		removeEntity: removeEntity,
		getPossibleCollisions: getPossibleCollisions,
		qTree: qTree,
		entityBag: entityBag,
		borders: borders,
		draw: draw,
		circles: circles
	};
}

World.getDistance2 = function(entity1, entity2) {
	var ent1 = entity1.getAttr();
	var ent2 = entity2.getAttr();
	var distance2 = Math.pow(ent1.x - ent2.x, 2) + Math.pow(ent1.y - ent2.y, 2);
		
	return distance2;
};

module.exports = World;
},{"./../util/quadtree":8}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcSUJNX0FETUlOXFxEZXNrdG9wXFxDaXJjbGVzXFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9JQk1fQURNSU4vRGVza3RvcC9DaXJjbGVzL3NyYy9qcy9jb20vaXZtL2VudGl0aWVzL2FpQ2lyY2xlLmpzIiwiQzovVXNlcnMvSUJNX0FETUlOL0Rlc2t0b3AvQ2lyY2xlcy9zcmMvanMvY29tL2l2bS9lbnRpdGllcy9haS9haVN0YXRlcy5qcyIsIkM6L1VzZXJzL0lCTV9BRE1JTi9EZXNrdG9wL0NpcmNsZXMvc3JjL2pzL2NvbS9pdm0vZW50aXRpZXMvY2lyY2xlLmpzIiwiQzovVXNlcnMvSUJNX0FETUlOL0Rlc2t0b3AvQ2lyY2xlcy9zcmMvanMvY29tL2l2bS9lbnRpdGllcy9kcm9wbGV0LmpzIiwiQzovVXNlcnMvSUJNX0FETUlOL0Rlc2t0b3AvQ2lyY2xlcy9zcmMvanMvY29tL2l2bS9nYW1lL2Zha2VfNGMxY2VlOTkuanMiLCJDOi9Vc2Vycy9JQk1fQURNSU4vRGVza3RvcC9DaXJjbGVzL3NyYy9qcy9jb20vaXZtL2dhbWUvZ2FtZU1hbmFnZXIuanMiLCJDOi9Vc2Vycy9JQk1fQURNSU4vRGVza3RvcC9DaXJjbGVzL3NyYy9qcy9jb20vaXZtL2lucHV0L21vdXNlSGFuZGxlci5qcyIsIkM6L1VzZXJzL0lCTV9BRE1JTi9EZXNrdG9wL0NpcmNsZXMvc3JjL2pzL2NvbS9pdm0vdXRpbC9xdWFkdHJlZS5qcyIsIkM6L1VzZXJzL0lCTV9BRE1JTi9EZXNrdG9wL0NpcmNsZXMvc3JjL2pzL2NvbS9pdm0vd29ybGQvY2FtZXJhLmpzIiwiQzovVXNlcnMvSUJNX0FETUlOL0Rlc2t0b3AvQ2lyY2xlcy9zcmMvanMvY29tL2l2bS93b3JsZC93b3JsZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIENpcmNsZSA9IHJlcXVpcmUoJy4vY2lyY2xlJyk7XHJcbnZhciBhaVN0YXRlcyA9IHJlcXVpcmUoJy4vYWkvYWlTdGF0ZXMnKTtcclxuXHJcbmZ1bmN0aW9uIEFJQ2lyY2xlKGF0dHIpIHtcclxuXHR2YXIgbmV3Q2lyY2xlID0gQ2lyY2xlKGF0dHIpO1xyXG5cdHZhciB3b3JsZCA9IGF0dHIud29ybGQgfHwgbnVsbDtcclxuXHRcclxuXHR2YXIgdmlld1JhbmdlMiA9IDc1MCAqIDc1MDtcclxuXHR2YXIgY2hhc2VSYW5nZTIgPSA0MDAgKiA0MDA7XHJcblx0dmFyIGVzY2FwZVJhbmdlMiA9IDMwMCAqIDMwMDtcclxuXHR2YXIgQUlTdGF0ZSA9IG51bGw7XHJcblx0XHJcblx0dmFyIHNldEFJU3RhdGUgPSBmdW5jdGlvbihzdGF0ZSkge1xyXG5cdFx0aWYoQUlTdGF0ZSkge1xyXG5cdFx0XHRBSVN0YXRlLmV4aXQoKTtcclxuXHRcdH1cclxuXHRcdEFJU3RhdGUgPSBzdGF0ZTtcclxuXHRcdEFJU3RhdGUuZW50ZXIoKTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBvbGRVcGRhdGUgPSBuZXdDaXJjbGUudXBkYXRlO1xyXG5cdFxyXG5cdHZhciB1cGRhdGUgPSBmdW5jdGlvbihkVGltZSkge1xyXG5cdFx0b2xkVXBkYXRlKGRUaW1lKTtcclxuXHRcdEFJU3RhdGUudXBkYXRlKCk7XHJcblx0fTtcclxuXHRcclxuXHRuZXdDaXJjbGUudmlld1JhbmdlMiA9IHZpZXdSYW5nZTI7XHJcblx0bmV3Q2lyY2xlLmNoYXNlUmFuZ2UyID0gY2hhc2VSYW5nZTI7XHJcblx0bmV3Q2lyY2xlLmVzY2FwZVJhbmdlMiA9IGVzY2FwZVJhbmdlMjtcclxuXHRuZXdDaXJjbGUudXBkYXRlID0gdXBkYXRlO1xyXG5cdG5ld0NpcmNsZS5zZXRBSVN0YXRlID0gc2V0QUlTdGF0ZTtcclxuXHRcclxuXHRzZXRBSVN0YXRlKGFpU3RhdGVzLmxvb2tGb3JGb29kKHdvcmxkLCBuZXdDaXJjbGUpKTtcclxuXHRcclxuXHRyZXR1cm4gbmV3Q2lyY2xlO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFJQ2lyY2xlOyIsInZhciBXb3JsZCA9IHJlcXVpcmUoJy4vLi4vLi4vd29ybGQvd29ybGQnKTtcclxuXHJcbmZ1bmN0aW9uIExvb2tGb3JGb29kKHdvcmxkLCBjaXJjbGUpIHtcclxuXHR2YXIgY3JjbCA9IGNpcmNsZS5nZXRBdHRyKCk7XHJcblx0dmFyIHRhcmdldCA9IG51bGw7XHJcblx0XHJcblx0dmFyIGVudGVyID0gZnVuY3Rpb24oKSB7XHJcblx0XHRjb25zb2xlLmxvZygnTG9va0ZvckZvb2Q6IGVudGVyJyk7XHJcblx0fTtcclxuXHRcclxuXHR2YXIgZXhpdCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Y29uc29sZS5sb2coJ0xvb2tGb3JGb29kOiBleGl0Jyk7XHJcblx0fTtcclxuXHRcclxuXHR2YXIgdXBkYXRlID0gZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgcG9zc2libGVUZ3RzID0gbnVsbDtcclxuXHRcdHZhciBwb3NzaWJsZVRhcmdldCA9IG51bGw7XHJcblx0XHR2YXIgY3JjbCA9IGNpcmNsZS5nZXRBdHRyKCk7XHJcblx0XHR2YXIgcHQgPSBudWxsO1xyXG5cdFx0dmFyIHRndCA9IG51bGw7XHJcblx0XHR2YXIgZGlzdDIgPSAwO1xyXG5cdFx0dmFyIGNsb3NlclRhcmdldCA9IG51bGw7XHJcblx0XHR2YXIgY2xvc2VyRGlzdCA9IDA7XHJcblx0XHRcclxuXHRcdHBvc3NpYmxlVGd0cyA9IHdvcmxkLmdldFBvc3NpYmxlQ29sbGlzaW9ucyhjaXJjbGUpO1xyXG5cdFx0XHJcblx0XHRpZihwb3NzaWJsZVRndHMuc29tZShmdW5jdGlvbihlbGVtZW50KSB7XHJcblx0XHRcdHZhciBlbG1udCA9IGVsZW1lbnQuZ2V0QXR0cigpO1xyXG5cdFx0XHR2YXIgZWxUeXBlID0gZWxlbWVudC5nZXRUeXBlKCk7XHJcblx0XHRcdHZhciBlbE1hc3MgPSBlbG1udC5tYXNzO1xyXG5cdFx0XHR2YXIgZGlzdFRvRWxlbWVudCA9IFdvcmxkLmdldERpc3RhbmNlMihlbGVtZW50LCBjaXJjbGUpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoZWxUeXBlICE9PSAnQ2lyY2xlJyB8fCBkaXN0VG9FbGVtZW50ID4gY2lyY2xlLmNoYXNlUmFuZ2UyKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZigoZWxNYXNzKSA+PSBjcmNsLm1hc3MgJiYgZGlzdFRvRWxlbWVudCA8PSBjaXJjbGUuZXNjYXBlUmFuZ2UyKSB7XHJcblx0XHRcdFx0Y2lyY2xlLnNldEFJU3RhdGUoRXNjYXBlKHdvcmxkLCBjaXJjbGUsIGVsZW1lbnQpKTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYoKGVsTWFzcyAqIDEuNSkgPD0gY3JjbC5tYXNzICYmIGRpc3RUb0VsZW1lbnQgPD0gY2lyY2xlLmNoYXNlUmFuZ2UyKSB7XHJcblx0XHRcdFx0Y2lyY2xlLnNldEFJU3RhdGUoQ2hhc2Uod29ybGQsIGNpcmNsZSwgZWxlbWVudCkpO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0fSkgKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoIXRhcmdldCkge1xyXG5cdFx0XHRcclxuXHRcdFx0Y2xvc2VyRGlzdCA9IDk5OTk5OTk5OTk7XHJcblx0XHRcdFxyXG5cdFx0XHR3aGlsZShwb3NzaWJsZVRhcmdldCA9IHBvc3NpYmxlVGd0cy5wb3AoKSkge1xyXG5cdFx0XHRcdGlmKHBvc3NpYmxlVGFyZ2V0LmdldFR5cGUoKSA9PT0gJ0NpcmNsZScpIHtcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihjbG9zZXJEaXN0ID4gV29ybGQuZ2V0RGlzdGFuY2UyKGNpcmNsZSwgcG9zc2libGVUYXJnZXQpKSB7XHJcblx0XHRcdFx0XHRjbG9zZXJUYXJnZXQgPSBwb3NzaWJsZVRhcmdldDtcclxuXHRcdFx0XHRcdGNsb3NlckRpc3QgPSBXb3JsZC5nZXREaXN0YW5jZTIoY2lyY2xlLCBjbG9zZXJUYXJnZXQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYoY2xvc2VyRGlzdCA8IGNpcmNsZS52aWV3UmFuZ2UyKSB7XHJcblx0XHRcdFx0dGFyZ2V0ID0gY2xvc2VyVGFyZ2V0O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKHRhcmdldCA9PT0gbnVsbCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKCF0YXJnZXQuYWN0aXZlKSB7XHJcblx0XHRcdHRhcmdldCA9IG51bGw7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Y3JjbCA9IGNpcmNsZS5nZXRBdHRyKCk7XHJcblx0XHR0Z3QgPSB0YXJnZXQuZ2V0QXR0cigpO1xyXG5cdFx0dmFyIGRYID0gdGd0LnggLSBjcmNsLng7XHJcblx0XHR2YXIgZFkgPSB0Z3QueSAtIGNyY2wueTtcclxuXHRcdFxyXG5cdFx0dmFyIHZMZW5ndGggPSBNYXRoLnNxcnQoIChkWCpkWCkgKyAoZFkqZFkpICk7XHJcblx0XHRcclxuXHRcdHZhciBub3JtWCA9IGRYIC8gdkxlbmd0aDtcclxuXHRcdHZhciBub3JtWSA9IGRZIC8gdkxlbmd0aDtcclxuXHRcdFxyXG5cdFx0dmFyIG5ld1ZlbFggPSBub3JtWCAqIGNyY2wubWF4VmVsO1xyXG5cdFx0dmFyIG5ld1ZlbFkgPSBub3JtWSAqIGNyY2wubWF4VmVsO1xyXG5cdFx0XHJcblx0XHRjaXJjbGUuc2V0QXR0cih7XHJcblx0XHRcdHZlbFg6IG5ld1ZlbFgsXHJcblx0XHRcdHZlbFk6IG5ld1ZlbFlcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0fTtcclxuXHRcclxuXHRyZXR1cm4ge1xyXG5cdFx0ZW50ZXI6IGVudGVyLFxyXG5cdFx0ZXhpdDogZXhpdCxcclxuXHRcdHVwZGF0ZTogdXBkYXRlXHJcblx0fTtcclxufVxyXG5cclxuZnVuY3Rpb24gQ2hhc2Uod29ybGQsIGNpcmNsZSwgdGFyZ2V0KSB7XHJcblx0dmFyIGNyY2wgPSBudWxsO1xyXG5cdHZhciB0Z3QgPSBudWxsO1xyXG5cdFxyXG5cdHZhciBlbnRlciA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Y29uc29sZS5sb2coJ0NoYXNlOiBlbnRlcicpO1xyXG5cdH07XHJcblx0XHJcblx0dmFyIGV4aXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdGNvbnNvbGUubG9nKCdDaGFzZTogZXhpdCcpO1xyXG5cdH07XHJcblx0XHJcblx0dmFyIHVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Y3JjbCA9IGNpcmNsZS5nZXRBdHRyKCk7XHJcblx0XHR0Z3QgPSB0YXJnZXQuZ2V0QXR0cigpO1xyXG5cdFx0XHJcblx0XHRpZighdGFyZ2V0LmFjdGl2ZSB8fFxyXG5cdFx0XHRjaXJjbGUuY2hhc2VSYW5nZTIgPCBXb3JsZC5nZXREaXN0YW5jZTIoY2lyY2xlLCB0YXJnZXQpIHx8XHJcblx0XHRcdCh0Z3QubWFzcyAqIDEuNSkgPj0gY3JjbC5tYXNzKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRjaXJjbGUuc2V0QUlTdGF0ZShMb29rRm9yRm9vZCh3b3JsZCwgY2lyY2xlKSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZFggPSB0Z3QueCAtIGNyY2wueDtcclxuXHRcdHZhciBkWSA9IHRndC55IC0gY3JjbC55O1xyXG5cdFx0XHJcblx0XHR2YXIgdkxlbmd0aCA9IE1hdGguc3FydCggKGRYKmRYKSArIChkWSpkWSkgKTtcclxuXHRcdFxyXG5cdFx0dmFyIG5vcm1YID0gZFggLyB2TGVuZ3RoO1xyXG5cdFx0dmFyIG5vcm1ZID0gZFkgLyB2TGVuZ3RoO1xyXG5cdFx0XHJcblx0XHR2YXIgbmV3VmVsWCA9IG5vcm1YICogY3JjbC5tYXhWZWw7XHJcblx0XHR2YXIgbmV3VmVsWSA9IG5vcm1ZICogY3JjbC5tYXhWZWw7XHJcblx0XHRcclxuXHRcdGNpcmNsZS5zZXRBdHRyKHtcclxuXHRcdFx0dmVsWDogbmV3VmVsWCxcclxuXHRcdFx0dmVsWTogbmV3VmVsWVxyXG5cdFx0fSk7XHJcblx0fTtcclxuXHRcclxuXHRyZXR1cm4ge1xyXG5cdFx0ZW50ZXI6IGVudGVyLFxyXG5cdFx0ZXhpdDogZXhpdCxcclxuXHRcdHVwZGF0ZTogdXBkYXRlXHJcblx0fTtcclxufVxyXG5cclxuZnVuY3Rpb24gRXNjYXBlKHdvcmxkLCBjaXJjbGUsIHRhcmdldCkge1xyXG5cdHZhciBjcmNsID0gbnVsbDtcclxuXHR2YXIgdGd0ID0gbnVsbDtcclxuXHRcclxuXHR2YXIgZW50ZXIgPSBmdW5jdGlvbigpIHtcclxuXHRcdGNvbnNvbGUubG9nKCdFc2NhcGU6IGVudGVyJyk7XHJcblx0fTtcclxuXHRcclxuXHR2YXIgZXhpdCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Y29uc29sZS5sb2coJ0VzY2FwZTogZXhpdCcpO1xyXG5cdH07XHJcblx0XHJcblx0dmFyIHVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Y3JjbCA9IGNpcmNsZS5nZXRBdHRyKCk7XHJcblx0XHR0Z3QgPSB0YXJnZXQuZ2V0QXR0cigpO1xyXG5cdFxyXG5cdFx0aWYoIXRhcmdldC5hY3RpdmUgfHxcclxuXHRcdFx0Y2lyY2xlLmNoYXNlUmFuZ2UyIDwgV29ybGQuZ2V0RGlzdGFuY2UyKGNpcmNsZSwgdGFyZ2V0KSB8fFxyXG5cdFx0XHQodGd0Lm1hc3MgLyAxLjUpIDw9IGNyY2wubWFzcyApIHtcclxuXHRcdFx0XHJcblx0XHRcdGNpcmNsZS5zZXRBSVN0YXRlKExvb2tGb3JGb29kKHdvcmxkLCBjaXJjbGUpKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR2YXIgZFggPSB0Z3QueCAtIGNyY2wueDtcclxuXHRcdHZhciBkWSA9IHRndC55IC0gY3JjbC55O1xyXG5cdFx0XHJcblx0XHR2YXIgdkxlbmd0aCA9IE1hdGguc3FydCggKGRYKmRYKSArIChkWSpkWSkgKTtcclxuXHRcdFxyXG5cdFx0dmFyIG5vcm1YID0gZFggLyB2TGVuZ3RoO1xyXG5cdFx0dmFyIG5vcm1ZID0gZFkgLyB2TGVuZ3RoO1xyXG5cdFx0XHJcblx0XHR2YXIgbmV3VmVsWCA9IG5vcm1YICogY3JjbC5tYXhWZWw7XHJcblx0XHR2YXIgbmV3VmVsWSA9IG5vcm1ZICogY3JjbC5tYXhWZWw7XHJcblx0XHRcclxuXHRcdGNpcmNsZS5zZXRBdHRyKHtcclxuXHRcdFx0dmVsWDogLW5ld1ZlbFgsXHJcblx0XHRcdHZlbFk6IC1uZXdWZWxZXHJcblx0XHR9KTtcclxuXHR9O1xyXG5cdFxyXG5cdHJldHVybiB7XHJcblx0XHRlbnRlcjogZW50ZXIsXHJcblx0XHRleGl0OiBleGl0LFxyXG5cdFx0dXBkYXRlOiB1cGRhdGVcclxuXHR9O1xyXG59XHJcblxyXG5leHBvcnRzLmxvb2tGb3JGb29kID0gTG9va0ZvckZvb2Q7XHJcbmV4cG9ydHMuY2hhc2UgPSBDaGFzZTtcclxuZXhwb3J0cy5lc2NhcGUgPSBFc2NhcGU7IiwiZnVuY3Rpb24gQ2lyY2xlKGF0dHIpIHtcclxuXHRhdHRyID0gYXR0ciB8fCB7fTtcclxuXHRcclxuXHR2YXIgeCA9IGF0dHIueCB8fCAwO1xyXG5cdHZhciB5ID0gYXR0ci55IHx8IDA7XHJcblx0dmFyIG1hc3MgPSBhdHRyLm1hc3MgfHwgNTAwO1xyXG5cdHZhciBjb2xvciA9IGF0dHIuY29sb3IgfHwgJ3doaXRlJztcclxuXHR2YXIgYm9yZGVyQ29sb3IgPSBhdHRyLmJvcmRlckNvbG9yIHx8ICdibGFjayc7XHJcblx0dmFyIHZlbFggPSBhdHRyLnZlbFggfHwgMDtcclxuXHR2YXIgdmVsWSA9IGF0dHIudmVsWSB8fCAwO1xyXG5cdHZhciB0eXBlID0gJ0NpcmNsZSc7XHJcblx0dmFyIGFjdGl2ZSA9IHRydWU7XHJcblx0XHJcblx0dmFyIG1heFZlbCA9IDIwMCAqICgyMDAgLyBNYXRoLnNxcnQobWFzcykpO1xyXG5cdHZhciByYWRpdXMgPSBNYXRoLnNxcnQoIG1hc3MgLyBNYXRoLlBJICk7IC8vMSB1bml0IG9mIGFyZWEgPT09IDEgdW5pdCBvZiBtYXNzXHJcblx0XHJcblx0dmFyIGdldFR5cGUgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdHlwZTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBnZXRBdHRyID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR4OiB4LFxyXG5cdFx0XHR5OiB5LFxyXG5cdFx0XHRtYXNzOiBtYXNzLFxyXG5cdFx0XHRyYWRpdXM6IHJhZGl1cyxcclxuXHRcdFx0Y29sb3I6IGNvbG9yLFxyXG5cdFx0XHR2ZWxYOiB2ZWxYLFxyXG5cdFx0XHR2ZWxZOiB2ZWxZLFxyXG5cdFx0XHRtYXhWZWw6IG1heFZlbCxcclxuXHRcdFx0dHlwZTogdHlwZVxyXG5cdFx0fTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBzZXRBdHRyID0gZnVuY3Rpb24oYXR0cikge1xyXG5cdFx0eCA9IChhdHRyLnggIT09IHVuZGVmaW5lZCk/IGF0dHIueDogeDtcclxuXHRcdHkgPSAoYXR0ci55ICE9PSB1bmRlZmluZWQpPyBhdHRyLnk6IHk7XHJcblx0XHRtYXNzID0gKGF0dHIubWFzcyAhPT0gdW5kZWZpbmVkKT8gYXR0ci5tYXNzOiBtYXNzO1xyXG5cdFx0Y29sb3IgPSAoYXR0ci5jb2xvciAhPT0gdW5kZWZpbmVkKT8gYXR0ci5jb2xvcjogY29sb3I7XHJcblx0XHR2ZWxYID0gKGF0dHIudmVsWCAhPT0gdW5kZWZpbmVkKT8gYXR0ci52ZWxYOiB2ZWxYO1xyXG5cdFx0dmVsWSA9IChhdHRyLnZlbFkgIT09IHVuZGVmaW5lZCk/IGF0dHIudmVsWTogdmVsWTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBpbmNNYXNzID0gZnVuY3Rpb24oZE1hc3MpIHtcclxuXHRcdG1hc3MgKz0gZE1hc3M7XHJcblx0XHRtYXhWZWwgPSAyMDAgKiAoMjAwIC8gTWF0aC5zcXJ0KG1hc3MpKTtcclxuXHRcdHJhZGl1cyA9IE1hdGguc3FydCggbWFzcyAvIE1hdGguUEkgKTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBpbnRlcnNlY3RzID0gZnVuY3Rpb24oZW50Mikge1xyXG5cdFx0dmFyIGVudDJBdHRyID0gZW50Mi5nZXRBdHRyKCk7XHJcblx0XHRcclxuXHRcdHZhciBkeDIgPSBNYXRoLnBvdyhlbnQyQXR0ci54IC0geCwgMik7XHJcblx0XHR2YXIgZHkyID0gTWF0aC5wb3coZW50MkF0dHIueSAtIHksIDIpO1xyXG5cdFx0dmFyIGRpc3QyID0gZHgyICsgZHkyO1xyXG5cdFx0dmFyIG1heFJhZGl1czIgPSBNYXRoLnBvdyhlbnQyQXR0ci5yYWRpdXMgKyByYWRpdXMsIDIpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gKGRpc3QyIDwgbWF4UmFkaXVzMik7XHJcblx0fTtcclxuXHRcclxuXHR2YXIgZHJhdyA9IGZ1bmN0aW9uKGN0eCwgY2FtKSB7XHJcblx0XHR2YXIgY2FtU2l6ZSA9IGNhbS5nZXRTaXplKCk7XHJcblx0XHR2YXIgclBvcyA9IGNhbS5nZXRSZWxQb3MoZ2V0QXR0cigpKTtcclxuXHRcdFxyXG5cdFx0Ly9pZiBvdXRzaWRlIENhbSB2aWV3XHJcblx0XHRpZigoclBvcy54ICsgcmFkaXVzKSA8ICAwIHx8IChyUG9zLnkgKyByYWRpdXMpIDwgIDAgfHwgKHJQb3MueCAtIHJhZGl1cykgPiAgY2FtU2l6ZS53aWR0aCB8fCAoclBvcy55IC0gcmFkaXVzKSA+IGNhbVNpemUuaGVpZ2h0KSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Y3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xyXG5cdFx0Y3R4LnN0cm9rZVN0eWxlID0gYm9yZGVyQ29sb3I7XHJcblx0XHRjdHgubGluZVdpZHRoID0gNTtcclxuXHRcdFxyXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xyXG5cdFx0Y3R4LmFyYyhyUG9zLngsIHJQb3MueSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG5cdFx0Y3R4LmZpbGwoKTtcclxuXHRcdGN0eC5zdHJva2UoKTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciB1cGRhdGUgPSBmdW5jdGlvbihkVGltZSkge1xyXG5cdFx0eCArPSB2ZWxYICogZFRpbWU7XHJcblx0XHR5ICs9IHZlbFkgKiBkVGltZTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBnZXRCb3VuZHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHg6IHgtcmFkaXVzLFxyXG5cdFx0XHR5OiB5LXJhZGl1cyxcclxuXHRcdFx0d2lkdGg6IHJhZGl1cyoyLFxyXG5cdFx0XHRoZWlnaHQ6IHJhZGl1cyoyLFxyXG5cdFx0fTtcclxuXHR9O1xyXG5cdFxyXG5cdHJldHVybiB7XHJcblx0XHRnZXRUeXBlOiBnZXRUeXBlLFxyXG5cdFx0Z2V0Qm91bmRzOiBnZXRCb3VuZHMsXHJcblx0XHRnZXRBdHRyOiBnZXRBdHRyLFxyXG5cdFx0c2V0QXR0cjogc2V0QXR0cixcclxuXHRcdGluY01hc3M6IGluY01hc3MsXHJcblx0XHRpbnRlcnNlY3RzOiBpbnRlcnNlY3RzLFxyXG5cdFx0ZHJhdzogZHJhdyxcclxuXHRcdHVwZGF0ZTogdXBkYXRlLFxyXG5cdFx0YWN0aXZlOiBhY3RpdmVcclxuXHR9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENpcmNsZTsiLCJmdW5jdGlvbiBEcm9wbGV0KGF0dHIpIHtcclxuXHRhdHRyID0gYXR0ciB8fCB7fTtcclxuXHRcclxuXHR2YXIgeCA9IGF0dHIueCB8fCAwO1xyXG5cdHZhciB5ID0gYXR0ci55IHx8IDA7XHJcblx0dmFyIG1hc3MgPSBhdHRyLm1hc3MgfHwgNTAwO1xyXG5cdHZhciBjb2xvciA9IGF0dHIuY29sb3IgfHwgJ3doaXRlJztcclxuXHR2YXIgdHlwZSA9ICdEcm9wbGV0JztcclxuXHR2YXIgYWN0aXZlID0gdHJ1ZTtcclxuXHRcclxuXHR2YXIgcmFkaXVzID0gTWF0aC5zcXJ0KCBtYXNzIC8gTWF0aC5QSSApOyAvLzEgdW5pdCBvZiBhcmVhID09PSAxIHVuaXQgb2YgbWFzc1xyXG5cdFxyXG5cdHZhciBnZXRUeXBlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gdHlwZTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBnZXRBdHRyID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR4OiB4LFxyXG5cdFx0XHR5OiB5LFxyXG5cdFx0XHRtYXNzOiBtYXNzLFxyXG5cdFx0XHRyYWRpdXM6IHJhZGl1cyxcclxuXHRcdFx0Y29sb3I6IGNvbG9yLFxyXG5cdFx0XHR0eXBlOiB0eXBlXHJcblx0XHR9O1xyXG5cdH07XHJcblx0XHJcblx0dmFyIGludGVyc2VjdHMgPSBmdW5jdGlvbihlbnQyKSB7XHJcblx0XHR2YXIgZW50MkF0dHIgPSBlbnQyLmdldEF0dHIoKTtcclxuXHRcdFxyXG5cdFx0dmFyIGR4MiA9IE1hdGgucG93KGVudDJBdHRyLnggLSB4LCAyKTtcclxuXHRcdHZhciBkeTIgPSBNYXRoLnBvdyhlbnQyQXR0ci55IC0geSwgMik7XHJcblx0XHR2YXIgZGlzdDIgPSBkeDIgKyBkeTI7XHJcblx0XHR2YXIgbWF4UmFkaXVzMiA9IE1hdGgucG93KGVudDJBdHRyLnJhZGl1cyArIHJhZGl1cywgMik7XHJcblx0XHRcclxuXHRcdHJldHVybiAoZGlzdDIgPCBtYXhSYWRpdXMyKTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBkcmF3ID0gZnVuY3Rpb24oY3R4LCBjYW0pIHtcclxuXHRcdHZhciBjYW1TaXplID0gY2FtLmdldFNpemUoKTtcclxuXHRcdHZhciByUG9zID0gY2FtLmdldFJlbFBvcyhnZXRBdHRyKCkpO1xyXG5cdFx0XHJcblx0XHQvL2lmIG91dHNpZGUgQ2FtIHZpZXdcclxuXHRcdGlmKChyUG9zLnggKyByYWRpdXMpIDwgIDAgfHwgKHJQb3MueSArIHJhZGl1cykgPCAgMCB8fCAoclBvcy54IC0gcmFkaXVzKSA+ICBjYW1TaXplLndpZHRoIHx8IChyUG9zLnkgLSByYWRpdXMpID4gY2FtU2l6ZS5oZWlnaHQpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRjdHguZmlsbFN0eWxlID0gY29sb3I7XHJcblx0XHRjdHgubGluZVdpZHRoID0gNTtcclxuXHRcdFxyXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xyXG5cdFx0Y3R4LmFyYyhyUG9zLngsIHJQb3MueSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG5cdFx0Y3R4LmZpbGwoKTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBnZXRCb3VuZHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHg6IHgtcmFkaXVzLFxyXG5cdFx0XHR5OiB5LXJhZGl1cyxcclxuXHRcdFx0d2lkdGg6IHJhZGl1cyoyLFxyXG5cdFx0XHRoZWlnaHQ6IHJhZGl1cyoyLFxyXG5cdFx0fTtcclxuXHR9O1xyXG5cdFxyXG5cdHJldHVybiB7XHJcblx0XHRnZXRUeXBlOiBnZXRUeXBlLFxyXG5cdFx0Z2V0QXR0cjogZ2V0QXR0cixcclxuXHRcdGludGVyc2VjdHM6IGludGVyc2VjdHMsXHJcblx0XHRkcmF3OiBkcmF3LFxyXG5cdFx0Z2V0Qm91bmRzOiBnZXRCb3VuZHMsXHJcblx0XHRhY3RpdmU6IGFjdGl2ZVxyXG5cdH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRHJvcGxldDsiLCJ2YXIgRHJvcGxldCA9IHJlcXVpcmUoJy4vLi4vZW50aXRpZXMvZHJvcGxldCcpO1xyXG52YXIgZ2FtZU1hbmFnZXIgPSByZXF1aXJlKCcuL2dhbWVNYW5hZ2VyJyk7XHJcblxyXG52YXIgaSA9IDA7XHJcbnZhciBzcGFjZSA9IDcwO1xyXG5mb3IoaT0wOyBpPDQwMDsgaSs9MSkge1xyXG5cdGdhbWVNYW5hZ2VyLndvcmxkLmFkZEVudGl0eShuZXcgRHJvcGxldCh7XHJcblx0XHR4OiAxMDAgKyBNYXRoLnJhbmRvbSgpICogNDg1MCxcclxuXHRcdHk6IDEwMCArIE1hdGgucmFuZG9tKCkgKiA0ODUwLFxyXG5cdFx0Y29sb3I6IFsncmVkJywgJ2JsdWUnLCAnZ3JlZW4nLCAneWVsbG93JywgJ3B1cnBsZScsICdicm93bicsICd2aW9sZXQnXVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqNyldXHJcblx0fSkpO1xyXG59XHJcblxyXG5nYW1lTWFuYWdlci5pbml0KCdjYW52YXMxJywgJ2NhbnZhczInLCAnY2FudmFzMycpOyIsInZhciBDYW1lcmEgPSByZXF1aXJlKCcuLy4uL3dvcmxkL2NhbWVyYScpO1xyXG52YXIgRHJvcGxldCA9IHJlcXVpcmUoJy4vLi4vZW50aXRpZXMvZHJvcGxldCcpO1xyXG52YXIgQ2lyY2xlID0gcmVxdWlyZSgnLi8uLi9lbnRpdGllcy9jaXJjbGUnKTtcclxudmFyIEFJQ2lyY2xlID0gcmVxdWlyZSgnLi8uLi9lbnRpdGllcy9haUNpcmNsZScpO1xyXG52YXIgYWlTdGF0ZXMgPSByZXF1aXJlKCcuLy4uL2VudGl0aWVzL2FpL2FpU3RhdGVzJyk7XHJcbnZhciBXb3JsZCA9IHJlcXVpcmUoJy4vLi4vd29ybGQvd29ybGQnKTtcclxudmFyIE1vdXNlSGFuZGxlciA9IHJlcXVpcmUoJy4vLi4vaW5wdXQvbW91c2VIYW5kbGVyJyk7XHJcblxyXG52YXIgZ2FtZU1hbmFnZXIgPSAoZnVuY3Rpb24oKSB7XHJcblx0dmFyIGNhbnZhc0dyaWQgPSBudWxsO1xyXG5cdHZhciBjYW52YXNFbnQgPSBudWxsO1xyXG5cdHZhciBjYW52YXNRdWFkdHJlZSA9IG51bGw7XHJcblx0dmFyIGN0eEdyaWQgPSBudWxsO1xyXG5cdHZhciBjdHhFbnQgPSBudWxsO1xyXG5cdHZhciBjdHhRdWFkVHJlZSA9IG51bGw7XHJcblx0XHJcblx0dmFyIGRUaW1lID0gMSAvIDYwO1xyXG5cdHZhciB3b3JsZCA9IG5ldyBXb3JsZCh7eDogMCwgeTogMCwgd2lkdGg6IDUwMDAsIGhlaWdodDogNTAwMH0pO1xyXG5cdHZhciBwbGF5ZXIgPSBudWxsO1xyXG5cdHZhciBkcndRdWFkID0gMDtcclxuXHRcclxuXHR2YXIgaW5pdCA9IGZ1bmN0aW9uKGN2c0dyaWRJZCwgY3ZzRW50SWQsIGN2c1F1YWR0cmVlKSB7XHJcblx0XHRjYW52YXNHcmlkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY3ZzR3JpZElkKTtcclxuXHRcdGNhbnZhc0VudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGN2c0VudElkKTtcclxuXHRcdGNhbnZhc1F1YWR0cmVlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY3ZzUXVhZHRyZWUpO1xyXG5cdFx0Y3R4R3JpZCA9IGNhbnZhc0dyaWQuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHRcdGN0eEVudCA9IGNhbnZhc0VudC5nZXRDb250ZXh0KCcyZCcpO1xyXG5cdFx0Y3R4UXVhZHRyZWUgPSBjYW52YXNRdWFkdHJlZS5nZXRDb250ZXh0KCcyZCcpO1xyXG5cdFx0XHJcblx0XHRmaXRUb0NvbnRhaW5lcihjYW52YXNHcmlkKTtcclxuXHRcdGZpdFRvQ29udGFpbmVyKGNhbnZhc0VudCk7XHJcblx0XHRcclxuXHRcdGN0eEdyaWQuZmlsbFN0eWxlID0gJyNGMEZCRkYnO1xyXG5cdFx0Y3R4R3JpZC5zdHJva2VTdHlsZSA9ICcjQkZCRkJGJztcclxuXHRcdGN0eEdyaWQubGluZVdpZHRoID0gMTtcclxuXHRcdFxyXG5cdFx0TW91c2VIYW5kbGVyLmluaXQoZG9jdW1lbnQpO1xyXG5cdFx0XHJcblx0XHRwbGF5ZXIgPSBuZXcgQ2lyY2xlKHtcclxuXHRcdFx0eDogMjUwMCxcclxuXHRcdFx0eTogMjUwMCxcclxuXHRcdFx0Y29sb3I6ICdyZWQnLFxyXG5cdFx0XHRtYXNzOiAxMDAwXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0dmFyIGFpQ2lyYyA9IG5ldyBBSUNpcmNsZSh7XHJcblx0XHRcdHg6IDI1MDAsXHJcblx0XHRcdHk6IDI1MDAsXHJcblx0XHRcdGNvbG9yOiAnbGltZScsXHJcblx0XHRcdG1hc3M6IDEwMDAsXHJcblx0XHRcdHdvcmxkOiB3b3JsZFxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdGZvcih2YXIgaT0wOyBpIDwxMDsgaSsrKSB7XHJcblx0XHRcdHdvcmxkLmFkZEVudGl0eShuZXcgQUlDaXJjbGUoe1xyXG5cdFx0XHRcdHg6IDEwMCArIE1hdGgucmFuZG9tKCkgKiA0NTAwLFxyXG5cdFx0XHRcdHk6IDEwMCArIE1hdGgucmFuZG9tKCkgKiA0NTAwLFxyXG5cdFx0XHRcdGNvbG9yOiAgWydyZWQnLCAnYmx1ZScsICdncmVlbicsICd5ZWxsb3cnLCAncHVycGxlJywgJ2Jyb3duJywgJ3Zpb2xldCddW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSo3KV0sXHJcblx0XHRcdFx0bWFzczogMTAwMCxcclxuXHRcdFx0XHR3b3JsZDogd29ybGRcclxuXHRcdFx0fSkpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRDYW1lcmEuaW5pdChjdHhFbnQsIHBsYXllcik7XHJcblx0XHRcclxuXHRcdHdvcmxkLmFkZEVudGl0eShwbGF5ZXIpO1xyXG5cdFx0d29ybGQuYWRkRW50aXR5KGFpQ2lyYyk7XHJcblx0XHRnYW1lbG9vcCgpO1xyXG5cdH07XHJcblx0XHJcblx0dmFyIGhhbmRsZUlucHV0ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRpZihNb3VzZUhhbmRsZXIuaXNNb3VzZUluKCkgPT09IGZhbHNlKSB7XHJcblx0XHRcdHBsYXllci5zZXRBdHRyKHsgdmVsWDogMCwgdmVsWTogMCB9KTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR2YXIgcEF0dHIgPSBwbGF5ZXIuZ2V0QXR0cigpO1xyXG5cdFx0dmFyIHJQbHlyUG9zID0gQ2FtZXJhLmdldFJlbFBvcyhwbGF5ZXIuZ2V0QXR0cigpKTtcclxuXHRcdHZhciBtUG9zID0gTW91c2VIYW5kbGVyLmdldFBvcygpO1xyXG5cdFx0dmFyIGRYID0gbVBvcy54IC0gclBseXJQb3MueDtcclxuXHRcdHZhciBkWSA9IG1Qb3MueSAtIHJQbHlyUG9zLnk7XHJcblx0XHRcclxuXHRcdHZhciB2TGVuZ3RoID0gTWF0aC5zcXJ0KCAoZFgqZFgpICsgKGRZKmRZKSApO1xyXG5cdFx0XHJcblx0XHR2YXIgbm9ybVggPSBkWCAvIHZMZW5ndGg7XHJcblx0XHR2YXIgbm9ybVkgPSBkWSAvIHZMZW5ndGg7XHJcblx0XHRcclxuXHRcdHZMZW5ndGggPSAodkxlbmd0aCA+IDEwMCk/IDEwMDogdkxlbmd0aDtcclxuXHRcdFxyXG5cdFx0dmFyIG5ld1ZlbFggPSBub3JtWCAqIChwQXR0ci5tYXhWZWwgKiAodkxlbmd0aC8xMDApKTtcclxuXHRcdHZhciBuZXdWZWxZID0gbm9ybVkgKiAocEF0dHIubWF4VmVsICogKHZMZW5ndGgvMTAwKSk7XHJcblx0XHRcclxuXHRcdHBsYXllci5zZXRBdHRyKHtcclxuXHRcdFx0dmVsWDogbmV3VmVsWCxcclxuXHRcdFx0dmVsWTogbmV3VmVsWVxyXG5cdFx0fSk7XHJcblx0fTtcclxuXHRcclxuXHR2YXIgZHJhd0dyaWQgPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBjYW1Qb3MgPSBDYW1lcmEuZ2V0UG9zKCk7XHJcblx0XHR2YXIgY2FtU2l6ZSA9IENhbWVyYS5nZXRTaXplKCk7XHJcblx0XHRcclxuXHRcdHZhciBzdGFydCA9IE1hdGguZmxvb3IoY2FtUG9zLnggLyA0MCk7XHJcblx0XHR2YXIgcmVsWCA9IENhbWVyYS5nZXRSZWxQb3Moe3g6IChzdGFydCo0MCksIHk6IDB9KS54O1xyXG5cdFx0XHJcblx0XHR2YXIgbnVtTGluZXMgPSBjYW1TaXplLndpZHRoIC8gNDA7XHJcblx0XHR2YXIgaSA9IDA7XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0Y3R4R3JpZC5maWxsUmVjdCgwLCAwLCBjYW52YXNHcmlkLndpZHRoLCBjYW52YXNHcmlkLmhlaWdodCk7XHJcblx0XHRcclxuXHRcdGZvcihpPTA7IGk8bnVtTGluZXM7IGkrPTEpIHtcclxuXHRcdFx0Y3R4R3JpZC5iZWdpblBhdGgoKTtcclxuXHRcdFx0Y3R4R3JpZC5tb3ZlVG8ocmVsWCArICg0MCAqIGkpLCAwKTtcclxuXHRcdFx0Y3R4R3JpZC5saW5lVG8ocmVsWCArICg0MCAqIGkpLCBjYW1TaXplLmhlaWdodCk7XHJcblx0XHRcdGN0eEdyaWQuc3Ryb2tlKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHN0YXJ0ID0gTWF0aC5mbG9vcihjYW1Qb3MueSAvIDQwKTtcclxuXHRcdHZhciByZWxZID0gQ2FtZXJhLmdldFJlbFBvcyh7eDogMCwgeTogKHN0YXJ0ICogNDApfSkueTtcclxuXHRcdG51bUxpbmVzID0gY2FtU2l6ZS5oZWlnaHQgLyA0MDtcclxuXHRcdFxyXG5cdFx0Zm9yKGk9MDsgaTxudW1MaW5lczsgaSs9MSkge1xyXG5cdFx0XHRjdHhHcmlkLmJlZ2luUGF0aCgpO1xyXG5cdFx0XHRjdHhHcmlkLm1vdmVUbygwLCByZWxZICsgKDQwICogaSkpO1xyXG5cdFx0XHRjdHhHcmlkLmxpbmVUbyhjYW1TaXplLndpZHRoLCByZWxZICsgKDQwICogaSkpO1xyXG5cdFx0XHRjdHhHcmlkLnN0cm9rZSgpO1xyXG5cdFx0fVxyXG5cdH07XHJcblx0XHJcblx0dmFyIGdlblJhbmRvbURyb3BsZXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdHdvcmxkLmFkZEVudGl0eShuZXcgRHJvcGxldCh7XHJcblx0XHRcdHg6IDIwICsgTWF0aC5yYW5kb20oKSAqICh3b3JsZC5ib3JkZXJzLndpZHRoIC0gMjApLFxyXG5cdFx0XHR5OiAyMCArIE1hdGgucmFuZG9tKCkgKiAod29ybGQuYm9yZGVycy5oZWlnaHQgLSAyMCksXHJcblx0XHRcdGNvbG9yOiBbJ3JlZCcsJ2JsdWUnLCdncmVlbicsJ3llbGxvdycsJ3B1cnBsZScsJ2Jyb3duJywndmlvbGV0J11bTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjcpXVxyXG5cdFx0fSkpO1xyXG5cdH07XHJcblx0XHJcblx0dmFyIGhhbmRsZUNvbGxpc2lvbnMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBwb3NzaWJsZUNvbGwgPSBbXTtcclxuXHRcdHZhciBjb2xsaXNpb25zID0gW107XHJcblx0XHR2YXIgY29sbCA9IG51bGw7XHJcblx0XHR2YXIgZW50aXR5ID0gbnVsbDtcclxuXHRcdHZhciBlbnQgPSBudWxsO1xyXG5cdFx0dmFyIGVudE1hc3MgPSAwO1xyXG5cdFx0dmFyIGNpcmNsZSA9IG51bGw7XHJcblx0XHR2YXIgY3JjID0gbnVsbDtcclxuXHRcdFxyXG5cdFx0Zm9yKHZhciBpIGluIHdvcmxkLmNpcmNsZXMpIHtcclxuXHRcdFx0Y2lyY2xlID0gd29ybGQuY2lyY2xlc1tpXTtcclxuXHRcdFx0Y3JjID0gY2lyY2xlLmdldEF0dHIoKTtcclxuXHRcdFx0XHJcblx0XHRcdHBvc3NpYmxlQ29sbCA9IHdvcmxkLmdldFBvc3NpYmxlQ29sbGlzaW9ucyhjaXJjbGUpO1xyXG5cdFx0XHRcclxuXHRcdFx0d2hpbGUoZW50aXR5ID0gcG9zc2libGVDb2xsLnBvcCgpKSB7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYoY2lyY2xlLmludGVyc2VjdHMoZW50aXR5KSkge1xyXG5cdFx0XHRcdFx0ZW50ID0gZW50aXR5LmdldEF0dHIoKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmKGNyYy5tYXNzID4gKDEuNSAqIGVudC5tYXNzKSkge1xyXG5cdFx0XHRcdFx0XHRlbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdHdvcmxkLnJlbW92ZUVudGl0eShlbnRpdHkpO1xyXG5cdFx0XHRcdFx0XHRjaXJjbGUuaW5jTWFzcyhlbnQubWFzcyk7XHJcblx0XHRcdFx0XHRcdGdlblJhbmRvbURyb3BsZXQoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9O1xyXG5cdFxyXG5cdHZhciBoYW5kbGVCb3VuZHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHdvcmxkLmVudGl0eUJhZy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSkge1xyXG5cdFx0XHR2YXIgZW50ID0gZW50aXR5LmdldEF0dHIoKTtcclxuXHRcdFx0dmFyIGJvcmRlcnMgPSB3b3JsZC5ib3JkZXJzO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoZW50aXR5LmdldFR5cGUoKSAhPT0gJ0NpcmNsZScpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmKChlbnQueC1lbnQucmFkaXVzKSA8IDApIHtcclxuXHRcdFx0XHRlbnRpdHkuc2V0QXR0cih7eDogZW50LnJhZGl1c30pO1xyXG5cdFx0XHR9IGVsc2UgaWYoKGVudC54K2VudC5yYWRpdXMpID4gKGJvcmRlcnMueCtib3JkZXJzLndpZHRoKSkge1xyXG5cdFx0XHRcdGVudGl0eS5zZXRBdHRyKHt4OiAoYm9yZGVycy54K2JvcmRlcnMud2lkdGgpLWVudC5yYWRpdXN9KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYoKGVudC55LWVudC5yYWRpdXMpIDwgMCkge1xyXG5cdFx0XHRcdGVudGl0eS5zZXRBdHRyKHt5OiBlbnQucmFkaXVzfSk7XHJcblx0XHRcdH0gZWxzZSBpZigoZW50LnkrZW50LnJhZGl1cykgPiAoYm9yZGVycy55K2JvcmRlcnMuaGVpZ2h0KSkge1xyXG5cdFx0XHRcdGVudGl0eS5zZXRBdHRyKHt5OiAoYm9yZGVycy55K2JvcmRlcnMuaGVpZ2h0KS1lbnQucmFkaXVzfSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH07XHJcblx0XHJcblx0dmFyIGZpdFRvQ29udGFpbmVyID0gZnVuY3Rpb24oY2FudmFzKSB7XHJcblx0XHRjYW52YXMuc3R5bGUud2lkdGg9JzEwMCUnO1xyXG5cdFx0Y2FudmFzLnN0eWxlLmhlaWdodD0nMTAwJSc7XHJcblx0XHRjYW52YXMud2lkdGggID0gY2FudmFzLm9mZnNldFdpZHRoO1xyXG5cdFx0Y2FudmFzLmhlaWdodCA9IGNhbnZhcy5vZmZzZXRIZWlnaHQ7XHJcblx0fTtcclxuXHRcclxuXHR2YXIgZ2FtZWxvb3AgPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBsZW4gPSB3b3JsZC5lbnRpdHlCYWcubGVuZ3RoO1xyXG5cdFx0dmFyIGkgPSAwO1xyXG5cdFx0dmFyIGVudCA9IG51bGw7XHJcblx0XHRcclxuXHRcdGhhbmRsZUlucHV0KCk7XHJcblx0XHRDYW1lcmEudXBkYXRlKCk7XHJcblx0XHRcclxuXHRcdGRyYXdHcmlkKCk7XHJcblx0XHRcclxuXHRcdGlmKGRyd1F1YWQgPT09IDUpIHtcclxuXHRcdFx0Y3R4UXVhZHRyZWUuZmlsbFN0eWxlID0gJ3doaXRlJztcclxuXHRcdFx0Y3R4UXVhZHRyZWUuZmlsbFJlY3QoMCwgMCwgMjUwLCAyNTApO1xyXG5cdFx0XHR3b3JsZC5xVHJlZS5kcmF3VHJlZShjdHhRdWFkdHJlZSk7XHJcblx0XHRcdGRyd1F1YWQgPSAwO1xyXG5cdFx0fVxyXG5cdFx0ZHJ3UXVhZCArPSAxO1xyXG5cdFx0XHJcblx0XHRjdHhFbnQuY2xlYXJSZWN0KDAsIDAsIGNhbnZhc0VudC53aWR0aCwgY2FudmFzRW50LmhlaWdodClcclxuXHRcdFxyXG5cdFx0Zm9yKGk9MDsgaTxsZW47IGkrPTEpIHtcclxuXHRcdFx0ZW50ID0gd29ybGQuZW50aXR5QmFnW2ldO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoZW50LnVwZGF0ZSkge1xyXG5cdFx0XHRcdGVudC51cGRhdGUoZFRpbWUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZihlbnQuZHJhdykge1xyXG5cdFx0XHRcdGVudC5kcmF3KGN0eEVudCwgQ2FtZXJhKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRoYW5kbGVDb2xsaXNpb25zKCk7XHJcblx0XHRoYW5kbGVCb3VuZHMoKTtcclxuXHRcdFxyXG5cdFx0c2V0VGltZW91dChnYW1lbG9vcCwgZFRpbWUgKiAxMDAwKTtcclxuXHR9O1xyXG5cdFxyXG5cdHJldHVybiB7XHJcblx0XHRpbml0OiBpbml0LFxyXG5cdFx0d29ybGQ6IHdvcmxkXHJcblx0fTtcclxufSgpKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZ2FtZU1hbmFnZXI7IiwidmFyIE1vdXNlSGFuZGxlciA9IChmdW5jdGlvbigpIHtcclxuXHR2YXIgeCA9IDA7XHJcblx0dmFyIHkgPSAwO1xyXG5cdHZhciBtb3VzZUluID0gZmFsc2U7XHJcblx0XHJcblx0dmFyIGluaXQgPSBmdW5jdGlvbihldmVudFNyYykge1xyXG5cdFx0ZXZlbnRTcmMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xyXG5cdFx0ZXZlbnRTcmMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCBvbk1vdXNlT3V0KTtcclxuXHRcdGV2ZW50U3JjLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIG9uTW91c2VPdmVyKTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBvbk1vdXNlT3V0ICA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0bW91c2VJbiA9IGZhbHNlO1xyXG5cdH07XHJcblx0XHJcblx0dmFyIG9uTW91c2VPdmVyID0gZnVuY3Rpb24oKSB7XHJcblx0XHRtb3VzZUluID0gdHJ1ZTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBvbk1vdXNlTW92ZSA9IGZ1bmN0aW9uKGUpIHtcclxuXHRcdHggPSBlLmNsaWVudFg7XHJcblx0XHR5ID0gZS5jbGllbnRZO1xyXG5cdH07XHJcblx0XHJcblx0dmFyIGdldFBvcyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0eDogeCxcclxuXHRcdFx0eTogeVxyXG5cdFx0fTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBpc01vdXNlSW4gPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiBtb3VzZUluO1xyXG5cdH07XHJcblx0XHJcblx0cmV0dXJuIHtcclxuXHRcdGluaXQ6IGluaXQsXHJcblx0XHRnZXRQb3M6IGdldFBvcyxcclxuXHRcdGlzTW91c2VJbjogaXNNb3VzZUluXHJcblx0fTtcclxufSgpKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW91c2VIYW5kbGVyOyIsImZ1bmN0aW9uIFF1YWR0cmVlKGx2bCwgYm5kcykge1xyXG4gICAgdmFyIGxldmVsID0gbHZsO1xyXG4gICAgdmFyIGJvdW5kcyA9IGJuZHM7XHJcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xyXG4gICAgdmFyIG5vZGVzID0gW107XHJcbiAgICBcclxuXHR2YXIgTUFYX09CSkVDVFMgPSA1O1xyXG5cdHZhciBNQVhfTEVWRUwgPSA1O1xyXG5cdFxyXG4gICAgdmFyIHhNaWRkbGUgPSBib3VuZHMueCArIChib3VuZHMud2lkdGggLyAyKTtcclxuICAgIHZhciB5TWlkZGxlID0gYm91bmRzLnkgKyAoYm91bmRzLmhlaWdodCAvIDIpO1xyXG4gICAgXHJcblx0dmFyIGNsZWFyID0gZnVuY3Rpb24oKSB7XHJcblx0XHRvYmplY3RzID0gW107XHJcblx0XHRub2RlcyA9IFtdO1xyXG5cdH07XHJcblx0XHJcbiAgICB2YXIgc3BsaXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBub2Rlc1swXSA9IG5ldyBRdWFkdHJlZShsZXZlbCsxLCB7eDogeE1pZGRsZSwgeTogYm91bmRzLnkgLCB3aWR0aDogYm91bmRzLndpZHRoLzIsIGhlaWdodDogYm91bmRzLmhlaWdodC8yfSk7XHJcbiAgICAgICAgbm9kZXNbMV0gPSBuZXcgUXVhZHRyZWUobGV2ZWwrMSwge3g6IGJvdW5kcy54LCB5OiBib3VuZHMueSwgd2lkdGg6IGJvdW5kcy53aWR0aC8yLCBoZWlnaHQ6IGJvdW5kcy5oZWlnaHQvMn0pO1xyXG4gICAgICAgIG5vZGVzWzJdID0gbmV3IFF1YWR0cmVlKGxldmVsKzEsIHt4OiBib3VuZHMueCwgeTogeU1pZGRsZSwgd2lkdGg6IGJvdW5kcy53aWR0aC8yLCBoZWlnaHQ6IGJvdW5kcy5oZWlnaHQvMn0pO1xyXG4gICAgICAgIG5vZGVzWzNdID0gbmV3IFF1YWR0cmVlKGxldmVsKzEsIHt4OiB4TWlkZGxlLCB5OiB5TWlkZGxlLCB3aWR0aDogYm91bmRzLndpZHRoLzIsIGhlaWdodDogYm91bmRzLmhlaWdodC8yfSk7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICB2YXIgZ2V0SW5kZXggPSBmdW5jdGlvbihyZWMpIHtcclxuICAgICAgICB2YXIgdG9wID0gKHJlYy55ID4gYm91bmRzLnkgJiYgKHJlYy55K3JlYy5oZWlnaHQpIDwgeU1pZGRsZSk7XHJcbiAgICAgICAgdmFyIGJvdHRvbSA9IChyZWMueSA+IHlNaWRkbGUgJiYgKHJlYy55K3JlYy5oZWlnaHQpIDwgKGJvdW5kcy55K2JvdW5kcy5oZWlnaHQpKTtcclxuICAgICAgICBcclxuICAgICAgICBpZihyZWMueCA+IGJvdW5kcy54ICYmIChyZWMueCtyZWMud2lkdGgpIDwgeE1pZGRsZSkge1xyXG4gICAgICAgICAgICBpZih0b3ApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoYm90dG9tKSB7Ly9MRUZUXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZihyZWMueCA+IHhNaWRkbGUgJiYgKHJlYy54K3JlYy53aWR0aCkgPCAoYm91bmRzLngrYm91bmRzLndpZHRoKSkge1xyXG4gICAgICAgICAgICBpZih0b3ApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoYm90dG9tKSB7Ly9SSUdIVFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ICAgICAgICBcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICB2YXIgaW5zZXJ0ID0gZnVuY3Rpb24oZW50KSB7XHJcblx0XHR2YXIgcmVjID0gZW50LmdldEJvdW5kcygpO1xyXG4gICAgICAgIHZhciBpbmRleCA9IGdldEluZGV4KHJlYyk7XHJcbiAgICAgICAgdmFyIGxlbiA9IDA7XHJcbiAgICAgICAgdmFyIGkgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKG5vZGVzWzBdICYmIGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICBub2Rlc1tpbmRleF0uaW5zZXJ0KGVudCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgb2JqZWN0cy5wdXNoKGVudCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYob2JqZWN0cy5sZW5ndGggPiBNQVhfT0JKRUNUUyAmJiBsZXZlbCA8IE1BWF9MRVZFTCkge1xyXG4gICAgICAgICAgICBpZighbm9kZXNbMF0pIHtcclxuICAgICAgICAgICAgICAgIHNwbGl0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxlbiA9IG9iamVjdHMubGVuZ3RoO1xyXG4gICAgICAgICAgICB3aGlsZShpIDwgb2JqZWN0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4ID0gZ2V0SW5kZXgob2JqZWN0c1tpXS5nZXRCb3VuZHMoKSk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVzW2luZGV4XS5pbnNlcnQob2JqZWN0c1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0cy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgXHJcblx0dmFyIHJldHJpZXZlID0gZnVuY3Rpb24gKGxpc3QsIGVudCkge1xyXG5cdFx0dmFyIHJlYzEgPSBib3VuZHM7XHJcblx0XHR2YXIgcmVjMiA9IGVudC5nZXRCb3VuZHMoKTtcclxuXHRcdFxyXG5cdFx0aWYocmVjMi54IDwgKHJlYzEueCtyZWMxLndpZHRoKSAgJiYgKHJlYzIueCtyZWMyLndpZHRoKSAgPiByZWMxLnggJiZcclxuXHRcdCAgIHJlYzIueSA8IChyZWMxLnkrcmVjMS5oZWlnaHQpICYmIChyZWMyLnkrcmVjMi5oZWlnaHQpID4gcmVjMS55KSB7XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IodmFyIG8gaW4gb2JqZWN0cykge1xyXG5cdFx0XHRcdGlmKG9iamVjdHNbb10gIT09IGVudCkge1xyXG5cdFx0XHRcdFx0bGlzdC5wdXNoKG9iamVjdHNbb10pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYobm9kZXMubGVuZ3RoKSB7XHJcblx0XHRcdFx0bm9kZXNbMF0ucmV0cmlldmUobGlzdCwgZW50KTtcclxuXHRcdFx0XHRub2Rlc1sxXS5yZXRyaWV2ZShsaXN0LCBlbnQpO1xyXG5cdFx0XHRcdG5vZGVzWzJdLnJldHJpZXZlKGxpc3QsIGVudCk7XHJcblx0XHRcdFx0bm9kZXNbM10ucmV0cmlldmUobGlzdCwgZW50KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gbGlzdDtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBkcmF3VHJlZSA9IGZ1bmN0aW9uKGN0eCkge1xyXG5cdFx0ZHJhdyhjdHgpO1xyXG5cdFx0aWYobm9kZXNbMF0pIHtcclxuXHRcdFx0bm9kZXNbMF0uZHJhd1RyZWUoY3R4KTtcclxuXHRcdFx0bm9kZXNbMV0uZHJhd1RyZWUoY3R4KTtcclxuXHRcdFx0bm9kZXNbMl0uZHJhd1RyZWUoY3R4KTtcclxuXHRcdFx0bm9kZXNbM10uZHJhd1RyZWUoY3R4KTtcclxuXHRcdH1cclxuXHR9O1xyXG5cdFxyXG5cdHZhciBkcmF3ID0gZnVuY3Rpb24oY3R4KSB7XHJcblx0XHR2YXIgZW50QXR0ciA9IG51bGxcclxuXHRcdGN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XHJcblx0XHRjdHgubGluZVdpZHRoID0gMTtcclxuXHRcdGN0eC5zdHJva2VSZWN0KGJvdW5kcy54LzIwLCBib3VuZHMueS8yMCwgYm91bmRzLndpZHRoLzIwLCBib3VuZHMuaGVpZ2h0LzIwKTtcclxuXHRcdFxyXG5cdFx0Y3R4LmZpbGxTdHlsZSA9ICdncmF5JztcclxuXHRcdGZvcihvIGluIG9iamVjdHMpIHtcclxuXHRcdFx0ZW50QXR0ciA9IG9iamVjdHNbb10uZ2V0QXR0cigpO1xyXG5cdFx0XHRjdHguZmlsbFJlY3QoZW50QXR0ci54LzIwLCBlbnRBdHRyLnkvMjAsIDMsIDMpO1xyXG5cdFx0fVxyXG5cdH07XHJcblx0XHJcbiAgICB2YXIgdG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gJygnK2JvdW5kcy54KycsJytib3VuZHMueSsnKScrJ1snK2JvdW5kcy53aWR0aCsnLCcrYm91bmRzLmhlaWdodCsnXSc7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGNsZWFyOiBjbGVhcixcclxuICAgICAgICBpbnNlcnQ6IGluc2VydCxcclxuICAgICAgICByZXRyaWV2ZTogcmV0cmlldmUsXHJcblx0XHRkcmF3VHJlZTogZHJhd1RyZWUsXHJcbiAgICAgICAgdG9TdHJpbmc6IHRvU3RyaW5nLFxyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBRdWFkdHJlZTsiLCJ2YXIgQ2FtZXJhID0gKGZ1bmN0aW9uKCkge1xyXG5cdHZhciB4ID0gMDtcclxuXHR2YXIgeSA9IDA7XHJcblx0dmFyIHdpZHRoID0gMDtcclxuXHR2YXIgaGVpZ2h0ID0gMDtcclxuXHR2YXIgY3R4ID0gbnVsbDtcclxuXHR2YXIgcGxheWVyID0gbnVsbDtcclxuXHRcclxuXHRcclxuXHR2YXIgaW5pdCA9IGZ1bmN0aW9uKF9jdHgsIHBseXIpIHtcclxuXHRcdGN0eCA9IF9jdHg7XHJcblx0XHRwbGF5ZXIgPSBwbHlyO1xyXG5cdFx0d2lkdGggPSBjdHguY2FudmFzLndpZHRoO1xyXG5cdFx0aGVpZ2h0ID0gY3R4LmNhbnZhcy5oZWlnaHQ7XHJcblx0fTtcclxuXHRcclxuXHR2YXIgdXBkYXRlID0gZnVuY3Rpb24oKSB7XHJcblx0XHR3aWR0aCA9IGN0eC5jYW52YXMud2lkdGg7XHJcblx0XHRoZWlnaHQgPSBjdHguY2FudmFzLmhlaWdodDtcclxuXHRcdFxyXG5cdFx0dmFyIHBseXJBdHRyID0gcGxheWVyLmdldEF0dHIoKTtcclxuXHRcdHggPSAocGx5ckF0dHIueCAtIHdpZHRoIC8gMik7XHJcblx0XHR5ID0gKHBseXJBdHRyLnkgLSBoZWlnaHQgLyAyKTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBnZXRSZWxQb3MgPSBmdW5jdGlvbihlbnRBdHRyKSB7XHJcblx0XHRcclxuXHRcdHZhciByZWxYID0gZW50QXR0ci54IC0geDtcclxuXHRcdHZhciByZWxZID0gZW50QXR0ci55IC0geTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0eDogcmVsWCxcclxuXHRcdFx0eTogcmVsWVxyXG5cdFx0fTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBnZXRQb3MgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHg6IHgsXHJcblx0XHRcdHk6IHlcclxuXHRcdH07XHJcblx0fTtcclxuXHRcclxuXHR2YXIgZ2V0U2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0d2lkdGg6IHdpZHRoLFxyXG5cdFx0XHRoZWlnaHQ6IGhlaWdodFxyXG5cdFx0fTtcclxuXHR9O1xyXG5cdFxyXG5cdHJldHVybiB7XHJcblx0XHRpbml0OiBpbml0LFxyXG5cdFx0dXBkYXRlOiB1cGRhdGUsXHJcblx0XHRnZXRSZWxQb3M6IGdldFJlbFBvcyxcclxuXHRcdGdldFBvczogZ2V0UG9zLFxyXG5cdFx0Z2V0U2l6ZTogZ2V0U2l6ZVxyXG5cdH07XHJcbn0oKSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENhbWVyYTsiLCJ2YXIgUXVhZHRyZWUgPSByZXF1aXJlKCcuLy4uL3V0aWwvcXVhZHRyZWUnKTtcclxuXHJcbmZ1bmN0aW9uIFdvcmxkKGJyZHMpIHsvL2RlcnBcclxuXHRcclxuXHR2YXIgYm9yZGVycyA9IGJyZHM7XHJcblx0dmFyIGVudGl0eUJhZyA9IFtdO1xyXG5cdHZhciBxVHJlZSA9IG5ldyBRdWFkdHJlZSgwLCBib3JkZXJzKTtcclxuXHR2YXIgY2lyY2xlcyA9IFtdO1xyXG5cdFxyXG5cdHZhciBhZGRFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuXHRcdHZhciBlbnQgPSBlbnRpdHkuZ2V0QXR0cigpO1xyXG5cdFx0XHJcblx0XHRlbnRpdHlCYWcucHVzaChlbnRpdHkpO1xyXG5cdFx0aWYoZW50LnR5cGUgJiYgZW50LnR5cGUgPT09ICdDaXJjbGUnKSB7XHJcblx0XHRcdGNpcmNsZXMucHVzaChlbnRpdHkpO1xyXG5cdFx0fVxyXG5cdH07XHJcblx0XHJcblx0dmFyIHJlbW92ZUVudGl0eSA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG5cdFx0dmFyIGVudCA9IGVudGl0eS5nZXRBdHRyKCk7XHJcblx0XHR2YXIgbGVuID0gIGVudGl0eUJhZy5sZW5ndGg7XHJcblx0XHR2YXIgaSA9IDA7XHJcblx0XHR2YXIgaW5keCA9IC0xO1xyXG5cdFx0XHJcblx0XHRpZihlbnQudHlwZSAmJiBlbnQudHlwZSA9PT0gJ0NpcmNsZScpIHtcclxuXHRcdFx0aWYoKGluZHggPSBjaXJjbGVzLmluZGV4T2YoZW50aXR5KSkgIT09IC0xKSB7XHJcblx0XHRcdFx0Y2lyY2xlcy5zcGxpY2UoaW5keCwgMSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Zm9yKGk9MDsgaTxsZW47IGkrPTEpIHtcclxuXHRcdFx0aWYoZW50aXR5ID09PSBlbnRpdHlCYWdbaV0pIHtcclxuXHRcdFx0XHRlbnRpdHlCYWcuc3BsaWNlKGksIDEpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH07XHJcblx0XHJcblx0dmFyIHJlZ2VuUVQgPSBmdW5jdGlvbigpIHtcclxuXHRcdHFUcmVlLmNsZWFyKCk7XHJcblx0XHRcclxuXHRcdGVudGl0eUJhZy5mb3JFYWNoKGZ1bmN0aW9uKGVudCkge1xyXG5cdFx0XHRxVHJlZS5pbnNlcnQoZW50KTtcclxuXHRcdH0pO1xyXG5cdH07XHJcblx0XHJcblx0dmFyIGdldFBvc3NpYmxlQ29sbGlzaW9ucyA9IGZ1bmN0aW9uKGVudGl0eVRvVGVzdCkge1xyXG5cdFx0cmVnZW5RVCgpO1xyXG5cdFx0cmV0dXJuIHFUcmVlLnJldHJpZXZlKFtdLCBlbnRpdHlUb1Rlc3QpO1xyXG5cdH07XHJcblx0XHJcblx0dmFyIGRyYXcgPSBmdW5jdGlvbihjdHgpIHtcclxuXHRcdHF0LmRyYXcoY3R4KTtcclxuXHR9O1xyXG5cdFxyXG5cdHJldHVybiB7XHJcblx0XHRhZGRFbnRpdHk6IGFkZEVudGl0eSxcclxuXHRcdHJlbW92ZUVudGl0eTogcmVtb3ZlRW50aXR5LFxyXG5cdFx0Z2V0UG9zc2libGVDb2xsaXNpb25zOiBnZXRQb3NzaWJsZUNvbGxpc2lvbnMsXHJcblx0XHRxVHJlZTogcVRyZWUsXHJcblx0XHRlbnRpdHlCYWc6IGVudGl0eUJhZyxcclxuXHRcdGJvcmRlcnM6IGJvcmRlcnMsXHJcblx0XHRkcmF3OiBkcmF3LFxyXG5cdFx0Y2lyY2xlczogY2lyY2xlc1xyXG5cdH07XHJcbn1cclxuXHJcbldvcmxkLmdldERpc3RhbmNlMiA9IGZ1bmN0aW9uKGVudGl0eTEsIGVudGl0eTIpIHtcclxuXHR2YXIgZW50MSA9IGVudGl0eTEuZ2V0QXR0cigpO1xyXG5cdHZhciBlbnQyID0gZW50aXR5Mi5nZXRBdHRyKCk7XHJcblx0dmFyIGRpc3RhbmNlMiA9IE1hdGgucG93KGVudDEueCAtIGVudDIueCwgMikgKyBNYXRoLnBvdyhlbnQxLnkgLSBlbnQyLnksIDIpO1xyXG5cdFx0XHJcblx0cmV0dXJuIGRpc3RhbmNlMjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gV29ybGQ7Il19
