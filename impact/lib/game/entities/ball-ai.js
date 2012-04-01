ig.module(
	'game.entities.ball-ai'
)
.requires(
	'game.entities.ball'
)
.defines(function(){

EntityBallAi = EntityBall.extend({
	
	update: function() {
		//TODO: actual AI
		this.wantSwing = true;
		
		this.parent();
	}
});

});