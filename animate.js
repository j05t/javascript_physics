GRAVITY = 0.081;
FRICTION = 0.6;
ROLLING_FRICTION = 0.92;
BALL_DIAMETER = 18;
drawVectors = false;
interval = 20;

worldX = 600 - BALL_DIAMETER;
worldY = 600 - BALL_DIAMETER;

function generateRandomElements(count) {
	var balls = [];
	var X = 6;
	var Y = 100;
	for (var i = 0; i < count; i++) {
		if (X > 550) {
			X = 6;
			Y += 30;
		}

		balls[i] = new Ball(X += 30, Y, Math.random() * 4, Math.random() * 2);
	}
	return balls;
}

function start() {
	var time = 0;
	var balls = generateRandomElements(document.getElementById("myRange").value);
	var id = setInterval(frame, document.getElementById("myTimeRes").value);

	// move objects and apply forces to all elements
	function frame() {
		if (time > 3000) {
			clearInterval(id);
			for (var i = 0; i < balls.length; i++)
				balls[i].elem.remove();
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
		for (i = 0; i < balls.length - 1; i++)
			for (var j = i + 1; j < balls.length
					&& balls[i].posX + BALL_DIAMETER >= balls[j].posX; j++)
				if (balls[i].detectCollision(balls[j]))
					balls[i].resolveCollision(balls[j]);

	}

	function insertionSort(items) {
		var len = items.length, // number of items in the array
		value, // the value currently being compared
		i, // index into unsorted section
		j; // index into sorted section

		for (i = 0; i < len; i++) {
			// store the current value because it may shift later
			value = items[i];

			/*
			 * Whenever the value in the sorted section is greater than the
			 * value in the unsorted section, shift all items in the sorted
			 * section over by one. This creates space in which to insert the
			 * value.
			 */
			for (j = i - 1; j > -1 && items[j].posX > value.posX; j--)
				items[j + 1] = items[j];

			items[j + 1] = value;
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

	document.getElementById("container").appendChild(this.elem);
}

Ball.prototype.applyForces = function() {
	// apply gravity
	if (this.posY < worldY)
		this.velY += GRAVITY;

	// apply velocity
	this.posX += this.velX;
	this.posY += this.velY;
}

// detect border collisions, add friction on contact
Ball.prototype.handleBorderCollision = function() {
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
	this.elem.style.top = Math.round(this.posY) + 'px';
	this.elem.style.left = Math.round(this.posX) + 'px';
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
	var distX, distY, distance;
	var count = 0;

	// move objects apart to point before collision
	do {
		this.posX -= this.velX * 0.2;
		this.posY -= this.velY * 0.2;
		ball.posX -= ball.velX * 0.2;
		ball.posY -= ball.velY * 0.2;

		distX = ball.posX - this.posX;
		distY = ball.posY - this.posY;
		distance = distX * distX + distY * distY;
		count++;
	} while (distance < BALL_DIAMETER * BALL_DIAMETER);

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