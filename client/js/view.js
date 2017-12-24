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

View.prototype.isInView = function(x, y){
  return (x > this.x && y > this.y && y < this.y + this.height && x < this.x + this.width);
}