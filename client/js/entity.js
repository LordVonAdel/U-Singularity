//Constructor of the entity object
function Entity(id, x, y, data){
  if (ents[id]) {
    console.error("Entity with this ID already exists!");
  }

  console.log("Spawned entity with id: "+id);
  this.x = x; //x-coordinate in pixels
  this.y = y; //y-coordinate in pixels
  this.tx = Math.floor(x/32); //target x-coordinate in tiles
  this.ty = Math.floor(y/32); //target y-coordinate in tiles
  this.id = id;
  this.spriteData = data.spriteData;
  this.lightData = [];
  this.sprites = [];
  this.lights = [];
  this.speed = 3.2;
  this.states = [];
  this.layer = data.layer || 3;

  this.container = new PIXI.Container();
  this.container.x = this.x;
  this.container.y = this.y;

  stageEntities.children[this.layer].addChild(this.container);

  this.update(data);
}

//Checks if the entity is visible
Entity.prototype.isVisible = function(){

  for (var i = 0; i < this.spriteData.length; i ++){
    if (this.spriteData[i].visible || this.spriteData[i].visible == undefined) return true;
  }
  return false;
}

//Updates some values of the entity
Entity.prototype.update = function(data){
  //world.cellSetOverwrite(this.tx,this.ty,{})
  if (this.id == camId){
    cam = this;
    if (player.mode == "spectator") return;
  }

  Object.assign(this, data);

  if (data.layer){
    this.changeLayer(data.layer);
  }
  if (this.isVisible()){
    if (data.x != undefined){
      this.tx = Math.floor(data.x/32);
      if (data.teleport){
        this.x = this.tx * 32;
      }
    }
    if (data.y != undefined){
      this.ty = Math.floor(data.y/32);
      if (data.teleport){
        this.y = this.ty * 32;
      }
    }
    if (data.spriteData != undefined){
      for (var i=0; i<this.spriteData.length; i++){
        var sprite = this.sprites[i];
        var sprData = data.spriteData[i];
        var path = subfolder+"sprites/"+sprData.source;
        if (!sprite){
          sprite = new PIXI.Sprite(getTextureFrame(path, sprData.index, sprData.width || 32, sprData.height || 32));
          this.sprites[i] = sprite;
          this.container.addChild(sprite);
        }
        sprite.setTexture(getTextureFrame(path, data.index, data.width || 32, data.height || 32));
      }
    }
  }
  if (data.lightData != undefined){
    for (var i=0; i<this.lightData.length; i++){
      var data = this.lightData[i];
    }
  }
  if (this.tile){
    world.cellSetOverwrite(this.tx,this.ty,this.tile);
  }
}

//Called every step
Entity.prototype.step = function(delta){
  if (player.mode == "spectator" && this == cam) return false;

  var spd = this.speed*(delta/10);

  this.x += Math.sign(this.tx*32-this.x)*spd;
  this.y += Math.sign(this.ty*32-this.y)*spd;
  if (Math.abs(this.tx*32-this.x)<spd){this.x = this.tx*32}
  if (Math.abs(this.ty*32-this.y)<spd){this.y = this.ty*32}

  if (!this.isVisible() || !this.container.transform ) return;
  this.container.x = this.x;
  this.container.y = this.y;
  for (var i = 0; i < this.spriteData.length; i++){
    var data = this.spriteData[i];
    var sprite = this.sprites[i];
    if (!sprite) continue;

    if(!data.source == ""){
      var path = subfolder+"sprites/"+data.source;
      sprite.x = data.x || 0;
      sprite.y = data.y || 0;
      sprite.setTexture(getTextureFrame(path, data.index || 0, data.width || 32, data.height || 32));
      if (data.angle){
        sprite.rotation = data.angle * Math.PI / 180;
        sprite.x = 32;
        sprite.y = 16;
      }
      //client side animations
      if (data.animation == "jump"){
        var f = ((this.x % 32)/32)+((this.y % 32)/32);
        sprite.y = -(Math.sin(f*Math.PI)*4) + data.y;
      } else if (data.animation == "strip"){
        data.index = Math.floor((Date.now() % data.animationTime) / (data.animationTime / data.number));
      }

      if (data.visible != undefined){
        sprite.visible = data.visible;
      }
      if (data.scale){
        sprite.scale.x = data.scale;
        sprite.scale.y = data.scale;
      }
    }
  }

  if (this.states.includes("burning")){
    if (this.spriteBurnFront == undefined){
      this.spriteBurnFront = new PIXI.Sprite(getTextureFrame("sprites/effects/eff_fire_human_front.png",0,32,32));
      this.spriteBurnBack = new PIXI.Sprite(getTextureFrame("sprites/effects/eff_fire_human_back.png",0,32,32));
      this.container.addChild(this.spriteBurnBack);
      this.container.swapChildren(this.spriteBurnBack, this.sprites[0]);
      this.container.addChild(this.spriteBurnFront);
    }
    var currentTime = (Date.now() % 500);
    var frame = Math.floor(currentTime / 125);
    this.spriteBurnFront.visible = true;
    this.spriteBurnBack.visible = true;
    this.spriteBurnFront.setTexture(getTextureFrame("sprites/effects/eff_fire_human_front.png",frame,32,32));
    this.spriteBurnBack.setTexture(getTextureFrame("sprites/effects/eff_fire_human_back.png",frame,32,32));
  }else{
    if (this.spriteBurnFront){
      this.spriteBurnFront.visible = false;
    }
    if (this.spriteBurnBack){
      this.spriteBurnBack.visible = false;
    }
  }
  
  if (mouseOverRaw(this.x,this.y,this.x+32,this.y+32)){
    hoverlist.push(this);
  }
  
}

//Destroys the entity and removes it from the world
Entity.prototype.destroy = function(){
  console.log("Destroyed entity", this);

  for (var i = 0; i < this.sprites.length; i++){
    this.sprites[i].destroy();
  }
  for (var i = 0; i < this.lights.length; i++){
    this.lights[i].destroy();
  }
  this.container.destroy();
  if (this.tile){
    world.cellSetOverwrite(this.tx,this.ty,{})
  }
  if (this.spriteBurnBack){
    this.spriteBurnBack.destroy();
    this.spriteBurnFront.destroy();
  }
}

//Changes the drawing layer of the entity
Entity.prototype.changeLayer = function(layer){
  if (layer != this.layer){
    stageEntities.children[this.layer].removeChild(this.container);
    this.layer = layer;
    stageEntities.children[this.layer].addChild(this.container);
  }
}