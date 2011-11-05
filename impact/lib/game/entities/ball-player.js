ig.module(
	'game.entities.ball-player'
)
.requires(
	'game.entities.ball'
)
.defines(function(){

EntityBallPlayer = EntityBall.extend({
	
//	animSheet: new ig.AnimationSheet( 'media/ball-blue.png', 64, 128 ),
	
	update: function() {
		
		
		if( ig.input.state('z') )
		{
			if(!this.attached)
				this.startSwing();
		}
		else if (this.attached)
			this.endSwing();
		
		
		this.parent();
	}
});

});