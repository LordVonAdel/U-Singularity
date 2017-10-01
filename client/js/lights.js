function LightController(canvas){
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");
  this.width = window.innerWidth;
  this.height = window.innerHeight;
  this.canvasBuffer = document.createElement('canvas');
  var img = new Image();
  img.src = "sprites/light_point.png";
  this.lightSprites = {
    point: img
  }
}

LightController.prototype.render = function(){
  var ctx = this.ctx;
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = "black";
  ctx.fillRect(0,0,this.width,this.height); 
  ctx.globalAlpha = 1;
  for (var k in ents){
    var ent = ents[k];
    for (i = 0; i < ent.lightData.length; i++){
      var data = ent.lightData[i];
      if (data != null){
        var xx = (ent.x - view.x + (data.x || 16)) * view.zoom - data.radius;
        var yy = (ent.y - view.y + (data.y || 16)) * view.zoom - data.radius;

        this.canvasBuffer.width = data.radius * 2;
        this.canvasBuffer.height = data.radius * 2;
        var bx = this.canvasBuffer.getContext('2d');
        bx.fillStyle = data.color;
        bx.fillRect(0, 0, this.canvasBuffer.width, this.canvasBuffer.height);
        bx.globalCompositeOperation = "destination-atop";
        bx.drawImage(this.lightSprites.point, 0, 0, data.radius * 2, data.radius * 2);
        ctx.drawImage(this.lightSprites.point, xx, yy, data.radius * 2, data.radius * 2);
        ctx.globalAlpha = 0.5;
        ctx.drawImage(this.canvasBuffer, xx, yy);
        ctx.globalAlpha = 1;
      }
    }
  }
}