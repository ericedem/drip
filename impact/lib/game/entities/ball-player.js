ig.module(
	'game.entities.ball-player'
)
.requires(
	'game.entities.ball'
)
.defines(function(){


EntityBallPlayer = EntityBall.extend({
	isPlayer: true,

	init: function( x, y, settings ) {
//		this.animSheet = new ig.AnimationSheet( 'media/ball.png', 48, 48, 30 );
		this.parent( x, y, settings );
	},

	update: function() {
		this.wantSwing = ig.input.state('z') || ig.input.state('click');

		this.parent();

		//Center view on player
		ig.game.screen.x = this.pos.x - ig.system.width/2 + this.size.x/2;
		ig.game.screen.y = this.pos.y - ig.system.height/2 + this.size.y/2;

		//Clamp to edges
		if(ig.game.screen.x < 0)
			ig.game.screen.x = 0;
		if(ig.game.screen.y < 0)
			ig.game.screen.y = 0;
		if(ig.game.screen.y + ig.system.height > ig.game.height())
			ig.game.screen.y = ig.game.height() - ig.system.height;
		if(ig.game.screen.x + ig.system.width > ig.game.width())
			ig.game.screen.x = ig.game.width() - ig.system.width;

		//Center if view is larger than map (plus a 10% nudge of player position)
		if(ig.game.height() < ig.system.height)
			ig.game.screen.y = -(ig.system.height - ig.game.height()) / 2
			+ (this.pos.y - ig.game.height() / 2) / 10;
		if(ig.game.width() < ig.system.width)
			ig.game.screen.x = -(ig.system.width - ig.game.width()) / 2
			+ (this.pos.x - ig.game.width() / 2) / 10;
	}
});

});
