
//Constuctor of a grid instance. It will saves things in a grid like a 2-Dimensional array but with additional features.
function Grid(width,height){
  this.width = Math.ceil(width);
  this.height = Math.ceil(height);
  this.grid = [];
  var grid = this.grid;
  
  var i,j;
  for(i=0; i<width; i++){
    grid[i] = [];
    for(j=0; j<height; j++){
      grid[i][j] = 0;
    }
  }
}

//gets the content of the cell at a specific location
Grid.prototype.cellGet = function(x,y){
  if (this.grid[x] instanceof Array){
    return this.grid[x][y];
  }
}

//sets the content of the cell at a specific location
Grid.prototype.cellSet = function(x,y,value){
  if (this.grid[x] instanceof Array){
    this.grid[x][y] = value;
  }
}

//changes the size of the grid
Grid.prototype.resize = function(width, height){
  this.grid.width = width;
  this.grid.height = height;
}

//saves the grid. Returns a string with the information needed to load the grid again.
Grid.prototype.save = function(){
  var i;
  var str = "";
  var last = 0;
  var now = 0;
  var len = 0;
  for(i = 0; i<this.width*this.height; i++){
    now = this.grid[i % this.width][Math.floor(i / this.height)];
    if (now == last){
      len ++;
    }else{
      str += len + "x" + last + "x";
      len = 1;
    }
    last = now;
  }
  str += len + "x" + last;
  return str;
}

//saves a part of the grid. Returns a string needed to reconstruct the area
Grid.prototype.saveRegion = function(x,y,width,height){
  var i;
  var str = "";
  var last = 0;
  var now = 0;
  var len = 0;
  for(i = 0; i<width*height; i++){
    now = this.cellGet(i % width+x,Math.floor(i / height)+y)//grid[i % width+x][Math.floor(i / height)+y];
    if (now == last){
      len ++;
    }else{
      str += len + "x" + last + "x";
      len = 1;
    }
    last = now;
  }
  str += len + "x" + last;
  return str;
}

//loads one of the strings above into the grid
Grid.prototype.load = function(str){
  var res = str.split("x");
  var cx = 0;
  var cy = 0;
  for(i = 0; i < res.length; i+=2){
    for(j = 0; j < parseInt(res[i],10); j++){
      if (cx == this.width){
      cx = 0;
      cy += 1;
      }
      this.grid[cx][cy] = parseInt(res[i+1]);
      cx++
    }
  }
}

//loads a part of the grid. The thing to load from is a string returned from saveRegion or save
Grid.prototype.loadRegion = function(str,x,y,width){
  var res = str.split("x");
  var cx = 0;
  var cy = 0;
  for(i = 0; i < res.length; i+=2){
    for(j = 0; j < parseInt(res[i],10); j++){
      if (cx == width){
        cx = 0;
        cy += 1;
      }
      this.grid[cx+x][cy+y] = res[i+1];
      cx++
    }
  }
}

//does something for each cell.
Grid.prototype.forEach = function(callback){
  var i,j;
  for(i=0; i<this.width; i++){
    //grid[i] = [];
    for(j=0; j<this.height; j++){
      var a = callback(i, j, this.cellGet(i, j));
      if (a){
        this.cellSet(i, j);
      }
    }
  }
}

//The constructor for a world instance
function World(){
  that = this;
  this.width = 100;
  this.height = 100;
  this.ents = {};
  this.grid = new Grid(this.width,this.height);
  this.gridCollision = new Grid(this.width,this.height);
  this.gridCollision.forEach(function(tileX,tileY){
    that.gridCollision.cellSet(tileX,tileY,[]);
  });
  this.spawnX = 0;
  this.spawnY = 0;
  this.buckets = new Grid(this.width/config.bucket.width,this.height/config.bucket.height);
  this.buckets.forEach(function(tileX,tileY){
    return new buckets.Bucket(tileX,tileY,that);
  });

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
  this.buckets.resize(Math.floor(width/config.bucket.width),Math.floor(height/config.bucket.height))
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
  obj.spawnX = this.spawnX;
  obj.spawnY = this.spawnY;
  obj.world_width = this.width;
  obj.world_height = this.height;
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
    handy.broadcast('chat',{msg: "Failed to save world!"});
  }else{
    ret = true;
    handy.broadcast('chat',{msg: "World Saved in "+filename});
  }
  });
}

//clears the world
World.prototype.clear = function(){
  handy.broadcast('clear',{});
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
  handy.broadcast('world',{w:that.width,h:that.height,str:that.grid.save()});
}

//loads the world from a file
World.prototype.load = function(filename){
  fs.readFile(filename,function(err, data){
  if (err){
    handy.broadcast('chat',{msg: "Failed to load map: "+filename});
  }else{
    that.clear();
    var obj = JSON.parse(data);
    that.resize(obj.world_width, obj.world_height);
    that.grid.load(obj.grid);
    that.spawnX = obj.spawnX;
    that.spawnY = obj.spawnY;
    nextEntId = obj.nextEntId || 100;
    var ents = obj.ents;
    for (var k in ents) {
      spwn = ents[k];
      var ent = spawn.entity(spwn.type,spwn.tx,spwn.ty);
      ent.x = spwn.x;
      ent.y = spwn.y;
      if (spwn.sync == undefined){
        
      }else{
        Object.assign(ent.sync, spwn.sync);
      }
      ent.update();
    }
    handy.broadcast('world',{w:that.width,h:that.height,str:that.grid.save()});
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

module.exports.Grid = Grid;
module.exports.World = World;