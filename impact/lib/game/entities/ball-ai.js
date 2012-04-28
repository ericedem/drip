ig.module(
	'game.entities.ball-ai'
)
.requires(
	'game.entities.ball'
)
.defines(function(){

EntityBallAi = EntityBall.extend({

	init: function( x, y, settings ) {
		var randomSkin = this.skinFiles[Math.floor(Math.random()*this.skinFiles.length)];
		this.animSheet = new ig.AnimationSheet( randomSkin, 48, 48, Math.random() * 360 );
		this.parent( x, y, settings );
	},

	update: function() {
		//TODO: actual AI
		this.wantSwing = true;

		this.parent();
	}
});

});
