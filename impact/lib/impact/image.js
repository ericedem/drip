ig.module(
	'impact.image'
)
.defines(function(){

ig.Image = ig.Class.extend({
	data: null,
	width: 0,
	height: 0,
	loaded: false,
	failed: false,
	loadCallback: null,
	path: '',
	hueShift: 0,


	staticInstantiate: function( path, hueShift ) {
		return ig.Image.cache[path+hueShift] || null;
	},


	init: function( path, hueShift ) {
		this.path = path;
		if(hueShift)
			this.hueShift = hueShift;
		this.load();
	},


	load: function( loadCallback ) {
		if( this.loaded ) {
			if( loadCallback ) {
				loadCallback( this.path, true );
			}
			return;
		}
		else if( !this.loaded && ig.ready ) {
			this.loadCallback = loadCallback || null;

			this.data = new Image();
			this.data.onload = this.onload.bind(this);
			this.data.onerror = this.onerror.bind(this);
			this.data.src = this.path + ig.nocache;
		}
		else {
			ig.addResource( this );
		}

		ig.Image.cache[this.path] = this;
	},


	reload: function() {
		this.loaded = false;
		this.data = new Image();
		this.data.onload = this.onload.bind(this);
		this.data.src = this.path + '?' + Date.now();
	},


	onload: function( event ) {
		this.width = this.data.width;
		this.height = this.data.height;

		if( ig.system.scale != 1 ) {
			this.resize( ig.system.scale );
		}
		if( this.hueShift != 0 ) {
			this.shiftHue( this.hueShift );
		}
		this.loaded = true;

		if( this.loadCallback ) {
			this.loadCallback( this.path, true );
		}
	},


	onerror: function( event ) {
		this.failed = true;

		if( this.loadCallback ) {
			this.loadCallback( this.path, false );
		}
	},


	resize: function( scale ) {
		// Nearest-Neighbor scaling

		// The original image is drawn into an offscreen canvas of the same size
		// and copied into another offscreen canvas with the new size.
		// The scaled offscreen canvas becomes the image (data) of this object.

		var widthScaled = this.width * scale;
		var heightScaled = this.height * scale;

		var orig = ig.$new('canvas');
		orig.width = this.width;
		orig.height = this.height;
		var origCtx = orig.getContext('2d');
		origCtx.drawImage( this.data, 0, 0, this.width, this.height, 0, 0, this.width, this.height );
		var origPixels = origCtx.getImageData(0, 0, this.width, this.height);

		var scaled = ig.$new('canvas');
		scaled.width = widthScaled;
		scaled.height = heightScaled;
		var scaledCtx = scaled.getContext('2d');
		var scaledPixels = scaledCtx.getImageData( 0, 0, widthScaled, heightScaled );

		for( var y = 0; y < heightScaled; y++ ) {
			for( var x = 0; x < widthScaled; x++ ) {
				var index = (Math.floor(y / scale) * this.width + Math.floor(x / scale)) * 4;
				var indexScaled = (y * widthScaled + x) * 4;
				scaledPixels.data[ indexScaled ] = origPixels.data[ index ];
				scaledPixels.data[ indexScaled+1 ] = origPixels.data[ index+1 ];
				scaledPixels.data[ indexScaled+2 ] = origPixels.data[ index+2 ];
				scaledPixels.data[ indexScaled+3 ] = origPixels.data[ index+3 ];
			}
		}
		scaledCtx.putImageData( scaledPixels, 0, 0 );
		this.data = scaled;
	},


	shiftHue: function( scale ) {
		// The original image is drawn into an offscreen canvas of the same size
		// and copied into another offscreen canvas with the new size.
		// The shifted offscreen canvas becomes the image (data) of this object.

		var orig = ig.$new('canvas');
		orig.width = this.width;
		orig.height = this.height;
		var origCtx = orig.getContext('2d');
		origCtx.drawImage( this.data, 0, 0, this.width, this.height, 0, 0, this.width, this.height );
		var origPixels = origCtx.getImageData(0, 0, this.width, this.height);

		var shifted = ig.$new('canvas');
		shifted.width = this.width;
		shifted.height = this.height;
		var shiftedCtx = shifted.getContext('2d');
		var shiftedPixels = shiftedCtx.getImageData( 0, 0, this.width, this.height);

		for( var y = 0; y < this.height; y++ ) {
			for( var x = 0; x < this.width; x++ ) {
				var index = (y * this.width + x) * 4;
				var r = origPixels.data[ index ];
				var g = origPixels.data[ index+1 ];
				var b = origPixels.data[ index+2 ];
				var hsv = rgbToHsv(r,g,b);
				hsv[0] += scale / 360;
				var newRGB = hsvToRgb(hsv[0], hsv[1], hsv[2]);
				shiftedPixels.data[ index ] = newRGB[0];
				shiftedPixels.data[ index+1 ] = newRGB[1];
				shiftedPixels.data[ index+2 ] = newRGB[2];
				shiftedPixels.data[ index+3 ] = origPixels.data[ index+3 ];
			}
		}
		shiftedCtx.putImageData( shiftedPixels, 0, 0 );
		this.data = shifted;

	},


	draw: function( targetX, targetY, sourceX, sourceY, width, height ) {
		if( !this.loaded ) { return; }

		var scale = ig.system.scale;
		sourceX = sourceX ? sourceX * scale : 0;
		sourceY = sourceY ? sourceY * scale : 0;
		width = (width ? width : this.width) * scale;
		height = (height ? height : this.height) * scale;

		ig.system.context.drawImage(
			this.data, sourceX, sourceY, width, height,
			ig.system.getDrawPos(targetX),
			ig.system.getDrawPos(targetY),
			width, height
		);

		ig.Image.drawCount++;
	},


	drawTile: function( targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY ) {
		tileHeight = tileHeight ? tileHeight : tileWidth;

		if( !this.loaded || tileWidth > this.width || tileHeight > this.height ) { return; }

		var scale = ig.system.scale;
		var tileWidthScaled = tileWidth * scale;
		var tileHeightScaled = tileHeight * scale;

		var scaleX = flipX ? -1 : 1;
		var scaleY = flipY ? -1 : 1;

		if( flipX || flipY ) {
			ig.system.context.save();
			ig.system.context.scale( scaleX, scaleY );
		}
		ig.system.context.drawImage(
			this.data,
			( Math.floor(tile * tileWidth) % this.width ) * scale,
			( Math.floor(tile * tileWidth / this.width) * tileHeight ) * scale,
			tileWidthScaled,
			tileHeightScaled,
			ig.system.getDrawPos(targetX) * scaleX - (flipX ? tileWidthScaled : 0),
			ig.system.getDrawPos(targetY) * scaleY - (flipY ? tileHeightScaled : 0),
			tileWidthScaled,
			tileHeightScaled
		);
		if( flipX || flipY ) {
			ig.system.context.restore();
		}

		ig.Image.drawCount++;
	}
});


/**
 * http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
 *
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b){
    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}

ig.Image.drawCount = 0;
ig.Image.cache = {};
ig.Image.reloadCache = function() {
	for( path in ig.Image.cache ) {
		ig.Image.cache[path].reload();
	}
};

});
