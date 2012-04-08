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
		this.wantSwing = ig.input.state('z');

		this.parent();
	},
	
	/**
	 * NOTIFY SERVER
	 */
	startSwing: function() {
		ig.game.socket.emit('startSwing', {msg:"hello"});
		this.parent();
	},
	
	endSwing: function() {
		ig.game.socket.emit('endSwing',{});
		this.parent();
	}
	
});

});
