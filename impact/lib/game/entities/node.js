ig.module(
	'game.entities.node'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityNode = ig.Entity.extend({

	size: {x:100, y:100},
	collides: ig.Entity.COLLIDES.NEVER,

	animSheet: new ig.AnimationSheet( 'media/node.png', 100, 100 ),
	zIndex: 0,

	gravityFactor: 0,

	init: function( x, y, settings ) {
		this.parent( x, y, settings );

		this.addAnim( 'idle', 0.1, [0] );
	}
});

});
