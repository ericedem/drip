ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	
	'game.entities.ball-player',
	'game.entities.ball-ai',
	'game.entities.node',
	
	'game.levels.main',
	
	'game.config'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	
	socket: null,
	
	gravity:500,
	init: function() {
		ig.input.bind( ig.KEY.MOUSE1, 'z' );
		ig.input.bind( ig.KEY.Z, 'z' );
		ig.input.bind( ig.KEY.ADD, '+' );
		ig.input.bind( ig.KEY.SUBSTRACT, '-' );
		
		//initialize socket as we should only use 1 per session
		this.socket = io.connect('http://localhost:5678');
		var self = this;
		this.socket.on('news',function(data){
			console.log(data);
		});
		
		this.loadLevel( LevelMain );
	},
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		
		// Add your own, additional update code here
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
	}
});


ig.main( '#canvas', MyGame, 60, 768, 480, 1 );

});