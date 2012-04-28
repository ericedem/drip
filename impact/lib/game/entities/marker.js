ig.module(
	'game.entities.marker'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityMarker = ig.Entity.extend({

	size: {x:100, y:100},
	collides: ig.Entity.COLLIDES.NEVER,

	animSheet: new ig.AnimationSheet( 'media/node.png', 100, 100 ),
	zIndex: 0,

	gravityFactor: 0,

	markerType: 0,	//GOAL

	init: function( x, y, settings ) {
		this.parent( x, y, settings );

		this.addAnim( 'idle', 0.1, [0] );
	}
});


ig.Entity.MARKER_TYPE = {
	GOAL:0,
};

});
