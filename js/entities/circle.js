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