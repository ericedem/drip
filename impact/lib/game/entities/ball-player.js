ig.module(
	'game.entities.ball-player'
)
.requires(
	'game.entities.ball'
)
.defines(function(){

EntityBallPlayer = EntityBall.extend({
	
	update: function() {
		//handle input is the only way the player ball is special
		this.wantSwing = ig.input.state('z');
		
		this.parent();
	}
});

});