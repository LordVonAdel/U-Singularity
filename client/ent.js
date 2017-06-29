function Entity(id,x,y,image){
  this.image = image;
  this.x = x;
  this.y = y;
  this.tx = Math.floor(x/32);
  this.ty = Math.floor(y/32);
  this.id = id;
  this.image_scale = 1;
  this.image_number = 1;
  this.image_index = 0;
  this.image_width = 32;
  this.image_height = 32;
  this.layer = 10;
  this.imagePath = subfolder+"sprites/"+image;
  this.walkAnimation = null;

  var tex = getTextureFrame(this.imagePath,0,32,32);
  this.sprite = new PIXI.Sprite(tex);

  this.sprite.x = this.x;
  this.sprite.y = this.y;

  stageEntities.addChild(this.sprite);
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
  this.sprite.x = this.x;
  this.sprite.y = this.y;
  this.sprite.setTexture(getTextureFrame(this.imagePath, this.image_index, this.image_width, this.image_height));
  if (this.walkAnimation == "jump"){
    var f = ((this.x % 32)/32)+((this.y & 32)/32);
    this.sprite.y = this.y - Math.sin(f*Math.PI)*4+2;
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