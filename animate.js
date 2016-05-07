GRAVITY = 0.2;
FRICTION = 0.8;
ROLLING_FRICTION = 0.98;
BALL_DIAMETER = 16;
BALL_COUNT = 20;
drawVectors = true;
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

function myMove() {
	var i = 0;
	var time = 0;
	var id = setInterval(frame, interval);
	var balls = [];
	drawVectors = document.getElementById("drawvectors").checked;
	BALL_COUNT = document.getElementById("myRange").value;

	// spawn balls
	for (i = 0; i < BALL_COUNT; i++) {
		balls[i] = new ball((i + 1) * 22, i, Math.random() * 10, Math
				.random() * 10);
	}

	function frame() {
		if (time == 1000) {
			clearInterval(id);
			for (i = 0; i < balls.length; i++) {
				balls[i].remove();
			}
		} else {
			for (var i = 0; i < balls.length; i++)
				balls[i].move(time);

			for (i = 0; i < balls.length; i++)
				for (var j = i + 1; j < BALL_COUNT; j++)
					if (balls[i].detectCollision(balls[j]))
						balls[i].resolveCollision(balls[j]);
		}
		time++;
	}
}

ball = function(posX, posY, velX, velY) {
	this.posX = posX;
	this.posY = posY;
	this.velX = velX;
	this.velY = velY;

	var color = '#' + Math.random().toString(16).substr(2, 6);
	this.elem = document.createElement("div");
	this.elem.style.cssText = ("position: absolute; background-color:" + color);
	this.elem.className = "ball";

	if (drawVectors) {
		this.svg = document
				.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.svg.style.cssText = ("position: absolute;height:64px; width:64px;top:"
				+ (-32 + BALL_DIAMETER / 2)
				+ ";left:"
				+ (-32 + BALL_DIAMETER / 2) + ";")
		this.vector = createLine(32, 32, 32, 32);
		document.getElementById("container").appendChild(this.elem)
				.appendChild(this.svg).appendChild(this.vector);
	} else {
		document.getElementById("container").appendChild(this.elem);
	}

	ball.prototype.remove = function() {
		this.elem.remove();
	}

	ball.prototype.move = function(time) {
		// calculate next position
		this.velY += GRAVITY;
		this.posX += this.velX;
		this.posY += this.velY;

		// collision detection + some primitive approximation for friction
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

		// update position
		this.elem.style.top = this.posY + 'px';
		this.elem.style.left = this.posX + 'px';

		// update vector
		if (drawVectors) {
			this.vector.setAttribute('x2', 32 + this.velX);
			this.vector.setAttribute('y2', 32 + this.velY);
		}
	}

	ball.prototype.detectCollision = function(ball) {
		if (this == ball)
			return false;
		
		var distX = ball.posX - this.posX;
		var distY = ball.posY - this.posY;
		var distance = distX * distX + distY * distY;

		if (distance <= BALL_DIAMETER * BALL_DIAMETER)
			return true;
		else
			return false;
	}

	ball.prototype.resolveCollision = function(ball) {
		// just exchange velocities for now..
		var temp = 0;
		temp = this.velX;
		this.velX = ball.velX;
		ball.velX = temp;

		temp = this.velY;
		this.velY = ball.velY;
		ball.velY = temp;

		// move them apart according to their new velocities
		this.posX += this.velX;
		this.posY += this.velY;
		ball.posX += ball.velX;
		ball.posY += ball.velY;

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