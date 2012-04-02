ig.module(
	'game.entities.ball-ai'
)
.requires(
	'game.entities.ball'
)
.defines(function(){

EntityBallAi = EntityBall.extend({

	init: function( x, y, settings ) {
		this.animSheet = new ig.AnimationSheet( 'media/ball.png', 48, 48, Math.random() * 360 );
		this.parent( x, y, settings );
	},

	update: function() {
		//TODO: actual AI
		this.wantSwing = true;

		this.parent();
	}
});

});
