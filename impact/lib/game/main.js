ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	
	'game.entities.ball-player',
	'game.entities.ball-ai',
	'game.entities.node',
	
	'game.levels.main'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	
	gravity:500,
	init: function() {
		ig.input.bind( ig.KEY.Z, 'z' );
		ig.input.bind( ig.KEY.ADD, '+' );
		ig.input.bind( ig.KEY.SUBSTRACT, '-' );
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