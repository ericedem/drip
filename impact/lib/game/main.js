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

	'game.config',

	'plugins.button'
)
.defines(function(){

MyGame = ig.Game.extend({

	// Load a font
	font: new ig.Font( 'media/font-LucidaGrande.png' ),

	state : '',

	playButton : null,

	gravity:500,
	init: function() {

		ig.input.bind( ig.KEY.MOUSE1, 'click' );
		ig.input.bind( ig.KEY.Z, 'z' );
		ig.input.bind( ig.KEY.Q, 'quit' );
		ig.input.bind( ig.KEY.ADD, '+' );
		ig.input.bind( ig.KEY.SUBSTRACT, '-' );

		this.mainMenu();
	},

	loadLevel: function(level) {
		this.parent(level);

		//HUD buttons over every level
		ig.game.spawnEntity( Button, 8, 8, {
			size: { x: 16, y: 16 },
			animSheet: new ig.AnimationSheet( 'media/button-quit.png', 16, 16 ),
			pressedUp: function() {
				ig.game.gotoMainMenu();
			}
		} );

		this.state = 'game';

	},

	mainMenu: function() {
		ig.game.spawnEntity( Button, 768/2 - 64, 480/2-16,  {
			text: [ 'Play' ],

			pressedUp: function() {
				ig.game.loadLevelDeferred( LevelMain );
			}
		} );

		ig.game.spawnEntity( Button, 768/2 - 64, 480/2+32,  {
			text: [ 'Tutorial' ],

			pressedUp: function() {
				alert("Tutorial NYI");
//				ig.game.loadLevel( Tutorial );
			}
		} );

		this.state = 'menu';
	},

	gotoMainMenu: function() {
		if(this.state == 'menu')
			return;
		this.clearLevelDeferred(this.mainMenu);
	},

	update: function() {
		// Update all entities and backgroundMaps
		if(ig.input.state('quit')){
			this.gotoMainMenu();
		}
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
