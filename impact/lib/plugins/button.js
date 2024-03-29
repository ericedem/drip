// This file came from http://impactjs.com/forums/code/button
// It has been mofified to add a hover state.

// ----- SAMPLE USAGE:
/*
		ig.game.spawnEntity( Button, 8, 8, {
			size: { x: 16, y: 16 },
			animSheet: new ig.AnimationSheet( 'media/button-quit.png', 16, 16 ),
			pressedUp: function() {
				ig.game.gotoMainMenu();
			}
		} );
*/

// A Button Entity for Impact.js
// Has 5 States:
// * hidden - Not shown
// * idle - just sitting there
// * hover - mouse is over button
// * active - someone is pushing on it
// * deactive - shown, but not usable

// And 3 Events
// * pressedDown - activated when pressed Down
// * pressed - constantly fires when pressing
// * pressedUp - activated when button released

// Can render Text. Should explain itself.

// Use like you want to, just don't blame me for anything.

ig.module('plugins.button')
.requires(
'impact.entity'
)
.defines(function() {

	Button = ig.Entity.extend({
		size: { x: 128, y: 32 },

		text: [],
		textPos: { x: 64, y: 8 },
		textAlign: ig.Font.ALIGN.CENTER,
		anchor: 0,

		font: null,

		animSheet: new ig.AnimationSheet( 'media/button.png', 128, 32 ),

		state: 'idle',

		_oldPressed: false,
		_startedIn: false,

		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			this.addAnim( 'idle', 1, [0] );
			this.addAnim( 'hover', 1, [1] );
			this.addAnim( 'active', 1, [2] );
			this.addAnim( 'deactive', 1, [3] );

			if ( this.text.length > 0 && this.font === null ) {
				this.font = ig.game.font || new ig.Font( 'media/font-small.png' );
			}
		},

		update: function() {
			if ( this.state !== 'hidden' ) {
				var _clicked = ig.input.state( 'click' );
				var _in = this._inButton();

				if ( !this._oldPressed && _clicked && _in ) {
					this._startedIn = true;
				}

				if ( this._startedIn && this.state !== 'deactive' && _in ) {
					if ( _clicked ){
						if (this._oldPressed ) {
							this.setState( 'active' );
							this.pressed();
						}
						else {
							this.setState( 'active' );
							this.pressedDown();
						}
					}
					else if ( this._oldPressed ) { // up
						this.setState( 'hover' );
						this.pressedUp();
					}
				}
				else if ( _in ) {
					this.setState( 'hover' );
				}
				else if ( this.state === 'active' || this.state === 'hover' ) {
					this.setState( 'idle' );
				}

				if ( this._oldPressed && !_clicked ) {
					this._startedIn = false;
				}

				this._oldPressed = _clicked;
			}
		},

		draw: function() {
			if ( this.state !== 'hidden' ) {

				var anchorPos = this.findAnchor();
				this.currentAnim.draw(anchorPos.x, anchorPos.y);

				for ( var i = 0; i < this.text.length; i++ ) {
					this.font.draw(
					this.text[i],
					anchorPos.x + this.textPos.x,
					anchorPos.y + ((this.font.height + 2) * i) + this.textPos.y,
					this.textAlign
					);
				}
			}
		},

		findAnchor: function() {

			//find position via anchor
			var drawX = Math.round(this.pos.x);
			var drawY = Math.round(this.pos.y);
			switch(this.anchor)
			{
				case ig.Entity.BUTTON_ANCHOR.SCREEN:
					drawX -= ig.game.screen.x;
					drawY -= ig.game.screen.y;
					break;

				case ig.Entity.BUTTON_ANCHOR.CENTER:
					drawX += ig.system.width/2 - this.size.x/2;
					drawY += ig.system.height/2 - this.size.y/2;
					break;

				case ig.Entity.BUTTON_ANCHOR.NONE:
				default:
			}
			drawX -= this.offset.x;
			drawY -= this.offset.y;
			return {x:drawX, y:drawY};
		},

		setState: function( s ) {
			this.state = s;

			if ( this.state !== 'hidden' ) {
				this.currentAnim = this.anims[ this.state ];
			}
		},

		pressedDown: function() {},
		pressed: function() {},
		pressedUp: function() {},

		_inButton: function() {
			var anchorPos = this.findAnchor();
			return ig.input.mouse.x - anchorPos.x > 0 &&
			ig.input.mouse.x - anchorPos.x < this.size.x &&
			ig.input.mouse.y - anchorPos.y > 0 &&
			ig.input.mouse.y - anchorPos.y < this.size.y;
		}
	});

	ig.Entity.BUTTON_ANCHOR = {
		NONE:0,
		SCREEN: 1,
		CENTER: 2 //TODO: RIGHT, TOP, BOTTOM?
	};

});
