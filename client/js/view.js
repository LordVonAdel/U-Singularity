function View(width,height){
  this.width = width;
  this.height = height;
  this.x = 0;
  this.y = 0;
  this.zoom = 1;
}

View.prototype.setZoom = function(zoom){
  if (zoom != 0){
    this.zoom = zoom;
    this.width = window.innerWidth / zoom;
    this.height = window.innerHeight / zoom;
  }else{
    console.error("View can't zoom to 0")
  }
}

View.prototype.isInView = function(x, y){
  return (x > this.x && y > this.y && y < this.y + this.height && x < this.x + this.width);
}