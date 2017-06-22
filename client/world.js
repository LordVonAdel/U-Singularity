function World() {
  this.width = 100;
  this.height = 100;
  this.grid = new Grid(this.width, this.height);
  this.gridOverwrite = new Grid(this.width, this.height);
  
  this.resize = function (width, height) {
    this.width = width;
    this.height = height;
    this.grid.resize(width, height);
    this.gridOverwrite.resize(width, height);
  }

  this.tileGet = function (tileX, tileY) {
    var tile = res.tiles[this.grid.cellGet(tileX, tileY)];
    var overwrite = this.gridOverwrite.cellGet(tileX, tileY);
    return Object.assign({}, tile, overwrite);
  }

  this.cellSetOverwrite = function (tileX, tileY, data) {
    this.gridOverwrite.cellSet(tileX, tileY, data);
  }

  this.draw = function () {
    this.updateView(view);
    /*
    var sx = Math.max(Math.floor(viewX / 32), 0);
    var sy = Math.max(Math.floor(viewY / 32), 0);
    var sw = Math.ceil(view_width / 32) + 1;
    var sh = Math.ceil(view_height / 32) + 1;
    for (i = sx; i < sx + sw; i++) {
      for (j = sy; j < sy + sh; j++) {
        var index = this.grid.cellGet(i, j);
        var tile = res.tiles[index];
        if (tile != undefined) {
          if (tile.connectionType == undefined) {
            drawSpritePart(1, tile.sprite, i * 32, j * 32, 0, 0, 32, 32);
          }
          if (tile.connectionType == "perspective") {
            var curve = false;

            var tile_top = (this.tileGet(i, j - 1).connectionGroup == tile.connectionGroup);
            var tile_left = (this.tileGet(i - 1, j).connectionGroup == tile.connectionGroup);
            var tile_right = (this.tileGet(i + 1, j).connectionGroup == tile.connectionGroup);
            var tile_bottom = (this.tileGet(i, j + 1).connectionGroup == tile.connectionGroup);
            var dir = 0;

            if (tile_top && tile_bottom) { dir = 1 }
            if (((tile_top || tile_bottom) && (tile_left || tile_right))) { curve = true; }
            var angle = Math.round(((Math.atan2(i * 32 - player.x, j * 32 - player.y) * 180 / Math.PI) + 180 - dir * 90) / (180 - curve * 90)) * (180 - curve * 90) - dir * 90
            drawSpritePartAngle(1, tile.sprite, i * 32, j * 32, 32 * curve, 0, 32, 32, angle);
          }
          if (tile.connectionType == "wall") {
            var tile_top = this.tileGet(i, j - 1);
            var tile_left = this.tileGet(i - 1, j);
            var tile_right = this.tileGet(i + 1, j);
            var tile_bottom = this.tileGet(i, j + 1);
            drawSpritePart(1, tile.sprite, i * 32, j * 32, 32, 0, 32, 32);
            if (tile_top != undefined && tile_bottom != undefined && tile_right != undefined && tile_left != undefined) {
              drawSpritePart(1, tile.sprite, i * 32, j * 32, 160, 0, 32, 32);
              if (tile_top.connectionGroup == tile.connectionGroup) {
                drawSpritePart(1, tile.sprite, i * 32, j * 32, 32, 0, 32, 32);
              }
              if (tile_left.connectionGroup == tile.connectionGroup && tile_right.connectionGroup != tile.connectionGroup) {
                drawSpritePart(1, tile.sprite, i * 32, j * 32, 96, 0, 32, 32);
              }
              if (tile_right.connectionGroup == tile.connectionGroup && tile_left.connectionGroup != tile.connectionGroup) {
                drawSpritePart(1, tile.sprite, i * 32, j * 32, 128, 0, 32, 32);
              }
              if (!(tile_left.connectionGroup == tile.connectionGroup || tile_right.connectionGroup == tile.connectionGroup)) {
                if (tile_top.connectionGroup == tile.connectionGroup) {
                  drawSpritePart(2, tile.sprite, i * 32, j * 32, 32, 0, 32, 32);
                }
              }
              if (tile_left.connectionGroup == tile.connectionGroup && tile_right.connectionGroup == tile.connectionGroup) {
                drawSpritePart(1, tile.sprite, i * 32, j * 32, 0, 0, 32, 32);
              }
              if (tile_bottom.connectionGroup == tile.connectionGroup) {
                drawSpritePart(1, tile.sprite, i * 32, j * 32, 64, 0, 32, 32);
              }
            }
          }
          if (tile.connectionType == "simple") {
            var tile_top = this.tileGet(i, j - 1);
            var tile_left = this.tileGet(i - 1, j);
            var tile_right = this.tileGet(i + 1, j);
            var tile_bottom = this.tileGet(i, j + 1);
            if (tile_top != undefined && tile_bottom != undefined && tile_right != undefined && tile_left != undefined) {
              if (tile_top.connectionGroup != tile.connectionGroup) { //top lane
                if (tile_left.connectionGroup != tile.connectionGroup) {
                  drawSpritePart(1, tile.sprite, i * 32, j * 32, 0, 0, 32, 32);
                } else if (tile_right.connectionGroup != tile.connectionGroup) {
                  drawSpritePart(1, tile.sprite, i * 32, j * 32, 64, 0, 32, 32);
                } else {
                  drawSpritePart(1, tile.sprite, i * 32, j * 32, 32, 0, 32, 32);
                }
              } else if (tile_bottom.connectionGroup != tile.connectionGroup) { //bottom lane
                if (tile_left.connectionGroup != tile.connectionGroup) {
                  drawSpritePart(1, tile.sprite, i * 32, j * 32, 0 + 96 + 96, 0, 32, 32);
                } else if (tile_right.connectionGroup != tile.connectionGroup) {
                  drawSpritePart(1, tile.sprite, i * 32, j * 32, 64 + 96 + 96, 0, 32, 32);
                } else {
                  drawSpritePart(1, tile.sprite, i * 32, j * 32, 32 + 96 + 96, 0, 32, 32);
                }
              } else { //middle lane
                if (tile_left.connectionGroup != tile.connectionGroup) {
                  drawSpritePart(1, tile.sprite, i * 32, j * 32, 0 + 96, 0, 32, 32);
                } else if (tile_right.connectionGroup != tile.connectionGroup) {
                  drawSpritePart(1, tile.sprite, i * 32, j * 32, 64 + 96, 0, 32, 32);
                } else {
                  drawSpritePart(1, tile.sprite, i * 32, j * 32, 32 + 96, 0, 32, 32);
                }
              }
            }
          }
        }
      }
    }
    */
  }
}

World.prototype.updateView = function(view){
  for (var i=0; i<(Math.ceil(view.width/32)+1)*(Math.ceil(view.height/32)+1); i++){
    var cx = Math.floor(view.x / 32)+(i % (Math.ceil(view.width/32)+1)) //cellX
    var cy = Math.floor(view.y / 32)+Math.floor(i / (Math.ceil(view.width/32)+1)) //cellY
    view.sprites[i].x = cx*32;
    view.sprites[i].y = cy*32;
    if (cx >= 0 && cy >= 0 && cx < this.width-1 && cy < this.height-1){
      var tileIndex = this.grid.cellGet(cx, cy);
      var tile = res.tiles[tileIndex];
      if (tile != undefined){
        var imageIndex = 0;
        switch (tile.connectionType){
          case "simple":
            var tile_top = (this.tileGet(cx, cy - 1).connectionGroup != tile.connectionGroup);
            var tile_left = (this.tileGet(cx - 1, cy).connectionGroup != tile.connectionGroup);
            var tile_right = (this.tileGet(cx + 1,cy).connectionGroup != tile.connectionGroup);
            var tile_bottom = (this.tileGet(cx, cy + 1).connectionGroup != tile.connectionGroup);
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
        }
        view.sprites[i].setTexture(getTextureFrame(subfolder+"sprites/"+tile.sprite,imageIndex,32,32));
      }
    }
  }
}

function View(width,height){
  this.width = width;
  this.height = height;
  this.x = 0;
  this.y = 0;
  this.zoom = 1;
  this.sprites = [];
  for (var i=0; i<(Math.ceil(width/32)+1)*(Math.ceil(height/32)+1); i++){
    this.sprites[i] = new PIXI.Sprite();
    stageTiles.addChild(this.sprites[i]);
  }
}

View.prototype.setZoom = function(zoom){
  if (zoom != 0){
    this.zoom = zoom;
    this.width = window.innerWidth / zoom;
    this.height = window.innerHeight / zoom;
    this.sprites.forEach(function(sprite){
      sprite.destroy();
    });
    this.sprites = [];
    for (var i=0; i<(Math.ceil(this.width/32)+1)*(Math.ceil(this.height/32)+1); i++){
      this.sprites[i] = new PIXI.Sprite();
      stageTiles.addChild(this.sprites[i]);
    }
  }else{
    console.error("View can't zoom to 0")
  }
}