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