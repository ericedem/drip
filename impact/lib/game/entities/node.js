ig.module(
	'game.entities.node'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityNode = ig.Entity.extend({
	
	size: {x:48, y:48},
	collides: ig.Entity.COLLIDES.NEVER,
	
	animSheet: new ig.AnimationSheet( 'media/puck.png', 48, 48 ),
	
	gravityFactor: 0,
	
	update: function() {
		
		this.parent();
	},
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.addAnim( 'idle', 0.1, [0,1,2,3,4,4,4,4,3,2,1] );
	}
});

});