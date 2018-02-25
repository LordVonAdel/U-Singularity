const Grid = require('./grid.js');
const Entity = require('./entity.js');
const fs = require('fs');
const mixtures = require('./mixtures.js');
const Bucket = require('./bucket.js');

const PowerSystem = require('./systems/power.js');
const Atmos = require('./systems/atmos.js');

const msgids = require('./../msgids.json');

//The constructor for a world instance
function World(game, index){
  this.width = 100;
  this.height = 100;
  this.ents = {};
  this.entsStep = []; //A list with all entites having a step event
  this.grid = new Grid(this.width, this.height);
  this.gridEntities = new Grid(this.width, this.height);
  this.nextEntId = 0;
  this.index = index;
  this.gridEntities.forEach(function(tileX,tileY){
    return [];
  });
  
  this.spawnX = 0;
  this.spawnY = 0;
  this.buckets = new Grid(this.width/loader.config.bucket.width,this.height/loader.config.bucket.height);
  this.buckets.forEach(function(tileX,tileY){
    return new Bucket(tileX,tileY,this);
  }, this);
  this.game = game;

  this.consolePrefix = "[Game:"+game.index+"-World:"+index+"]";

  console.log(this.consolePrefix+"Initialized World");
  console.log(this.consolePrefix+"Using "+this.buckets.width+"x"+this.buckets.height+" ("+this.buckets.width*this.buckets.height+") buckets");

  //Initializing systems
  this.systems = {
    power: new PowerSystem(this),
    atmos: new Atmos(this)
  };
  for (var k in this.systems){
    console.log(this.consolePrefix+"Initialized " + this.systems[k].modulename);
  }

}

//resizes the world to a new width and height
World.prototype.resize = function(width, height){
  this.width = width;
  this.height = height;
  this.grid.resize(width, height);
  this.gridEntities.resize(width,height);
  this.buckets.resize(Math.floor(width/loader.config.bucket.width), Math.floor(height/loader.config.bucket.height))
  this.buckets.forEach(function(tileX,tileY){
    this.buckets.cellSet(tileX,tileY,new Bucket(tileX,tileY,this));
  }, this);
}

//sets the content of a cell in the world
World.prototype.cellSet = function(tileX,tileY,id){
  var bucket = this.buckets.cellGet(Math.floor(tileX/loader.config.bucket.width), Math.floor(tileY/loader.config.bucket.height))
  bucket.broadcastArea(msgids["world:change_tile"],{x:tileX, y:tileY, id:id});
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
  var sav = this.saveRegion(0, 0, this.width, this.height);
  str = JSON.stringify(sav);
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
}

//saves a region of the world. Returns it as ragion object
World.prototype.saveRegion = function(x, y, width, height, anchorX, anchorY){

  if (!anchorY){
    var ax = 0;
    var ay = 0;
  }else{
    var ax = anchorX;
    var ay = anchorY;
  }

  var obj = {};
  var ret = false;
  obj.grid = this.grid.saveRegion(x, y, width, height);
  obj.width = width;
  obj.height = height;
  obj.nextEntId = this.nextEntId;
  obj.spawnX = this.spawnX;
  obj.spawnY = this.spawnY;
  obj.ax = ax;
  obj.ay = ay;
  var ents = {}

  for (var key in this.ents){
    var ent = this.ents[key];
    if (ent.tx >= x && ent.ty >= y && ent.tx < x + width && ent.ty < y + height){
      ents[key] = {
        tx: this.ents[key].tx - x,
        ty: this.ents[key].ty - y,
        type: this.ents[key].type,
        sync: this.ents[key].sync
      }
    }
  }
  obj.ents = ents;

  return obj;
}

//loads a region into the world from an world object
World.prototype.loadRegion = function(region, x, y){
  this.grid.loadRegion(region.grid, x - region.ax, y - region.ay, region.width);
  var ents = region.ents;
  for (var k in ents) {
    var spwn = ents[k];
    if (spwn.type != "player"){
      var ent = this.spawnEntity(spwn.type, spwn.tx - region.ax + x, spwn.ty - region.ay + y);
      if (!ent.ent){
        console.error("There are things in this map, of which we don't know what they are! ("+spwn.type+")");
      }else{
        if (spwn.sync){
          //Object.assign() does not work here
          for (var k in spwn.sync){
            ent.sync[k] = spwn.sync[k];
          }
        }
        ent.update();
      }
    }else{
      console.warn("There is a player entity saved in this world! We will not load it!");
    }
  }
  this.resendRegion(x, y, region.width, region.height);
}

//swaps two regions from different worlds
World.prototype.swapRegion = function(thisX, thisY, w, h, otherWorld, otherX, otherY){
  var reg1 = this.saveRegion(thisX, thisY, w, h, 0, 0);
  var reg2 = otherWorld.saveRegion(otherX, otherY, w, h, 0, 0);

  var clients1 = this.getEntsByRegion(thisX, thisY, w, h)
  .filter(function(ent){return ent.client != undefined})
  .map(function(ent){return {c: ent.client, xof: ent.tx - thisX, yof: ent.ty - thisY, sync: ent.sync}});
  var clients2 = otherWorld.getEntsByRegion(otherX, otherY, w, h)
  .filter(function(ent){return ent.client != undefined})
  .map(function(ent){return {c: ent.client, xof: ent.tx - otherX, yof: ent.ty - otherY, sync: ent.sync}});;

  this.clearRegion(thisX, thisY, w, h);
  otherWorld.clearRegion(otherX, otherY, w, h);

  otherWorld.loadRegion(reg1, otherX, otherY);
  this.loadRegion(reg2, thisX, thisY);

  for (var i = 0; i < clients1.length; i++){
    var c = clients1[i];
    this.game.changeWorld(c.c, otherWorld.index, otherX + c.xof, otherY + c.yof, {sync: c.sync});
  }
  for (var i = 0; i < clients2.length; i++){
    var c = clients2[i];
    this.game.changeWorld(c.c, this.index, thisX + c.xof, thisY + c.yof, {sync: c.sync});
  }
}

//loads a region into the world from a file
World.prototype.loadRegionFromFile = function(filename, x, y){
  var that = this;
  fs.readFile(filename,function(err, data){
    if (err){
      that.broadcast(msgids["server:chat"],{msg: "Failed to load map: "+filename});
    }else{
      var obj = JSON.parse(data);
      that.loadRegion(obj, x, y);
    }
  });
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
  this.ents = {};
}

//clears a region in the world
World.prototype.clearRegion = function(x, y, width, height){
  for (var i = 0; i < width; i++){
    for (var j = 0; j < height; j++){
      var xx = x + i;
      var yy = y + j;
      this.cellSet(xx, yy, 0);
      var ents = this.getEntsByPosition(xx, yy);
      for (var k = 0; k < ents.length; k++){
        ents[k].destroy();
      }
    }
  }
}

//loads the world from a file
World.prototype.load = function(filename){
  console.log(this.consolePrefix + "Loading world from file "+filename);
  var that = this;
  fs.readFile(filename,function(err, data){
    if (err){
      console.error(that.consolePrefix+"Failed to load map: "+filename, err);
      that.broadcast(msgids["server:chat"], {msg: "Failed to load map: "+filename});
    }else{
      that.clear();
      var obj = JSON.parse(data);
      that.resize(obj.width, obj.height);
      that.spawnX = +obj.spawnX || 0;
      that.spawnY = +obj.spawnY || 0;
      that.nextEntId = obj.nextEntId || 100;
      that.loadRegion(obj, 0, 0);
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
  var tile = loader.res.tiles[tile_id];
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

//resends a region to the clients in there
World.prototype.resendRegion = function(x, y, width, height){
  var w = width / loader.config.bucket.width;
  var h = height / loader.config.bucket.height;

  var xx = Math.floor(x / loader.config.bucket.width);
  var yy = Math.floor(y / loader.config.bucket.height);

  for (var i = -1; i <= w; i++){
    for (var j = -1; j <= h; j++){
      var bucket = this.buckets.cellGet(xx + i, yy + j);
      if (bucket){
        bucket.resendRegion();
      }
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

//gets a list of entities from this world bases in an area it is
World.prototype.getEntsByRegion = function(x, y, w, h){
  var ents = [];
  for (var i = x; i < w + x; i++){
    for (var j = 0; j < h + y; j++){
      ents = ents.concat(this.getEntsByPosition(i, j));
    }
  }
  return ents;
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

  //update other ents on this cell
  var ents = this.gridEntities.cellGet(x, y);
  if (ents){
    for (var i = 0; i < ents.length; i++){
      var ent = ents[i];
      if (ent != entity){
        ent.update();
      }
    }
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