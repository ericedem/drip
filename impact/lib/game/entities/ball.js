ig.module(
	'game.entities.ball'
)
.requires(
	'impact.entity',
	'impact.timer'
)
.defines(function(){

EntityBall = ig.Entity.extend({
	
	size: {x:48, y:48},
	type: ig.Entity.BALL,
	collides: ig.Entity.COLLIDES.ACTIVE,
	
	animSheet: new ig.AnimationSheet( 'media/puck.png', 48, 48 ),
	
	bounciness: 1,
	gravityFactor: 1,
	stunTimer: null,
	wantSwing: false,
	
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.addAnim( 'idle', 0.1, [2,3,4,4,4,3] );
		this.addAnim( 'stun', 0.1, [0] );
		
		this.vel.x = 0;
		this.vel.y = 100;
		
		this.attached = false;
		this.stunTimer = new ig.Timer();
	},
	
	
	update: function() {
		
		//input:
		if( this.wantSwing )
		{
			if(!this.attached && !this.isStunned())
				this.startSwing();
		}
		else if (this.attached)
			this.endSwing();
			
		//state:
		if(!this.isStunned() && this.currentAnim == this.anims['stun'])
			this.currentAnim = this.anims['idle'];
		
		//physics:
		if(this.attached)
		{
			this.last.x = this.pos.x;
			this.last.y = this.pos.y;
			
			this.attachedAngle += this.attachedSpeed * ig.system.tick;
			this.attachedSpeed += (this.attachedSpeed > 0 ? 1 : -1)* ig.system.tick;
			
			this.vel.x = -this.attachedDistance * this.attachedSpeed * Math.sin(this.attachedAngle);
			this.vel.y = this.attachedDistance * this.attachedSpeed * Math.cos(this.attachedAngle);
			
			var newX = this.attachedNode.pos.x + Math.cos(this.attachedAngle) * this.attachedDistance;
			var newY = this.attachedNode.pos.y + Math.sin(this.attachedAngle) * this.attachedDistance;
			
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
			this.parent();
	},

	//world collision
	handleMovementTrace: function( res ) {
	
		if(this.attached){
			if( res.collision.y || res.collision.x ){
				this.stun(0.5);
			}
			this.pos = res.pos;
		}
		else{
			this.parent(res);
		}
	},		
	
	collideWith: function( other, power){
		this.stun(0.5);
	},
	
	startSwing: function() {
		
		var nodes = ig.game.getEntitiesByType( EntityNode );
		var closestNode = 0;
		var closestDistance = this.distanceToSq(nodes[0]);
		for( var e = 1; e < nodes.length; e++ ) {
			var nextDistance = this.distanceToSq(nodes[e]);
			if(nextDistance < closestDistance)
			{
				closestDistance = nextDistance;
				closestNode = e;
			}
		}
		this.attachedNode = nodes[closestNode];
		
		this.attachedDistance = this.attachedNode.distanceTo(this);
		this.attachedAngle = this.attachedNode.angleTo(this);
		
		var speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
		var direction = Math.atan2(this.vel.y, this.vel.x);
		speed *= -Math.sin(this.attachedAngle - direction);
		
		
		this.attachedSpeed = speed / (this.attachedDistance);
		this.attached = true;
	},
	
	endSwing: function() {
		this.attached = false;
	},
	
	stun: function(time){
		this.endSwing();
		this.currentAnim = this.anims['stun'];
		this.stunTimer.set(time);
	},
	
	isStunned: function()
	{
		return this.stunTimer.delta() < 0;
	}
});

});