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