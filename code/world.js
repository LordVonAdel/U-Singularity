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
  this.cellGet = function(x,y){
    if (grid[x] instanceof Array){
      return grid[x][y];
    }
  }
  this.cellSet = function(x,y,value){
    if (grid[x] instanceof Array){
      grid[x][y] = value;
    }
  }
  this.resize = function(width, height){
    grid.width = width;
    grid.height = height;
  }
  this.save = function(){
    var i;
    var str = "";
    var last = 0;
    var now = 0;
    var len = 0;
    for(i = 0; i<this.width*this.height; i++){
      now = grid[i % this.width][Math.floor(i / this.height)];
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
  this.saveRegion = function(x,y,width,height){
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
  this.load = function(str){
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
  this.loadRegion = function(str,x,y,width){
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
  this.forEach = function(callback){
    var i,j;
    for(i=0; i<this.width; i++){
      grid[i] = [];
      for(j=0; j<this.height; j++){
        callback(i,j);
      }
    }
  }
}
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
    that.buckets.cellSet(tileX,tileY,new buckets.Bucket(tileX,tileY,that));
  });

  this.resize = function(width, height){
    this.width = width;
    this.height = height;
    this.grid.resize(width, height);
    this.gridCollision.resize(width,height);
    this.buckets.resize(Math.floor(width/config.bucket.width),Math.floor(height/config.bucket.height))
    this.buckets.forEach(function(tileX,tileY){
      that.buckets.cellSet(tileX,tileY,new buckets.Bucket(tileX,tileY,that));
    });
  }
  this.cellSet = function(tileX,tileY,id){
    var bucket = this.buckets.cellGet(Math.floor(tileX/config.bucket.width),Math.floor(tileY/config.bucket.height))
    bucket.broadcastArea('change_tile',{x:tileX, y:tileY, id:id});
    this.grid.cellSet(tileX,tileY,id);
  }
  this.cellGet = function(tileX,tileY){
    return this.grid.cellGet(tileX,tileY);
  }
  this.regionGet = function(x,y,width,height){
    this.grid.saveRegion(x,y,width,height);
  }
  this.save = function(filename){
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
  this.clear = function(){
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
  this.load = function(filename){
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
  this.collisionAdd = function(tileX,tileY,obj){
    var cell = this.gridCollision.cellGet(tileX,tileY);
    if (Array.isArray(cell)){
      var index = cell.indexOf(obj.id);
      if (index == -1){
        cell.push(obj.id);
      }
    }
  }
  this.collisionFree = function(tileX,tileY,obj){
    var cell = this.gridCollision.cellGet(tileX,tileY);
    if (Array.isArray(cell)){
      var index = cell.indexOf(obj.id)
      if (index != -1){
        cell.splice(index,1);
      }
    }
  }
  this.collisionCheck = function(tileX,tileY){
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
  this.dist = function(x1,y1,x2,y2){
    return Math.sqrt( Math.pow((x1-x2),2)+Math.pow((y1-y2),2));
  }
  //atmospherics
  if (config.enableAtmos){
    this.gridAtmos = new Grid(100,100);
    this.gridAtmos.forEach(function(tileX,tileY){
      that.gridAtmos.cellSet(tileX,tileY,mixtures.air());
    })
  }
  console.log("[World]Initalized World");
  console.log("[World]Using "+this.buckets.width*this.buckets.height+" buckets");
}
module.exports.Grid = Grid;
module.exports.World = World;