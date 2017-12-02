const Grid = require('./grid.js');
const Entity = require('./entity.js');
const fs = require('fs');
const mixtures = require('./mixtures.js');
const Bucket = require('./bucket.js');

const PowerSystem = require('./systems/power.js');
const Atmos = require('./systems/atmos.js');

//The constructor for a world instance
function World(game){
  this.width = 100;
  this.height = 100;
  this.ents = {};
  this.entsStep = []; //A list with all entites having a step event
  this.grid = new Grid(this.width, this.height);
  this.gridEntities = new Grid(this.width, this.height);
  this.nextEntId = 0;
  this.gridEntities.forEach(function(tileX,tileY){
    return [];
  });
  
  this.spawnX = 0;
  this.spawnY = 0;
  this.buckets = new Grid(this.width/config.bucket.width,this.height/config.bucket.height);
  this.buckets.forEach(function(tileX,tileY){
    return new Bucket(tileX,tileY,this);
  }, this);
  this.game = game;

  console.log("[World]Initialized World");
  console.log("[World]Using "+this.buckets.width+"x"+this.buckets.height+" ("+this.buckets.width*this.buckets.height+") buckets");

  //Initializing systems
  this.systems = {
    power: new PowerSystem(this),
    atmos: new Atmos(this)
  };
  for (var k in this.systems)
    console.log("[World]Initialized " + this.systems[k].modulename);
  }

}

//resizes the world to a new width and height
World.prototype.resize = function(width, height){
  this.width = width;
  this.height = height;
  this.grid.resize(width, height);
  this.gridEntities.resize(width,height);
  this.buckets.resize(Math.floor(width/config.bucket.width), Math.floor(height/config.bucket.height))
  this.buckets.forEach(function(tileX,tileY){
    this.buckets.cellSet(tileX,tileY,new Bucket(tileX,tileY,this));
  }, this);
}

//sets the content of a cell in the world
World.prototype.cellSet = function(tileX,tileY,id){
  var bucket = this.buckets.cellGet(Math.floor(tileX/config.bucket.width),Math.floor(tileY/config.bucket.height))
  bucket.broadcastArea('change_tile',{x:tileX, y:tileY, id:id});
  this.grid.cellSet(tileX,tileY,id);
  var ents = this.gridEntities.cellGet(tileX, tileY);
  for (var i = 0; i < ents.length; i++){
    ents[i].update();
  }
}

//gets the content of a cell in the world
World.prototype.cellGet = function(tileX,tileY){
  return this.grid.cellGet(tileX,tileY);
}

//gets the tile details of a cell in the world
World.prototype.cellGetTile = function(tileX,tileY){
  return loader.res.tiles[this.grid.cellGet(tileX,tileY)];
}

//gets a region of the world as a string
World.prototype.regionGet = function(x,y,width,height){
  this.grid.saveRegion(x,y,width,height);
}

//sets the spawnpoint of this wolrld
World.prototype.setSpawn = function(x, y){
  this.spawnX = +x;
  this.spawnY = +y;
}

//saves the world to a file
World.prototype.save = function(filename){
  var obj = {};
  var ret = false;
  obj.grid = this.grid.save();
  //obj.spawnX = this.spawnX;
  //obj.spawnY = this.spawnY;
  obj.worldWidth = this.width;
  obj.worldHeight = this.height;
  obj.nextEntId = nextEntId;
  obj.spawnX = this.spawnX;
  obj.spawnY = this.spawnY;
  var ents = {}
  for (var key in this.ents){
    ents[key] = {
      x: this.ents[key].x,
      y: this.ents[key].y,
      tx: this.ents[key].tx,
      ty: this.ents[key].ty,
      type: this.ents[key].type,
      sync: this.ents[key].sync
    }
  }
  obj.ents = ents;
  str = JSON.stringify(obj);
  var that = this;
  fs.writeFile(filename,str,"utf8",function(err){
    if (err){
      ret = false;
      that.game.sendChatMessage("Failed to save world!");
    }else{
      ret = true;
      that.game.sendChatMessage("World Saved in "+filename);
    }
  });
  return ret;
}

//clears the world
World.prototype.clear = function(){
  this.broadcast('clear',{});
  this.gridEntities.forEach(function(tileX,tileY){
    this.gridEntities.cellSet(tileX,tileY,[]);
  }, this);
  this.grid.forEach(function(tileX,tileY){
    this.grid.cellSet(tileX,tileY,0);
  }, this);
  this.spawnX = 0;
  this.spawnY = 0;
  this.resize(100,100);
  /*
  this.buckets.forEach(function(tileX,tileY){
    var bucket = that.buckets.cellGet(tileX,tileY);
    if (bucket){
      console.log("Clear bucket!")
      bucket.clear();
    }
  });
  */
  this.ents = {};
  this.broadcast('world',{w:this.width,h:this.height,str:this.grid.save()});
}

//loads the world from a file
World.prototype.load = function(filename){
  var that = this;
  fs.readFile(filename,function(err, data){
    if (err){
      that.broadcast('chat',{msg: "Failed to load map: "+filename});
    }else{
      that.clear();
      var obj = JSON.parse(data);
      that.resize(obj.worldWidth, obj.worldHeight);
      that.grid.load(obj.grid);
      that.spawnX = +obj.spawnX || 0;
      that.spawnY = +obj.spawnY || 0;
      that.nextEntId = obj.nextEntId || 100;
      var ents = obj.ents;
      for (var k in ents) {
        var spwn = ents[k];
        var ent = that.spawnEntity(spwn.type, spwn.tx, spwn.ty);
        ent.x = spwn.x;
        ent.y = spwn.y;
        if (!ent.ent){
          console.error("There are things in this map, which we don't know what they are! ("+spwn.type+")");
        }else{
          if (spwn.sync == undefined){
            
          }else{
            Object.assign(ent.sync, spwn.sync);
          }
          ent.update();
        }
      }
      that.broadcast('world',{w:that.width,h:that.height,str:that.grid.save()});
    }
  });
}

//adds a thing at a position to collide with
World.prototype.gridEntAdd = function(tileX,tileY,obj){
  var cell = this.gridEntities.cellGet(tileX,tileY);
  if (Array.isArray(cell)){
    if (!cell.includes(obj)){
      cell.push(obj);
    }
  }
}

//removes a thing at a position, which could be collided with
World.prototype.gridEntFree = function(tileX,tileY,obj){
  var cell = this.gridEntities.cellGet(tileX,tileY);
  if (Array.isArray(cell)){
    var index = cell.indexOf(obj)
    if (index != -1){
      cell.splice(index,1);
    }
  }
}

//checks if something is at a specific position which blocks it
World.prototype.collisionCheck = function(tileX,tileY){
  var col = 0;
  var tile_id = this.grid.cellGet(tileX,tileY);
  var tile = global.res.tiles[tile_id];
  if (tile != undefined){
    col = tile.collision;
  }
  if (this.gridEntities.cellGet(tileX,tileY) instanceof Array){
    col += this.collisionsGet(tileX, tileY).length;
  }
  return (col != 0);
}

//get array of solid ents on position
World.prototype.collisionsGet = function(tileX, tileY){
  if (this.isInWorld(tileX, tileY)){
    return this.gridEntities.cellGet(tileX,tileY).filter((ent) => {return ent.collision});
  }
}

//Checks if a tile is in the world
World.prototype.isInWorld = function(x, y){
  if (x >= 0 && y >= 0 && x < this.width && y < this.height){
    return true;
  }else{
    return false;
  }
}

//returns the distance between to points
World.prototype.dist = function(x1,y1,x2,y2){
  return Math.sqrt( Math.pow((x1-x2),2)+Math.pow((y1-y2),2));
}

//executes a step / tick in the world
World.prototype.step = function(delta){
  for (var i = 0; i < this.entsStep.length; i++){
    var ent = this.entsStep[i];
    ent.step(delta);
    if (ent.animation){
      ent.animate(delta);
    }
  }
  for (var k in this.systems){
    var sys = this.systems[k];
    if (sys.step){
      sys.step(delta);
    }
  }
}

//sends a packet to all player on this world
World.prototype.broadcast = function(event, data){
  for (var i = 0; i < this.game.clients.length; i++) {
    var player = this.game.clients[i];
    if (player.world == this){
      player.socket.emit(event, data);
    }
  }
}

//gets an entity form this world by its id
World.prototype.getEntById = function(entId){
  var ent = this.ents[entId];
  if (ent == undefined){
    return null
  }else{
    return ent;
  }
}

//gets a list of entites from this world based on the type
World.prototype.getEntsByType = function(type){
  var list = [];
  for (k in this.ents){
    var ent = this.ents[k];
    if (ent.type == type){
      list.push(ent);
    }
  }
  return list;
}

//gets a list of entities from this world based on the position
World.prototype.getEntsByPosition = function(tileX, tileY){
  return this.gridEntities.cellGet(tileX, tileY);
}

//Spawn an entity somewhere in the world
World.prototype.spawnEntity = function(type, x, y){
  var x = x || 0;
  var y = y || 0;
  var entity = new Entity(this, type, x, y);
  if (!entity.error){
    entity.spawn();
    this.nextEntId ++;
  }
  return entity;
}

//Spawn Item
World.prototype.spawnItem = function(x, y, item){
  var entity = new Entity(this, "item", x, y);
  entity.spawn();
  entity.sync.item = item;
  entity.update();
  this.nextEntId ++;
  return entity;
}

module.exports = World;