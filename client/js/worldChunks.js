//Alternative world
function World(){
  this.width = 100;
  this.height = 100;
  this.loadedChunks = [];
  this.chunkSize = 8;
}

World.prototype.tileGet = function (tileX, tileY) {
  var chunk = this.getChunkAtTile(tileX, tileY);
  if (chunk){
    var tile = res.tiles[chunk.grid.cellGet(tileX % this.chunkSize, tileY % this.chunkSize)];
    var overwrite = chunk.gridOverwrite.cellGet(tileX % this.chunkSize, tileY % this.chunkSize);
    return Object.assign({}, tile, overwrite);
  }
  return {};
}

World.prototype.tileSet = function (tileX, tileY, id){
  var chunk = this.getChunkAtTile(tileX, tileY);
  if (chunk){
    chunk.grid.cellSet(tileX % this.chunkSize, tileY % this.chunkSize, data);
  }
}

World.prototype.resize = function(width, height){
  this.width = width;
  this.height = height;
}

World.prototype.loadRegion = function(data, x, y, width){
  var res = str.split("x");
  var cx = 0;
  var cy = 0;
  for (i = 0; i < res.length; i += 2) {
    for (j = 0; j < parseInt(res[i], 10); j++) {
      if (cx == width) {
        cx = 0;
        cy += 1;
      }
      if (cx + x < this.width && cy + y < this.height) {
        this.tileSet(cx + x, cy + y, res[i + 1]);
      }
      cx++
    }
  }
}

World.prototype.draw = function(){

}

World.prototype.getChunkAtTile = function(x, y){
  var cx = Math.floor(x / this.chunkSize);
  var cy = Math.floor(y / this.chunkSize);
  for (var i = 0; i < this.loadedChunks.length; i++){
    var chunk = this.loadedChunks[i];
    if (chunk.x == cx && chunk.y == cy){
      return chunk;
    }
  }
  return null;
}

World.prototype.cellSetOverwrite = function (tileX, tileY, data) {
  var chunk = this.getChunkAtTile(tileX, tileY);
  if (chunk){
    chunk.gridOverwrite.cellSet(tileX % this.chunkSize, tileY % this.chunkSize, data);
  }
}

World.prototype.unloadChunk = function(chunk){
  chunk.unload();
  var index = this.loadedChunks.indexOf(chunk);
  this.loadedChunks.splice(index, 1);
}

World.prototype.loadChunk = function(x, y){
  for (var i = 0; i < this.loadedChunks.length; i++){
    var chunk = this.loadedChunks[i];
    if (chunk.x == x && chunk.y == y){
      return chunk;
    }
  }
  var chunk = new WChunk(this, x, y);
  this.loadedChunks.push(chunk);
  return chunk;
}

World.prototype.loadChunksForView = function(view){
  var chunkstoload = [];
  for (var i = Math.floor(view.x / this.chunkSize); i <= (view.width / this.chunkSize); i++){
    for (var j = Math.floor(view.y / this.chunkSize); j <= (view.height / this.chunkSize); j++){
      chunkstoload.push({x: i, y: j});
    }
  }
  for (var i = 0; i < chunkstoload.length; i++){
    this.loadChunk(chunkstoload[i].x, chunkstoload[i].y);
  }
}

World.prototype.updateView = function(view){
  this.loadChunksForView(view);
}

function WChunk(world, x, y){
  this.world = world;
  this.x = x;
  this.y = y;

  this.grid = new Grid(this.world.chunkSize, this.world.chunkSize);
  this.gridOverwrite = new Grid(this.world.chunkSize, this.world.chunkSize);

  this.sprites = [];
  this.load();
}

WChunk.prototype.load = function(){
  for (var i = 0; i < this.world.chunkSize; i++){
    for (var j = 0; j < this.world.chunkSize; j++){
      this.sprites.push(new THREE.Sprite());
    }
  }
}

WChunk.prototype.unload = function(){
  for (var i = 0; i < this.sprites.length; i++){
    this.sprites[i].destroy();
  }
}