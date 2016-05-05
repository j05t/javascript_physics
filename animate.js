GRAVITY = 0.01;
FRICTION = 0.9;
ROLLING_FRICTION = 0.992;
BALL_DIAMETER = 18;
BALL_COUNT = 50;
drawVectors = true;
interval = 1;

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
	var index;
	var time = 0;
	var id = setInterval(frame, interval);
	var balls = [];

	drawVectors = document.getElementById("drawvectors").checked;
	BALL_COUNT = document.getElementById("myRange").value;
	for (var i = 0; i < BALL_COUNT; i++) {
		balls[i] = new ball(-Math.random() * 100, Math.random() * 100, Math
				.random() * 10, Math.random() * 10);
	}

	function frame() {
		if (time == 1000) {
			clearInterval(id);
			for (index = 0; index < balls.length; index++) {
				balls[index].remove();
			}
		} else {
			for (index = 0; index < balls.length; index++) {
				balls[index].move(time);
			}
		}
		time++;
	}
}

function ball(posX, posY, velX, velY) {
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

	this.remove = function() {
		this.elem.remove();
	}

	this.move = function(time) {
		// collision detection + some primitive approximation for friction
		if (this.posX > worldX) {
			this.posX = worldX;
			this.velX = -this.velX * FRICTION;
		}
		if (this.posX < 0) {
			this.posX = 0;
			this.velX = -this.velX * FRICTION;
		}
		if (this.posY > worldY) {
			this.posY = worldY;
			this.velY = -this.velY * FRICTION;
			this.velX = this.velX * ROLLING_FRICTION;
		}
		if (this.posY < 0) {
			this.posY = 0;
			this.velY = -this.velY * FRICTION;
		}

		// update position
		this.velY += GRAVITY * time;
		this.posX += this.velX;
		this.posY += this.velY;

		this.elem.style.top = this.posY + 'px';
		this.elem.style.left = this.posX + 'px';

		// update vector
		if (drawVectors) {
			this.vector.setAttribute('x2', 32 + this.velX);
			this.vector.setAttribute('y2', 32 + this.velY);
		}
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