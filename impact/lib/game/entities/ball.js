ig.module(
	'game.entities.ball'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityBall = ig.Entity.extend({
	
	size: {x:48, y:48},
	collides: ig.Entity.COLLIDES.ACTIVE,
	
	animSheet: new ig.AnimationSheet( 'media/puck.png', 48, 48 ),
	
	bounciness: 1,
	gravityFactor: 1,
	
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.addAnim( 'idle', 0.1, [0,1,2,3,4,4,4,4,3,2,1] );
		
		this.vel.x = 0;
		this.vel.y = 100;
		
		this.attached = false;
	},
	
	
	update: function() {
		
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
	
	startSwing: function() {
		
		var nodes = ig.game.getEntitiesByType( EntityNode );
		var closestNode = 0;
		var closestDistance = this.distanceTo(nodes[0]);
		for( var e = 1; e < nodes.length; e++ ) {
			var nextDistance = this.distanceTo(nodes[e]);
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
	}
});

});