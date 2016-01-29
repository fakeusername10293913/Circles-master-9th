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