function Entity(id,x,y,image){
  this.image = image;
  this.x = x; //x-coordinate in pixels
  this.y = y; //y-coordinate in pixels
  this.tx = Math.floor(x/32); //target x-coordinate in tiles
  this.ty = Math.floor(y/32); //target y-coordinate in tiles
  this.id = id;
  this.image_scale = 1;
  this.imageNumber = 1;
  this.imageIndex = 0;
  this.image_width = 32;
  this.image_height = 32;
  this.layer = 10;
  this.imagePath = subfolder+"sprites/"+image;
  this.walkAnimation = null;
  this.isBurning = false;
  this.speed = 3.2;

  var tex = getTextureFrame(this.imagePath,0,32,32);
  this.container = new PIXI.Container();
  this.sprite = new PIXI.Sprite(tex);
  this.container.addChild(this.sprite);

  this.sprite.x = this.x;
  this.sprite.y = this.y;

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
  if (data.image != undefined){
    this.imagePath = subfolder+"sprites/"+data.image;
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

  this.sprite.x = this.x;
  this.sprite.y = this.y;
  this.sprite.setTexture(getTextureFrame(this.imagePath, this.imageIndex, this.image_width, this.image_height));
  if (this.walkAnimation == "jump"){
    var f = ((this.x % 32)/32)+((this.y % 32)/32);
    this.sprite.y = this.y - (Math.sin(f*Math.PI)*4);
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
  this.sprite.destroy();
  if (this.tile){
    world.cellSetOverwrite(this.tx,this.ty,{})
  }
}