//Alternative world
function World(){
  this.loadedChunks = [];
  this.chunks = [];
  this.chunkSize = 16;
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
    chunk.grid.cellSet(tileX % this.chunkSize, tileY % this.chunkSize, id);
    chunk.updateCell(tileX % this.chunkSize, tileY % this.chunkSize);
  }
}

World.prototype.resize = function(width, height){
  this.width = width;
  this.height = height;
}

World.prototype.loadRegion = function(data, x, y, width){
  var res = data.split("x");
  var cx = 0;
  var cy = 0;
  for (i = 0; i < res.length; i += 2) {
    for (j = 0; j < parseInt(res[i], 10); j++) {
      if (cx == width) {
        cx = 0;
        cy += 1;
      }
      this.tileSet(cx + x, cy + y, res[i + 1]);
      cx++
    }
  }
}

World.prototype.draw = function(){

}

World.prototype.getChunkAtTile = function(x, y){
  var cx = Math.floor(x / this.chunkSize);
  var cy = Math.floor(y / this.chunkSize);
  for (var i = 0; i < this.chunks.length; i++){
    var chunk = this.chunks[i];
    if (chunk.x == cx && chunk.y == cy){
      return chunk;
    }
  }
  return this.createChunk(cx, cy);
}

World.prototype.cellSetOverwrite = function (tileX, tileY, data) {
  var chunk = this.getChunkAtTile(tileX, tileY);
  if (chunk) {
    chunk.gridOverwrite.cellSet(tileX % this.chunkSize, tileY % this.chunkSize, data);
  }
}

World.prototype.unloadChunk = function(chunk){
  //console.log(`Unload Chunk ${chunk.x},${chunk.y}`);
  chunk.unload();
}

World.prototype.loadChunk = function(x, y){
  if (x < 0 || y < 0) { return null; }

  for (var i = 0; i < this.chunks.length; i++){
    var chunk = this.chunks[i];
    if (chunk.x == x && chunk.y == y){
      if (chunk.load()){
        this.loadedChunks.push(chunk);
      }
      return chunk;
    }
  }

  var chunk = this.createChunk(x, y);
  chunk.load();
  this.loadedChunks.push(chunk);

  return chunk;
}

World.prototype.createChunk = function(x, y){
  var chunk = new WChunk(this, x, y);
  this.chunks.push(chunk);
  return chunk;
}

World.prototype.destroyChunk = function(x, y){
  var chunk = this.chunks.filter((chunk) => {return (chunk.x == x && chunk.y == y)})[0];
  if (!chunk) {return false}

  this.chunks.splice(this.chunks.indexOf(chunk), 1);

  this.unloadChunk(chunk);
  chunk.destroy();

  delete chunk;
}

World.prototype.loadChunksForView = function(view){
  var chunkstoload = [];

  //to load region (in chunk coordinates)
  var x1 = Math.floor(view.x / (this.chunkSize * 32));
  var y1 = Math.floor(view.y / (this.chunkSize * 32));
  var x2 = x1 + Math.floor(view.width / (this.chunkSize * 32)) + 1;
  var y2 = y1 + Math.floor(view.height / (this.chunkSize * 32)) + 1;

  for (var i = x1; i <= x2; i++){
    for (var j = y1; j <= y2; j++){
      chunkstoload.push({x: i, y: j});
    }
  }
  for (var i = 0; i < this.loadedChunks.length; i++){
    var chunk = this.loadedChunks[i];
    if (chunk.x < x1 || chunk.y < y1 || chunk.x > x2 || chunk.y > y2){
      this.unloadChunk(chunk);
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
  this.pixiContainer = new PIXI.Container();
  this.pixiContainer.x = 32 * this.world.chunkSize * x;
  this.pixiContainer.y = 32 * this.world.chunkSize * y;
  stageTiles.addChild(this.pixiContainer);

  this.load();
  this.isLoaded = false;
}

WChunk.prototype.load = function(){
  if (this.isLoaded) return false;

  this.isLoaded = true;

  for (var i = 0; i < this.world.chunkSize; i++){
    for (var j = 0; j < this.world.chunkSize; j++){
      var sprite = new PIXI.Sprite();
      sprite.x = j * 32;
      sprite.y = i * 32;
      this.sprites.push(sprite);
      this.pixiContainer.addChild(sprite);
      this.updateCell(j, i);
    }
  }

  return true;
}

WChunk.prototype.destroy = function(){
  this.unload();
  this.pixiContainer.destroy();
}

WChunk.prototype.unload = function(){
  if (!this.isLoaded) {return false;}

  for (var i = 0; i < this.sprites.length; i++){
    this.sprites[i].destroy();
  }
  this.sprites = [];
  this.isLoaded = false;

  this.world.loadedChunks.splice(this.world.loadedChunks.indexOf(this), 1)
}

WChunk.prototype.cellSet = function(x, y, content){
  this.grid.cellSet(x, y, content);
}

WChunk.prototype.update = function(){
  for (var i = 0; i < this.world.chunkSize; i++){
    for (var j = 0; j < this.world.chunkSize; j++){
      this.updateCell(i, j);
    }
  }
}

WChunk.prototype.updateCell = function(x, y){
  var sprite = this.sprites[y * this.world.chunkSize + x];
  var tile = res.tiles[this.grid.cellGet(x, y)];

  var cx = x + this.x * this.world.chunkSize;
  var cy = y + this.y * this.world.chunkSize;

  if (tile && sprite){
    var imageIndex = 0;
    switch (tile.connectionType){
      case "simple":
        var tile_top = (this.world.tileGet(cx, cy - 1).connectionGroup != tile.connectionGroup);
        var tile_left = (this.world.tileGet(cx - 1, cy).connectionGroup != tile.connectionGroup);
        var tile_right = (this.world.tileGet(cx + 1,cy).connectionGroup != tile.connectionGroup);
        var tile_bottom = (this.world.tileGet(cx, cy + 1).connectionGroup != tile.connectionGroup);
        if (tile_top != undefined && tile_bottom != undefined && tile_right != undefined && tile_left != undefined) {
          if (tile_top) { //top lane
            if (tile_left) {
              imageIndex = 0;
            } else if (tile_right) {
              imageIndex = 2;
            } else {
              imageIndex = 1;
            }
          } else if (tile_bottom) { //bottom lane
            if (tile_left) {
              imageIndex = 6;
            } else if (tile_right) {
              imageIndex = 8;
            } else {
              imageIndex = 7;
            }
          } else { //middle lane
            if (tile_left) {
              imageIndex = 3;
            } else if (tile_right) {
              imageIndex = 5;
            } else {
              imageIndex = 4;
            }
          }
        }
      break;
      case "wall":
        var tile_top = (this.world.tileGet(cx, cy - 1).connectionGroup == tile.connectionGroup);
        var tile_left = (this.world.tileGet(cx - 1, cy).connectionGroup == tile.connectionGroup);
        var tile_right = (this.world.tileGet(cx + 1,cy).connectionGroup == tile.connectionGroup);
        var tile_bottom = (this.world.tileGet(cx, cy + 1).connectionGroup == tile.connectionGroup);
        image_index = 0;
        if (tile_top || tile_bottom){
          imageIndex = 1;
        }
        if (tile_right || tile_left){
          imageIndex = 0;
        }
      break;
    }
    sprite.setTexture(getTextureFrame(subfolder+"sprites/"+tile.sprite,imageIndex,32,32));
  }
}