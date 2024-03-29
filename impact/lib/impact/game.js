ig.module(
	'impact.game'
)
.requires(
	'impact.impact',
	'impact.entity',
	'impact.collision-map',
	'impact.background-map'
)
.defines(function(){

ig.Game = ig.Class.extend({

	clearColor: '#000000',
	gravity: 0,
	screen: {x: 0, y: 0},

	entities: [],

	namedEntities: {},
	collisionMap: ig.CollisionMap.staticNoCollision,
	backgroundMaps: [],
	backgroundAnims: {},

	cellSize: 64,

	_deferredKill: [],
	_levelToLoad: null,
	_clearLevel: false,
	_clearLevelCallback: null,
	_doSortEntities: false,


	staticInstantiate: function() {
		ig.game = this;
		return null;
	},

	clearLevel: function(clearCallback) {

		this.screen = {x: 0, y: 0};

		// Entities
		this.entities = [];
		this.namedEntities = {};
		this.collisionMap = ig.CollisionMap.staticNoCollision;
		this.backgroundMaps = [];
		if(clearCallback)
			clearCallback();
	},

	loadLevel: function( data ) {
		this.clearLevel();

		for( var i = 0; i < data.entities.length; i++ ) {
			var ent = data.entities[i];
			this.spawnEntity( ent.type, ent.x, ent.y, ent.settings );
		}
		this.postLoadEntities();
		this.sortEntities();

		// Map Layer
		for( var i = 0; i < data.layer.length; i++ ) {
			var ld = data.layer[i];
			if( ld.name == 'collision' ) {
				this.collisionMap = new ig.CollisionMap(ld.tilesize, ld.data );
			}
			else {
				var newMap = new ig.BackgroundMap(ld.tilesize, ld.data, ld.tilesetName);
				newMap.anims = this.backgroundAnims[ld.tilesetName] || {};
				newMap.repeat = ld.repeat;
				newMap.distance = ld.distance;
				newMap.foreground = !!ld.foreground;
				this.backgroundMaps.push( newMap );
			}
		}
	},

	postLoadEntities: function() {
		// call postload function on each entity, so they can spawn their own helper entities
		for( var i = 0; i < this.entities.length; i++ ) {
			var ent = this.entities[i];
			if( ent.postLoad != null ) {
				ent.postLoad();
			}
		}
	},


	loadLevelDeferred: function( data ) {
		this._levelToLoad = data;
	},


	clearLevelDeferred: function( clearCallback ) {
		this._clearLevel = true;
		this._clearLevelCallback = clearCallback;
	},


	getEntityByName: function( name ) {
		return this.namedEntities[name];
	},


	getEntitiesByType: function( type ) {
		var entityClass = typeof(type) === 'string'
			? ig.global[type]
			: type;

		var a = [];
		for( var i = 0; i < this.entities.length; i++ ) {
			var ent = this.entities[i];
			if( ent instanceof entityClass && !ent._killed ) {
				a.push( ent );
			}
		}
		return a;
	},


	spawnEntity: function( type, x, y, settings ) {
		var entityClass = typeof(type) === 'string'
			? ig.global[type]
			: type;

		if( !entityClass ) {
			throw("Can't spawn entity of type " + type);
		}
		var ent = new (entityClass)( x, y, settings || {} );
		this.entities.push( ent );
		if( ent.name ) {
			this.namedEntities[ent.name] = ent;
		}
		return ent;
	},


	sortEntities: function() {
		this.entities.sort( function(a,b){ return a.zIndex - b.zIndex; } );
	},


	sortEntitiesDeferred: function() {
		this._doSortEntities = true;
	},


	removeEntity: function( ent ) {
		// Remove this entity from the named entities
		if( ent.name ) {
			delete this.namedEntities[ent.name];
		}

		// We can not remove the entity from the entities[] array in the midst
		// of an update cycle, so remember all killed entities and remove
		// them later.
		// Also make sure this entity doesn't collide anymore and won't get
		// updated or checked
		ent._killed = true;
		ent.checkAgainst = ig.Entity.TYPE.NONE;
		ent.collides = ig.Entity.COLLIDES.NEVER;
		this._deferredKill.push( ent );
	},


	run: function() {
		this.update();
		this.draw();
	},


	update: function(){

		// load new level?
		if( this._clearLevel ) {
			this.clearLevel(this._clearLevelCallback);
			this._clearLevel = false;
			this._clearLevelCallback = null;
		}

		// load new level?
		if( this._levelToLoad ) {
			this.loadLevel( this._levelToLoad );
			this._levelToLoad = null;
		}

		// sort entities?
		if( this._doSortEntities ) {
			this.sortEntities();
			this._doSortEntities = false;
		}

		// update entities
		for( var i = 0; i < this.entities.length; i++ ) {
			var ent = this.entities[i];
			if( !ent._killed ) {
				ent.update();
			}
		}
		this.checkEntities();

		// remove all killed entities
		for( var i = 0; i < this._deferredKill.length; i++ ) {
			this.entities.erase( this._deferredKill[i] );
		}
		this._deferredKill = [];

		// update background animations
		for( var tileset in this.backgroundAnims ) {
			var anims = this.backgroundAnims[tileset];
			for( var a in anims ) {
				anims[a].update();
			}
		}
	},


	draw: function(){
		if( this.clearColor ) {
			ig.system.clear( this.clearColor );
		}

		var mapIndex;
		for( mapIndex = 0; mapIndex < this.backgroundMaps.length; mapIndex++ ) {
			var map = this.backgroundMaps[mapIndex];
			if( map.foreground ) {
				// All foreground layers are drawn after the entities
				break;
			}
			map.setScreenPos( this.screen.x, this.screen.y );
			map.draw();
		}

		for( var i = 0; i < this.entities.length; i++ ) {
			this.entities[i].draw();
		}

		for( mapIndex; mapIndex < this.backgroundMaps.length; mapIndex++ ) {
			var map = this.backgroundMaps[mapIndex];
			map.setScreenPos( this.screen.x, this.screen.y );
			map.draw();
		}
	},

	width: function(){
		return ig.game.collisionMap.width * ig.game.collisionMap.tilesize;
	},
	height: function(){
		return ig.game.collisionMap.height * ig.game.collisionMap.tilesize;
	},


	checkEntities: function() {
		// Insert all entities into a spatial hash and check them against any
		// other entity that already resides in the same cell. Entities that are
		// bigger than a single cell, are inserted into each one they intersect
		// with.

		// A list of entities, which the current one was already checked with,
		// is maintained for each entity.

		var hash = {};
		for( var e = 0; e < this.entities.length; e++ ) {
			var entity = this.entities[e];

			// Skip entities that don't check, don't get checked and don't collide
			if(
				e.type == ig.Entity.TYPE.NONE &&
				e.checkAgainst == ig.Entity.TYPE.NONE &&
				e.collides == ig.Entity.COLLIDES.NEVER
			) {
				continue;
			}

			var checked = {},
				xmin = Math.floor( entity.pos.x/this.cellSize ),
				ymin = Math.floor( entity.pos.y/this.cellSize ),
				xmax = Math.floor( (entity.pos.x+entity.size.x)/this.cellSize ) + 1,
				ymax = Math.floor( (entity.pos.y+entity.size.y)/this.cellSize ) + 1;

			for( var x = xmin; x < xmax; x++ ) {
				for( var y = ymin; y < ymax; y++ ) {

					// Current cell is empty - create it and insert!
					if( !hash[x] ) {
						hash[x] = {};
						hash[x][y] = [entity];
					}
					else if( !hash[x][y] ) {
						hash[x][y] = [entity];
					}

					// Check against each entity in this cell, then insert
					else {
						var cell = hash[x][y];
						for( var c = 0; c < cell.length; c++ ) {

							// Intersects and wasn't already checkd?
							if( entity.touches(cell[c]) && !checked[cell[c].id] ) {
								checked[cell[c].id] = true;
								ig.Entity.checkPair( entity, cell[c] );
							}
						}
						cell.push(entity);
					}
				} // end for y size
			} // end for x size
		} // end for entities
	}
});

});
