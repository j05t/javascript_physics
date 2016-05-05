GRAVITY = 0.01;
FRICTION = 0.9;
ROLLING_FRICTION = 0.992;
BALL_DIAMETER = 18;
BALL_COUNT = 50;

worldX = 600 - BALL_DIAMETER;
worldY = 600 - BALL_DIAMETER;

function newRange() {
	BALL_COUNT = document.getElementById("myRange").value;
	document.getElementById("range").innerHTML = BALL_COUNT;
}

function myMove() {
	var index;
	var time = 0;
	var id = setInterval(frame, 10);
	var balls = [];

	BALL_COUNT = document.getElementById("myRange").value;
	for (var i = 0; i < BALL_COUNT; i++) {
		balls[i] = new ball(Math.random() * 100, Math.random() * 100, Math
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
	var color = '#' + Math.random().toString(16).substr(2, 6);

	this.elem = document.createElement("div");
	this.elem.style.cssText = ("position: absolute; background-color:" + color);
	this.elem.className = "ball";
	document.getElementById("container").appendChild(this.elem);

	this.posX = posX;
	this.posY = posY;
	this.velX = velX;
	this.velY = velY;

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

		this.velY += GRAVITY * time;
		this.posX += this.velX;
		this.posY += this.velY;

		this.elem.style.top = this.posY + 'px';
		this.elem.style.left = this.posX + 'px';
	}
}
