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