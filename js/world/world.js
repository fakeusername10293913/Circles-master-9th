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