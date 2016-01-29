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