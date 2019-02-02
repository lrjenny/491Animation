function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.drawStatic = function (ctx, x, y) {
    ctx.drawImage(this.spriteSheet, x, y);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

/////////////////////////////////////////////////////////////////////////////////////////

function Background(game) {
	this.fbg = true;
	this.animation = new Animation(ASSET_MANAGER.getAsset("./img/FutureCity.gif"), 0, 0, 1500, 900, 1, 1, true, true);
    Entity.call(this, game, -200, -100);
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
	if(this.game.m) {
		if(this.fbg) {
			this.animation = new Animation(ASSET_MANAGER.getAsset("./img/PinkCity.gif"), 0, 0, 1500, 900, 1, 1, true, true);
			this.fbg = false;
		}else {
			this.animation = new Animation(ASSET_MANAGER.getAsset("./img/FutureCity.gif"), 0, 0, 1500, 900, 1, 1, true, true);
			this.fbg = true;
		}
		this.game.m = false;
	}
}

Background.prototype.draw = function (ctx) {
	this.animation.drawStatic(ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

///////////////////////////////////////////////////////////////////////////////////////////

function Selector(game) {
	this.cat = 0;
	this.size = 256;
	this.updateAnimation();
    Entity.call(this, game, 280, 236);
}

Selector.prototype = new Entity();
Selector.prototype.constructor = Selector;

Selector.prototype.updateAnimation = function() {
	this.animation = new Animation(ASSET_MANAGER.getAsset("./img/idleBigNames.png"), 0, this.cat, this.size, this.size, 0.1, 4, true, false);
}

Selector.prototype.update = function () {
	if(this.game.enter) {
		this.removeFromWorld = true;
	}
	if(this.game.space) {
		if(this.cat == (this.size * 8) - this.size ? this.cat = 0 : this.cat += this.size);
		this.updateAnimation();
	}
}

Selector.prototype.draw = function (ctx) {
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	Entity.prototype.draw.call(this);
}

///////////////////////////////////////////////////////////////////////////////////////////

function Karate(game) {
	this.punching = false;
	this.jumping = false;
	this.beginJump = false;
	this.inAir = false;
	this.landing = false;
	this.right = true;
	this.size = 128;
	this.speed = 5;
	//this.animation = new Animation(ASSET_MANAGER.getAsset("./img/Karate.png"), 0, 0, this.size, this.size, 0.1, 4, true, false);
	this.spawn = new Animation(ASSET_MANAGER.getAsset("./img/Flames2.png"), 0, 0, this.size, this.size, 0.08, 8, false, false);
	this.idleRight = new Animation(ASSET_MANAGER.getAsset("./img/Karate.png"), 0, 0, this.size, this.size, 0.1, 4, true, false);
	this.idleLeft = new Animation(ASSET_MANAGER.getAsset("./img/KarateReverse.png"), (this.size * 12), (0 * this.size), this.size, this.size, 0.1, 4, true, true);
	this.punchRight = new Animation(ASSET_MANAGER.getAsset("./img/Karate.png"), 0, (9 * this.size), this.size, this.size, 0.05, 10, false, false);
	this.punchLeft = new Animation(ASSET_MANAGER.getAsset("./img/KarateReverse.png"), (this.size * 6), (9 * this.size), this.size, this.size, 0.05, 10, false, true);
	this.walkRight = new Animation(ASSET_MANAGER.getAsset("./img/Karate.png"), 0, (1 * this.size), this.size, this.size, 0.06, 8, true, false);
	this.walkLeft = new Animation(ASSET_MANAGER.getAsset("./img/KarateReverse.png"), (this.size * 8), (1 * this.size), this.size, this.size, 0.06, 8, true, true);
	this.jumpRight = new Animation(ASSET_MANAGER.getAsset("./img/Karate.png"), 0, (2 * this.size), this.size, this.size, 0.06, 8, false, false);
	this.air = new Animation(ASSET_MANAGER.getAsset("./img/Karate.png"), (this.size * 3), (2 * this.size), this.size, this.size, 1, 1, true, false);
	this.land = new Animation(ASSET_MANAGER.getAsset("./img/Karate.png"), (this.size * 4), (2 * this.size), this.size, this.size, 0.1, 4, false, false);
	this.jumpLeft = new Animation(ASSET_MANAGER.getAsset("./img/KarateReverse.png"), (this.size * 8), (2 * this.size), this.size, this.size, 0.06, 8, false, false);
    Entity.call(this, game, 340, 345);
}

Karate.prototype = new Entity();
Karate.prototype.constructor = Karate;

Karate.prototype.update = function () {
	if(this.game.space) this.jumping = true;
	if(this.jumping) {
		// var maxJumpHeight = 200;
		// if(this.inAir = false) {
			// this.y += 1;
			// this.beginJump = true;
			// if(this.jumpRight.isDone()) {
				// this.inAir = true;
				// dy += 101;
			// }
		// } else if(this.dy < 100) {
			// this.landing = true;
			// if(this.landing.isDone()){
				// this.jumping = false;
				// this.beginJump = false;
				// this.inAir = false;
				// this.landing = false;
			// }
		// }
		// if(this.y < maxJumpHeight) {
	// }
		//var jumpDistance = this.jumpRight.elapsedTime / this.jumpRight.totalTime;
		if(this.right) {
			if (this.jumpRight.isDone()) {
				this.jumpRight.elapsedTime = 0;
				this.jumping = false;
			}
			var jumpDistance = this.jumpRight.elapsedTime / this.jumpRight.totalTime;
		} else {
			if (this.jumpLeft.isDone()) {
				this.jumpLeft.elapsedTime = 0;
				this.jumping = false;
			}
			var jumpDistance = this.jumpLeft.elapsedTime / this.jumpLeft.totalTime;
		}
		
        var totalHeight = 100;
		if (jumpDistance > 0.5) jumpDistance = 1 - jumpDistance;
		var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
		
		this.y = 345 - height;
	}
	
	if (this.game.right) {
		this.punching = false;
		if(!this.jumping) {
			this.right = true;
		}
		this.x += this.speed;
	}
	if (this.game.left) {
		this.punching = false;
		if(!this.jumping) {
			this.right = false;
		}
		this.x -= this.speed;
	}
	
	if(this.game.w) {
		this.punching = true;
		this.speed = 0;
	} else {
		this.speed = 5;
	}
	if(this.punching) {
		if(this.right) {
			if(this.punchRight.isDone()) {
				this.punchRight.elapsedTime = 0;
				this.punching = false;
			}
		} else {
			if(this.punchLeft.isDone()) {
				this.punchLeft.elapsedTime = 0;
				this.punching = false;
			}
		}
	}
}

Karate.prototype.draw = function (ctx) {
	this.spawn.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	// if(this.jumping) {
		// if(this.right) {
			// this.jumpRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		// } else {
			// this.jumpLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		// }
		// if(this.beginJump) { this.jumpRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);} 
		// else if(this.inAir) { this.air.drawFrame(this.game.clockTick, ctx, this.x, this.y);} 
		// else if(this.landing) { this.landing.drawFrame(this.game.clockTick, ctx, this.x, this.y); }
	if(this.right) {
		if(this.jumping) {
			this.jumpRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if(this.punching) {
			this.punchRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if(this.game.right) {
			this.walkRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else {
			this.idleRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		}
	} else {
		if(this.jumping) {
			this.jumpLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if(this.punching) {
			this.punchLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if(this.game.left) {
			this.walkLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else {
			this.idleLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		}
	}
	Entity.prototype.draw.call(this);
}

///////////////////////////////////////////////////////////////////////////////////////////

function Txt(game, x, y, animation) {
	this.animation = animation;
    Entity.call(this, game, x, y);
}

Txt.prototype = new Entity();
Txt.prototype.constructor = Txt;
	
Txt.prototype.update = function () {
	if (this.game.enter) {
		this.removeFromWorld = true;
	}
}

Txt.prototype.draw = function (ctx) {
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	Entity.prototype.draw.call(this);
}

///////////////////////////////////////////////////////////////////////////////////////////

function Platform(game, x, y) {
	this.animation = new Animation(ASSET_MANAGER.getAsset("./img/PinkPlatform.png"), 0, 0, 700, 50, 1, 1, true, true);
    Entity.call(this, game, x, y);
}
Platform.prototype.update = function () {}
Platform.prototype.draw = function (ctx) {
    this.animation.drawStatic(ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

///////////////////////////////////////////////////////////////////////////////////////////

function Ready(game) {
	this.show = false;
	this.animation = new Animation(ASSET_MANAGER.getAsset("./img/Ready.png"), 0, 0, 800, 700, 0.05, 8, false, false);
    Entity.call(this, game, 0, 0);
}

Ready.prototype = new Entity();
Ready.prototype.constructor = Ready;
	
Ready.prototype.update = function () {
	if (this.game.enter && !this.show) {
		this.show = true;
		this.reverse();
	}
}

Ready.prototype.reverse = function () {
	var that = this;
	window.setTimeout(function() {that.animation = new Animation(ASSET_MANAGER.getAsset("./img/Ready.png"), 5600, 0, 800, 700, 1, 1, true, false);}, 390);
	window.setTimeout(function() {that.animation = new Animation(ASSET_MANAGER.getAsset("./img/Ready.png"), 0, 0, 800, 700, 0.05, 8, false, true);}, 2000);
	window.setTimeout(function() {that.game.addEntity(new Karate(that.game));}, 2410);
	window.setTimeout(function() {alert("The only fully animated character is this one at the moment.\nThis demo includes walking, jumping, and punching. \nA = left, D = right, W = punch, Space = jump");}, 3410);
	window.setTimeout(function() {that.removeFromWorld = true;}, 4000);
}

Ready.prototype.draw = function (ctx) {
	if(this.show == true) {
		this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	}
	Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/idleBigNames.png");
ASSET_MANAGER.queueDownload("./img/ChooseYourCharacter.png");
ASSET_MANAGER.queueDownload("./img/PinkCity.gif");
ASSET_MANAGER.queueDownload("./img/FutureCity.gif");
ASSET_MANAGER.queueDownload("./img/info.png");
ASSET_MANAGER.queueDownload("./img/PinkPlatform.png");
ASSET_MANAGER.queueDownload("./img/Ready.png");
ASSET_MANAGER.queueDownload("./img/Flames2.png");
ASSET_MANAGER.queueDownload("./img/Karate.png");
ASSET_MANAGER.queueDownload("./img/KarateReverse.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
	var karate = new Karate(gameEngine);
    var bg = new Background(gameEngine);
	var selector = new Selector(gameEngine);
	var txt = new Txt(gameEngine, 230, 100, new Animation(ASSET_MANAGER.getAsset("./img/ChooseYourCharacter.png"), 0, 0, 350, 100, 0.15, 6, true, false));
	var info = new Txt(gameEngine, 0, 550, new Animation(ASSET_MANAGER.getAsset("./img/info.png"), 0, 0, 800, 150, 1, 1, true, true));
	var platform = new Platform(gameEngine, 50, 450);
	var ready = new Ready(gameEngine);

    gameEngine.addEntity(bg);
	gameEngine.addEntity(platform);
	gameEngine.addEntity(selector);
	gameEngine.addEntity(txt);
	gameEngine.addEntity(info);
	gameEngine.addEntity(ready);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
