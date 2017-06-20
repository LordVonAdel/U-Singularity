function Entity(id,x,y,image){
  this.image = image;
  this.sprite = Sprite(subfolder+"sprites/"+image);
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
  this.update = function(data){
    //world.cellSetOverwrite(this.tx,this.ty,{})
    Object.assign(this,data);
    if (data.x != undefined){
      this.tx = Math.floor(data.x/32);
    }
    if (data.y != undefined){
      this.ty = Math.floor(data.y/32);
    }
    if (data.image != undefined){
      this.sprite = Sprite(subfolder+"sprites/"+data.image);
    }
    if (this.tile){
      world.cellSetOverwrite(this.tx,this.ty,this.tile)
    }
  }
  this.step = function(){
    drawSpritePart(this.layer,this.sprite,this.x,this.y,this.image_index*this.image_width,0,this.image_width,this.image_height);
    if (mouseOver(this.x,this.y,this.x+32,this.y+32,this)){
      if (mouseCheckPressed(0)){
        if (keyboardCheck(input.DRAG)){
          player.socket.emit('ent_drag',{id: this.id});
        }else{
          player.socket.emit('ent_click',{id: this.id});
        }
      }
    }
  }
  this.destroy = function(){
    if (this.tile){
      world.cellSetOverwrite(this.tx,this.ty,{})
    }
  }
}