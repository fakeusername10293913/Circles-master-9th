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