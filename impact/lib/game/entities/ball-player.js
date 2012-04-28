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
		ig.game.screen.x = this.pos.x - ig.system.width/2 + this.size.x/2;
		ig.game.screen.y = this.pos.y - ig.system.height/2 + this.size.y/2;
		if(ig.game.screen.x < 0)
			ig.game.screen.x = 0;
		if(ig.game.screen.y < 0)
			ig.game.screen.y = 0;

		var tileSize = ig.game.collisionMap.tilesize;

		if(ig.game.screen.y + ig.system.height > ig.game.collisionMap.height * tileSize)
			ig.game.screen.y = ig.game.collisionMap.height * tileSize - ig.system.height;
		if(ig.game.screen.x + ig.system.width > ig.game.collisionMap.width * tileSize )
			ig.game.screen.x = ig.game.collisionMap.width * tileSize - ig.system.width;

	}
});

});
