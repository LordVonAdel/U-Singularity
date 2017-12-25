//Alternative world
function World(){
  this.width = 100;
  this.height = 100;
  this.loadedChunks = [];
  this.chunkSize = 8;
}

World.prototype.tileGet = function (tileX, tileY) {
  var tile = res.tiles[this.grid.cellGet(tileX, tileY)];
  var overwrite = this.gridOverwrite.cellGet(tileX, tileY);
  return Object.assign({}, tile, overwrite);
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

function WChunk(world, x, y){
  this.world = world;
  this.x = x;
  this.y = y;

  this.grid = new Grid(this.world.chunkSize, this.world.chunkSize);
  this.gridOverwrite = new Grid(this.world.chunkSize, this.world.chunkSize);

  this.sprites = [];
}

WChunk.prototype.unload = function(){

}