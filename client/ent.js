function Entity(id,x,y,spriteData){
  this.x = x; //x-coordinate in pixels
  this.y = y; //y-coordinate in pixels
  this.tx = Math.floor(x/32); //target x-coordinate in tiles
  this.ty = Math.floor(y/32); //target y-coordinate in tiles
  this.id = id;
  this.layer = 10;
  this.spriteData = spriteData;
  this.sprites = [];
  this.walkAnimation = null;
  this.isBurning = false;
  this.speed = 3.2;

  this.container = new PIXI.Container();
  this.container.x = this.x;
  this.container.y = this.y;
  for (var i=0; i < this.spriteData.length; i++){
    var data = this.spriteData[i];
    var spr = {
      source: data.source,
      x: data.x || 0,
      y: data.y || 0,
      index: data.index || 0
    }
    var imagePath = subfolder+"sprites/"+spr.source;
    var tex = getTextureFrame(imagePath,spr.index,32,32);
    var sprite = new PIXI.Sprite(tex);
    this.container.addChild(sprite);
    this.sprites[i] = sprite;

    sprite.x = spr.x;
    sprite.y = spr.y;
  }

  stageEntities.addChild(this.container);
}

Entity.prototype.update = function(data){
  //world.cellSetOverwrite(this.tx,this.ty,{})
  Object.assign(this,data);
  if (data.x != undefined){
    this.tx = Math.floor(data.x/32);
  }
  if (data.y != undefined){
    this.ty = Math.floor(data.y/32);
  }
  if (data.sprites != undefined){
    
  }
  if (this.tile){
    world.cellSetOverwrite(this.tx,this.ty,this.tile)
  }
}

Entity.prototype.step = function(){
  this.x += Math.sign(this.tx*32-this.x)*this.speed;
  this.y += Math.sign(this.ty*32-this.y)*this.speed;
  if (Math.abs(this.tx*32-this.x)<this.speed){this.x = this.tx*32}
  if (Math.abs(this.ty*32-this.y)<this.speed){this.y = this.ty*32}

  this.container.x = this.x;
  this.container.y = this.y;
  for (var i = 0; i < this.spriteData.length; i++){
    var data = this.spriteData[i];
    var sprite = this.sprites[i];
    var path = subfolder+"sprites/"+data.source;
    sprite.setTexture(getTextureFrame(path, data.index, data.width, data.height));
    if (data.walkAnimation == "jump"){
      var f = ((this.x % 32)/32)+((this.y % 32)/32);
      sprite.y = this.y - (Math.sin(f*Math.PI)*4);
    }
  }

  if (this.isBurning){
    if (this.spriteBurnFront == undefined){
      this.spriteBurnFront = new PIXI.Sprite(getTextureFrame("sprites/effects/fire_human_front.png",0,32,32));
      this.spriteBurnBack = new PIXI.Sprite(getTextureFrame("sprites/effects/fire_human_back.png",0,32,32));
      this.container.addChild(this.spriteBurnFront);
      this.container.addChild(this.spriteBurnBack);
    }
    var current_time = new Date().getMilliseconds();
    var frame = Math.floor(current_time / 250);
    this.spriteBurnFront.setTexture(getTextureFrame("sprites/effects/fire_human_front.png",frame,32,32));
    this.spriteBurnBack.setTexture(getTextureFrame("sprites/effects/fire_human_back.png",frame,32,32));
  }
  
  if (mouseOver(this.x,this.y,this.x+32,this.y+32,this)){
    if (mouseCheckPressed(0)){
      if (keyboardCheck(input.DRAG)){
        socket.emit('ent_drag',{id: this.id});
      }else{
        socket.emit('ent_click',{id: this.id});
      }
    }
  }
}

Entity.prototype.destroy = function(){
  for (var i = 0; i < this.sprites.lenght; i++){
    this.sprites[i].destroy();
  }
  if (this.tile){
    world.cellSetOverwrite(this.tx,this.ty,{})
  }
}