GRAVITY = 0.081;
FRICTION = 0.6;
ROLLING_FRICTION = 0.9;
BALL_DIAMETER = 18;
BALL_COUNT = 20;
drawVectors = false;
interval = 20;

worldX = 600 - BALL_DIAMETER;
worldY = 600 - BALL_DIAMETER;

function newRange() {
	BALL_COUNT = document.getElementById("myRange").value;
	document.getElementById("range").innerHTML = BALL_COUNT;
}

function changeTimeRes() {
	interval = document.getElementById("myTimeRes").value;
	document.getElementById("timeres").innerHTML = interval;
}

function start() {
	var i = 0;
	var j = 0;
	var time = 0;
	var balls = [];
	var id = setInterval(frame, interval);
	
	drawVectors = document.getElementById("drawvectors").checked;
	BALL_COUNT = document.getElementById("myRange").value;

	// spawn balls
	var X = 6;
	var Y = 100;
	for ( i = 0; i < BALL_COUNT; i++) {
		if (X > 550) {
			X = 6;
			Y += 30;
		}
		balls[i] = new Ball(X += 30, Y, Math.random() * 4, Math.random() * 2);
	}
	
	// move objects and apply forces to all elements
	function frame() {
		if (time > 3000) {
			clearInterval(id);
			for ( i = 0; i < balls.length; i++)
				balls[i].remove();
		} else {
			for (var i = 0; i < balls.length; i++)
				balls[i].applyForces();
				
			collisionHandling();
			
			for (i = 0; i < balls.length; i++)
				balls[i].draw();
		}
		time++;
	}
	
	// detect and resolve collisions
	function collisionHandling() {	

		// reverse velocities at borders
		for (var i = 0; i < balls.length; i++)
			balls[i].handleBorderCollision();

		// insertion sort on elements array
	    insertionSort(balls);

		// detect and resolve collisions only on possibly colliding 
	    // elements using sweep and prune on sorted array
	    for ( i = 0; i < balls.length - 1; i++) 
	    	for (var j = i+1; j < balls.length && balls[i].posX + BALL_DIAMETER >= balls[j].posX; j++)
	    		if (balls[i].detectCollision(balls[j])) 
	    			balls[i].resolveCollision(balls[j]);
	 
	}
	
	
	function insertionSort(items) {
	    var len = items.length,     // number of items in the array
        value,                      // the value currently being compared
        i,                          // index into unsorted section
        j;                          // index into sorted section

	    for (i=0; i < len; i++) {
	    	// store the current value because it may shift later
	    	value = items[i];

	        /*
			 * Whenever the value in the sorted section is greater than the
			 * value in the unsorted section, shift all items in the sorted
			 * section over by one. This creates space in which to insert the
			 * value.
			 */
	        for (j=i-1; j > -1 && items[j].posX > value.posX; j--)
	            items[j+1] = items[j];
	
	        items[j+1] = value;
	    }
	}

}

Ball = function(posX, posY, velX, velY) {
	this.posX = posX;
	this.posY = posY;
	this.velX = velX;
	this.velY = velY;

	var color = '#' + Math.random().toString(16).substr(2, 6);
	this.elem = document.createElement("div");
	this.elem.style.cssText = ("position: absolute; background-color:" + color);
	this.elem.className = "ball";

	if (drawVectors) {
		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.svg.style.cssText = ("position: absolute;height:64px; width:64px;top:" + (-32 + BALL_DIAMETER / 2) + ";left:" + (-32 + BALL_DIAMETER / 2) + ";")
		this.vector = createLine(32, 32, 32, 32);
		document.getElementById("container").appendChild(this.elem).appendChild(this.svg).appendChild(this.vector);
	} else {
		document.getElementById("container").appendChild(this.elem);
	}

	Ball.prototype.remove = function() {
		this.elem.remove();
	}
	
	Ball.prototype.applyForces = function() {
		// apply gravity
		if (this.posY < worldY) 
			this.velY += GRAVITY;

		// apply velocity
		this.posX += this.velX;
		this.posY += this.velY;
	}
	
	Ball.prototype.handleBorderCollision = function() {
		// border collision detection + some primitive approximation for
		// friction
		if (this.posX > worldX) {
			this.posX = worldX;
			this.velX = -this.velX * FRICTION;
		} else if (this.posX < 0) {
			this.posX = 0;
			this.velX = -this.velX * FRICTION;
		}
		if (this.posY > worldY) {
			this.posY = worldY;
			this.velY = -this.velY * FRICTION;
			this.velX = this.velX * ROLLING_FRICTION;
		} else if (this.posY < 0) {
			this.posY = 0;
			this.velY = -this.velY * FRICTION;
		}
	}

	Ball.prototype.draw = function() {
		// update position
		this.elem.style.top = Math.round(this.posY) + 'px';
		this.elem.style.left = Math.round(this.posX) + 'px';

		// update vector
		if (drawVectors) {
			this.vector.setAttribute('x2', 32 + this.velX);
			this.vector.setAttribute('y2', 32 + this.velY);
		}
	}

	Ball.prototype.detectCollision = function(ball) {
		if (this == ball)
			return false;

		var distX = ball.posX - this.posX;
		var distY = ball.posY - this.posY;
		var distance = distX * distX + distY * distY;

		if (distance < BALL_DIAMETER * BALL_DIAMETER)
			return true;
		else
			return false;
	}

	Ball.prototype.resolveCollision = function(ball) {

		var distX = ball.posX - this.posX;
		var distY = ball.posY - this.posY;
		var distance = distX * distX + distY * distY;
		var count = 0;

		// move them apart to point before collision
		while (distance < BALL_DIAMETER * BALL_DIAMETER) {
			this.posX -= this.velX * 0.2;
			this.posY -= this.velY * 0.2;
			ball.posX -= ball.velX * 0.2;
			ball.posY -= ball.velY * 0.2;

			distX = ball.posX - this.posX;
			distY = ball.posY - this.posY;
			distance = distX * distX + distY * distY;
			count++;
		}

		// calculate resulting vectors
		// calculate normal vector
		var nX = this.posX - ball.posX;
		var nY = this.posY - ball.posY;

		// calculate norm of normal vector
		var norm = Math.sqrt(nX * nX + nY * nY);

		// normalize vector n
		nX = nX / norm;
		nY = nY / norm;

		// calculate vector length
		var a1 = this.velX * nX + this.velY * nY;
		var a2 = ball.velX * nX + ball.velY * nY;

		// calculate magnitude of deltaP
		var P = a1 - a2;

		// calculate new movement vectors
		this.velX = this.velX - P * nX;
		this.velY = this.velY - P * nX;
		ball.velX = ball.velX + P * nX;
		ball.velY = ball.velY + P * nX;

		// move them apart after collision
		while (count-- > 0) {
			this.posX += this.velX * 0.2;
			this.posY += this.velY * 0.2;
			ball.posX += ball.velX * 0.2;
			ball.posY += ball.velY * 0.2;
		}

		// apply friction after collision
		this.velX *= ROLLING_FRICTION;
		this.velY *= ROLLING_FRICTION;
		ball.velX *= ROLLING_FRICTION;
		ball.velY *= ROLLING_FRICTION;
	}
	
}


function createLine(x1, y1, x2, y2) {
	var aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
	aLine.setAttribute('x1', x1);
	aLine.setAttribute('y1', y1);
	aLine.setAttribute('x2', x2);
	aLine.setAttribute('y2', y2);
	aLine.setAttribute('stroke', 'rgb(255,0,0)');
	aLine.setAttribute('stroke-width', 3);
	return aLine;
}