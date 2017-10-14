//Entity constuctor
handy = require('./handy.js');

function Entity(world, type, tx, ty, extraData){
  this.id = world.nextEntId;
  this.ent = res.objects[type];

  if (this.ent == undefined){
    console.log("Unknown ent-type: "+type);
    this.error = "Entity type does not exists!";
    return null;
  }

  this.type = type;
  this.sprites = [];
  if (typeof this.ent.image == typeof []){
    for (var i = 0; i < this.ent.image.length; i++){
      var img = this.ent.image[i];
      this.sprites[i] = {
        index: img.index || 0,
        number: img.number || 0,
        source: img.source,
        x: img.x || 0,
        y: img.y || 0,
        animation: img.animation || "none",
        width: 32,
        height: 32,
        visible: img.visible,
        scale: img.scale
      };
    }
  }else{
    this.sprites[0] = {
      index: 0,
      number: this.ent.imageNumber,
      source: this.ent.image,
      x: 0,
      y: 0,
      animation: "none"
    }
  }
  this.collision = this.ent.collision;
  this.x = tx * 32;
  this.y = ty * 32;
  this.tx = +tx;
  this.ty = +ty;
  this.speed = 1;
  this.bucket = null;
  this.sync = {};
  this.layer = this.ent.layer || 10;
  this.dragger = null; //The thing this is dragged by
  this.drag = null; //The thing this is dragging
  this.world = world;
  this.isMoving = false;
  this.client = null;
  this.noclip = false;

  this.lights = [];

  this.states = [];

  if (this.ent.wallMounted){
    this.orientation = 0;
    var up = this.world.cellGetTile(this.tx, this.ty - 1);
    var right = this.world.cellGetTile(this.tx + 1, this.ty);
    var down = this.world.cellGetTile(this.tx, this.ty + 1);
    if (down && down.collision){
      this.orientation = 1;
    }else if (right && right.collision){
      this.orientation = 2;
    }else if (up && up.collision){
      this.orientation = 3;
      this.sprites[0].y -= 26;
    }
    this.changeImageIndex(0, this.orientation);
  }

  Object.assign(this.sync, this.ent.sync);
  Object.assign(this, extraData);
  this.fire("onInit");

  this.world.ents[this.world.nextEntId] = this;
  if (this.ent.onStep || this.ent.onAnimation){
    this.world.entsStep.push(this);
  }
  this.world.nextEntId ++;

  this.world.gridEntAdd(this.tx, this.ty, this);

  this.updateBucket();
}

//clear the thing that is dragging this thing
Entity.prototype.clearDragger = function(){
  if (this.dragger != null){
    if (this.dragger.client){
      this.dragger.client.shareSelf({ drag: false });
    }
    this.dragger.drag = null;
    this.dragger = null;
  }
}

//set another thing which is now dragging this thing
Entity.prototype.setDragger = function(dragger){
  this.clearDragger();
  this.dragger = dragger;
  this.dragger.drag = this;
}

//called every step. Yes 60 times per second!
Entity.prototype.step = function(delta){
  this.fire("onStep", delta);
  if (this.x != this.tx*32 || this.y != this.ty*32){
    this.x = handy.transition(this.x,this.tx*32,this.speed*(delta/10),0);
    this.y = handy.transition(this.y,this.ty*32,this.speed*(delta/10),0);
    if (Math.abs(this.x - this.tx*32)+Math.abs(this.y - this.ty*32) < this.speed){
      this.isMoving = false;
    }
  }
}

//uhm... there is an animation system in here?
Entity.prototype.animate = function(delta){
  this.fire("onAnimation", delta);
}

//so you can interact with entitys. This happens if somebody dares to interact!
Entity.prototype.use = function(user, item){
  this.fire("onClick", user, item);
  var itemType = res.items[item.type];
  if (itemType != undefined){
    if (itemType.actions != undefined && this.ent != undefined){
      itemType.actions.forEach(function(value){
        if (this.ent.actions != undefined)
          if (this.ent.actions[value] != undefined){
            this.ent.actions[value].call(this, user, item)
          }
        if (value == "destroy"){
          this.destroy();
        }
      }, this);
    }
  }
}

//Change the sprite data
Entity.prototype.changeSprite = function(index, data){
  var spr = this.sprites[index];
  Object.assign(spr, data);
  this.share({spriteData: this.sprites});
}

//change the image index of a sprite with a specific index
Entity.prototype.changeImageIndex = function(index, data){
  var oldIndex = this.sprites[index].index;
  if (oldIndex != data){
    this.sprites[index].index = data;
    this.share({spriteData: this.sprites});
  }
}

//Set a light
Entity.prototype.setLight = function(index, data){
  if (this.lights[index]){
    Object.assign(this.lights[index], data);
    if (data == null){
      this.lights[index] = null;
    }
  }else{
    this.lights[index] = data;
  }
  this.share({lightData: this.lights});
}

//tell everybody near you how cool you are
Entity.prototype.share = function(data){
  if (data){
    var obj = Object.assign({id: this.id},data);
  }else{
    var obj = this.getClientData();
  }
  if (this.bucket != null){
    this.bucket.broadcastArea('ent_data',obj);
  }else{
    this.world.broadcast('ent_data',obj);
  }
}

//update because maybe something changed with you and you were not aware about that
Entity.prototype.update = function(){
  this.updateBucket();
  this.fire("onUpdate");
}

//suicide
Entity.prototype.destroy = function(){
  this.clearDragger();
  this.world.gridEntFree(this.tx,this.ty,this); //say the world you are not any more blocking your position
  delete this.world.ents[this.id]; //let the world forgot about you
  if (this.ent.onStep || this.ent.onAnimation){
    var index = this.world.entsStep.indexOf(this);
    if (index){
      this.world.entsStep.splice(index, 1);
    }
  }
  this.world.broadcast('ent_destroy',{id: this.id}); //let anybody know you are no longer existing
  if (this.bucket != null){
    this.bucket.removeObject(this); //free you from the bucket
  }
  //now you can go into entity heaven
}

//move in an direction with a specific speed. The distance is one tile
Entity.prototype.moveDir = function(direction,speed){
  var x = this.tx;
  var y = this.ty;
  switch (direction){
    case 0: x+= 1; break;
    case 1: y-= 1; break;
    case 2: x-= 1; break;
    case 3: y+= 1; break;
  }
  var c = this.world.collisionsGet(x, y);
  for (var i=0; i<c.length; i++){
    var ent = c[i];
    if (ent.ent.draggable){
      ent.moveDir(direction, speed);
      ent.clearDragger();
    }
  }
  return this.moveTo(x,y,speed);
}

//move onto a specific tile
Entity.prototype.moveTo = function(x,y,speed){
  this.speed = speed;
  return this.move(x,y);
}

//why are there so many move function!!?
Entity.prototype.move = function(x,y){
  if (!this.world.collisionCheck(x,y) || this.noclip){
    this.world.gridEntFree(this.tx,this.ty,this);
    this.world.gridEntAdd(x,y,this);
    var dx = this.tx;
    var dy = this.ty;
    this.tx = x;
    this.ty = y;
    this.share({tx: this.tx, ty: this.ty, speed: this.speed});
    this.updateBucket();
    this.isMoving = true;
    if (this.drag){
      this.drag.moveTo(dx, dy, this.speed);
    }
    return true;
  }else{
    var c = this.world.collisionsGet(x, y);
    for (var i=0; i < c.length; i++){
      ent = c[i];
      if (ent.ent.onPush){
        ent.ent.onPush.call(ent, this);
      }
    }
    return false;
  }
}

//reveal everything about you, the clients should know
Entity.prototype.getClientData = function(){
  return {
    id: this.id, 
    tx:this.tx, 
    ty:this.ty, 
    spriteData: this.sprites,
    lightData: this.lights,
    layer: this.layer,
    tile: this.ent.tile != {} ? this.ent.tile : undefined,
    states: this.states
  }
}

//when you spawn send the things returning from the function above to the clients. This is obviously called when the ent spawns.
Entity.prototype.spawn = function(){
  this.updateBucket();
  if (this.bucket != null){
    this.bucket.broadcastArea('ent_spawn', this.getClientData());
  }
}

//are you in same bucket as before or somewhere else? 
Entity.prototype.updateBucket = function(){
  this.changeBucket(this.world.buckets.cellGet(Math.floor(this.tx/config.bucket.width),Math.floor(this.ty/config.bucket.height)));
}

//this bucket is shit. Go anywhere else where you think you belong more to
Entity.prototype.changeBucket = function(bucket){
  if (bucket != undefined){
    if (this.bucket != bucket){
      bucket.addObject(this);
      if (this.bucket != null){
        this.bucket.removeObject(this);
      }
      this.bucket = bucket;
    }
  }
}

//Teleport this entity
Entity.prototype.teleport = function(tileX, tileY){
  this.tx = tileX;
  this.ty = tileY;
  this.x = tileX*32;
  this.y = tileY*32;
  this.updateBucket();
  this.share({tx: this.tx, ty: this.ty, x: this.x, y: this.y});
}

//Fires an event
Entity.prototype.fire = function(event, a, b, c){
  if (this.ent[event] != undefined){
    this.ent[event].call(this, a, b, c);
  }
}

//sets or unset a state. A state can be for example: "burning"
Entity.prototype.setState = function(state, value){
  if (value == true){
    if (!this.states.includes(state)){
      this.states.push(state);
    }
  }else{
    if (this.states.includes(state)){
      delete this.states[this.states.indexOf(state)];
    }
  }
  this.share();
}

//Gets if a state is set
Entity.prototype.getState = function(state){
  return this.states.includes(state);
}

//toggles the state of a state
Entity.prototype.toggleState = function(state){
  this.setState(state, !this.getState(state));
}

//Reloads the entity
Entity.prototype.reload = function(){
  this.ent = res.objects[this.type];
  this.update();
}

module.exports = Entity;