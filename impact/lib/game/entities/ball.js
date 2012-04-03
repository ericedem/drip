ig.module(
	'game.entities.ball'
)
.requires(
	'impact.entity',
	'impact.timer'
)
.defines(function(){


//The Ball attached lines must be drawn before any ball, so they are their own entity with a different zIndex
BallLine = ig.Entity.extend({

	parentBall: null,
	zIndex: 5,


	init: function( x, y, settings ) {
		this.parent( 0, 0, settings );
		this.parentBall = settings.ball;
	},

	draw: function() {

		if(this.parentBall && this.parentBall.attached)
		{
			ig.system.context.strokeStyle = '#e3f1ff';
			ig.system.context.lineWidth = 3.0;

			ig.system.context.beginPath();
			ig.system.context.moveTo(
				ig.system.getDrawPos(this.parentBall.centerX() - ig.game.screen.x),
				ig.system.getDrawPos(this.parentBall.centerY() - ig.game.screen.y)
			);
			ig.system.context.lineTo(
				ig.system.getDrawPos(this.parentBall.attachedNode.centerX() - ig.game.screen.x),
				ig.system.getDrawPos(this.parentBall.attachedNode.centerY() - ig.game.screen.y)
			);
			ig.system.context.stroke();
			ig.system.context.closePath();
		}
	},
	});

EntityBall = ig.Entity.extend({

	size: {x:48, y:48},
	type: ig.Entity.BALL,
	collides: ig.Entity.COLLIDES.ACTIVE,

	animSheet: new ig.AnimationSheet( 'media/ball.png', 48, 48 ),
	angle: 0, //radians
	angleSpeed: 0, //radians/s
	zIndex: 10,

	bounciness: .8,
	friction: {x: .2, y: .2},
	gravityFactor: 1,
	stunTimer: null,
	wantSwing: false,
	lastCollisionBall: null,



	init: function( x, y, settings ) {
		this.parent( x, y, settings );

		this.addAnim( 'idle', 0.1, [0,0,0,0,0,0,1,1,2,3,4,3,2,1,1] );
		this.addAnim( 'stun', 0.1, [5,6,7,8,9] );

		this.vel.x = 0;
		this.vel.y = 100;

		this.attached = false;
		this.stunTimer = new ig.Timer();
		ig.game.spawnEntity( "BallLine", 0,0, {"ball":this});
	},


	update: function() {

		//---INPUT---
		if( this.wantSwing )
		{
			if(!this.attached && !this.isStunned())
				this.startSwing();
		}
		else if (this.attached)
			this.endSwing();

		//---STATE---
		//stun finished
		if(!this.isStunned() && this.currentAnim == this.anims['stun'])
		{
			this.currentAnim = this.anims['idle'];
			this.currentAnim.rewind();
		}

		//account for staying inside each other after collision
		if(this.lastCollisionBall != null)
		{
			if(!ig.Entity.circlesCollide(this, this.lastCollisionBall))
			{
				this.lastCollisionBall = null;
			}
		}

		//physics:
		if(this.attached)
		{
			this.last.x = this.pos.x;
			this.last.y = this.pos.y;

			this.angle += this.attachedSpeed * ig.system.tick;
			this.attachedAngle += this.attachedSpeed * ig.system.tick;
			this.attachedSpeed += (this.attachedSpeed > 0 ? 1 : -1)* ig.system.tick;

			this.vel.x = -this.attachedDistance * this.attachedSpeed * Math.sin(this.attachedAngle);
			this.vel.y = this.attachedDistance * this.attachedSpeed * Math.cos(this.attachedAngle);

			var newX = this.attachedNode.centerX() - this.size.x/2 + Math.cos(this.attachedAngle) * this.attachedDistance;
			var newY = this.attachedNode.centerY() - this.size.y/2 + Math.sin(this.attachedAngle) * this.attachedDistance;

			// movement & collision
			var mx = newX - this.last.x;
			var my = newY - this.last.y;
			var res = ig.game.collisionMap.trace(
				this.pos.x, this.pos.y, mx, my, this.size.x, this.size.y
			);
			this.handleMovementTrace( res );

			if( this.currentAnim ) {
				this.currentAnim.update();
			}
		}
		else
		{
			this.angle += this.angleSpeed * ig.system.tick;
			this.parent();
		}
		this.currentAnim.angle = this.angle;
	},

	//worst named function ever award goes to: world collision
	handleMovementTrace: function( res ) {

		if(this.attached){
			if( res.collision.y || res.collision.x ){
				if(this.attachedSpeed > -.5 && this.attachedSpeed < .5)
					this.attachedSpeed = -this.attachedSpeed;
				else
					this.stun(0.5);
			}
			this.pos = res.pos;
		}
		else{
			this.parent(res);
		}
	},

	collideWith: function( otherBall, dx, dy){
		if(this.lastCollisionBall == otherBall)
		{
			return;
		}
		this.stun(0.5);


		this.vel.x += dx;
		this.vel.y += dy;

		this.lastCollisionBall = otherBall;

	},

	startSwing: function() {

		var nodes = ig.game.getEntitiesByType( EntityNode );
		var closestNodeI = 0;
		var closestDistanceSq = this.distanceToSq(nodes[0]);
		for( var e = 1; e < nodes.length; e++ ) {
			var nextDistanceSq = this.distanceToSq(nodes[e]);
			if(nextDistanceSq < closestDistanceSq)
			{
				closestDistanceSq = nextDistanceSq;
				closestNodeI = e;
			}
		}
		this.attachedNode = nodes[closestNodeI];

		this.attachedDistance = Math.sqrt(closestDistanceSq);
		this.attachedAngle = this.attachedNode.angleTo(this);

		var speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
		var direction = Math.atan2(this.vel.y, this.vel.x);
		speed *= -Math.sin(this.attachedAngle - direction);


		this.attachedSpeed = speed / (this.attachedDistance);
		this.attached = true;
	},

	endSwing: function() {
		this.attached = false;

		this.angleSpeed = this.attachedSpeed;
	},

	stun: function(time){
		if(this.attached)
			this.endSwing();
		this.currentAnim = this.anims['stun'];
		this.currentAnim.rewind();
		this.stunTimer.set(time);
	},

	isStunned: function()
	{
		return this.stunTimer.delta() < 0;
	}
});

});
