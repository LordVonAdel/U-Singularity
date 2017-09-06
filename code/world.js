Grid = require('./grid.js');

//The constructor for a world instance
function World(game){
  that = this;
  this.width = 100;
  this.height = 100;
  this.ents = {};
  this.grid = new Grid(this.width,this.height);
  this.gridCollision = new Grid(this.width,this.height);
  this.nextEntId = 0;
  this.gridCollision.forEach(function(tileX,tileY){
    that.gridCollision.cellSet(tileX,tileY,[]);
  });
  this.spawnX = 0;
  this.spawnY = 0;
  this.buckets = new Grid(this.width/config.bucket.width,this.height/config.bucket.height);
  this.buckets.forEach(function(tileX,tileY){
    return new buckets.Bucket(tileX,tileY,that);
  });
  this.game = game;

  //atmospherics
  if (config.enableAtmos){
    this.gridAtmos = new Grid(100,100);
    this.gridAtmos.forEach(function(tileX,tileY){
      that.gridAtmos.cellSet(tileX,tileY,mixtures.air());
    })
  }
  console.log("[World]Initalized World");
  console.log("[World]Using "+this.buckets.width+"x"+this.buckets.height+" ("+this.buckets.width*this.buckets.height+") buckets");
}

//resizes the world to a new width and height
World.prototype.resize = function(width, height){
  this.width = width;
  this.height = height;
  this.grid.resize(width, height);
  this.gridCollision.resize(width,height);
  this.buckets.resize(Math.floor(width/config.bucket.width), Math.floor(height/config.bucket.height))
  this.buckets.forEach(function(tileX,tileY){
    that.buckets.cellSet(tileX,tileY,new buckets.Bucket(tileX,tileY,that));
  });
}

//sets the content of a cell in the world
World.prototype.cellSet = function(tileX,tileY,id){
  var bucket = this.buckets.cellGet(Math.floor(tileX/config.bucket.width),Math.floor(tileY/config.bucket.height))
  bucket.broadcastArea('change_tile',{x:tileX, y:tileY, id:id});
  this.grid.cellSet(tileX,tileY,id);
}

//gets the content of a cell in the world
World.prototype.cellGet = function(tileX,tileY){
  return this.grid.cellGet(tileX,tileY);
}

//gets a region of the world as a string
World.prototype.regionGet = function(x,y,width,height){
  this.grid.saveRegion(x,y,width,height);
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
  fs.writeFile(filename,str,"utf8",function(err){
  if (err){
    ret = false;
    this.broadcast('chat',{msg: "Failed to save world!"});
  }else{
    ret = true;
    this.broadcast('chat',{msg: "World Saved in "+filename});
  }
  });
}

//clears the world
World.prototype.clear = function(){
  this.broadcast('clear',{});
  this.gridCollision.forEach(function(tileX,tileY){
    that.gridCollision.cellSet(tileX,tileY,[]);
  });
  this.grid.forEach(function(tileX,tileY){
    that.grid.cellSet(tileX,tileY,0);
  });
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
  this.broadcast('world',{w:that.width,h:that.height,str:that.grid.save()});
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
      that.spawnX = obj.spawnX;
      that.spawnY = obj.spawnY;
      that.nextEntId = obj.nextEntId || 100;
      var ents = obj.ents;
      for (var k in ents) {
        spwn = ents[k];
        var ent = spawn.entity(that, spwn.type,spwn.tx,spwn.ty);
        ent.x = spwn.x;
        ent.y = spwn.y;
        if (spwn.sync == undefined){
          
        }else{
          Object.assign(ent.sync, spwn.sync);
        }
        ent.update();
      }
      that.broadcast('world',{w:that.width,h:that.height,str:that.grid.save()});
    }
  });
}

//adds a thing at a position to collide with
World.prototype.collisionAdd = function(tileX,tileY,obj){
  var cell = this.gridCollision.cellGet(tileX,tileY);
  if (Array.isArray(cell)){
    var index = cell.indexOf(obj.id);
    if (index == -1){
      cell.push(obj.id);
    }
  }
}

//removes a thing at a position, which could be collided with
World.prototype.collisionFree = function(tileX,tileY,obj){
  var cell = this.gridCollision.cellGet(tileX,tileY);
  if (Array.isArray(cell)){
    var index = cell.indexOf(obj.id)
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
  if (this.gridCollision.cellGet(tileX,tileY) instanceof Array){
    col += this.gridCollision.cellGet(tileX,tileY).length; 
  }
  return (col != 0);
}

//returns the distance between to points
World.prototype.dist = function(x1,y1,x2,y2){
  return Math.sqrt( Math.pow((x1-x2),2)+Math.pow((y1-y2),2));
}

//executes a step / tick in the world
World.prototype.step = function(delta){
  for (k in this.ents){
    var ent = this.ents[k];
    if (ent.animation){
      ent.animate(delta);
    }
    ent.step(delta);
  }
}

//sends a packet to all player on this world
World.prototype.broadcast = function(event, data){
  this.game.players.forEach(function(player){
    if (player.world == this){
      player.socket.emit(event, data);
    }
  });
}

module.exports = World;