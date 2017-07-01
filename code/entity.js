function Entity(type,tx,ty){
  this.id = nextEntId;
  this.ent = res.objects[type];
  if (this.ent == undefined){
    console.log("Unknown ent-type: "+type)
    return false;
  }
  this.type = type;
  this.image = this.ent.image;
  this.imageNumber = this.ent.imageNumber;
  this.imageIndex = this.ent.imageIndex;
  this.collision = this.ent.collision;
  this.event_onclick = this.ent.onClick;
  this.x = tx*32;
  this.y = ty*32;
  this.tx = tx;
  this.ty = ty;
  this.dragSpeed = 1;
  this.animation = false;
  this.bucket = null;//wrd.buckets.cellGet(Math.floor(tx/config.bucket.width),Math.floor(ty/config.bucket.height));
  this.sync = {};
  this.layer = this.ent.layer || 10;
  this.dragger = null;

  Object.assign(this.sync, this.ent.sync);
  if (this.ent.oninit != undefined){
    this.ent.onInit(this);
  }

  wrd.ents[nextEntId] = this;
  nextEntId ++;

  this.updateBucket();
}

Entity.prototype.clearDragger = function(){
  if (this.dragger != null){
    this.dragger.resetDrag();
    this.dragger = null;
  }
}

Entity.prototype.setDragger = function(dragger){
  this.clearDragger();
  this.dragger = dragger;
}

Entity.prototype.step = function(delta){
  if (this.ent.onStep != undefined){
    this.ent.onStep(this);
  }
  if (this.x != this.tx*32 || this.y != this.ty*32){
    this.x = handy.transition(this.x,this.tx*32,this.dragSpeed*(delta*100),0)
    this.y = handy.transition(this.y,this.ty*32,this.dragSpeed*(delta*100),0)
    this.share({x:this.x, y:this.y});
  }
}

Entity.prototype.animate = function(){
  if (this.ent.onAnimation != undefined){
    this.ent.onAnimation(this);
  }
}

Entity.prototype.use = function(user,item){
  if (this.event_onclick){
    this.event_onclick(user,this);
  }
  var that = this;
  var itemType = res.items[item.type];
  if (itemType != undefined){
    if (itemType.actions != undefined && this.ent != undefined){
      itemType.actions.forEach(function(value){
        if (that.ent.actions != undefined)
          if (that.ent.actions[value] != undefined){
            that.ent.actions[value](user,that,item)
          }
        if (value == "destroy"){
          that.destroy();
        }
      });
    }
  }
}

Entity.prototype.changeImage = function(image){
  this.image = image;
  this.share({image: image, imageNumber: this.imageNumber, imageIndex: this.imageIndex, imageNumber: this.imageNumber});
}

Entity.prototype.share = function(data){
  if (data){
    var obj = Object.assign({id: this.id},data)
  }else{
    var obj = this.getClientData();
  }
  if (this.bucket != null){
    this.bucket.broadcastArea('ent_data',obj);
  }else{
    handy.broadcast('ent_data',obj);
  }
}

Entity.prototype.update = function(){
  this.updateBucket();
  if (this.ent.onUpdate){
    this.ent.onUpdate(this);
  }
  if (this.collision){
    wrd.collisionAdd(this.tx,this.ty,this);
  }else{
    wrd.collisionFree(this.tx,this.ty,this);
  }
}

Entity.prototype.destroy = function(){
  wrd.collisionFree(tx,ty,this);
  delete wrd.ents[this.id];
  handy.broadcast('ent_destroy',{id: this.id});
  this.bucket.removeObject(this);
}

Entity.prototype.moveDir = function(direction,speed){
  var x = this.tx;
  var y = this.ty;
  switch (direction){
    case 0: x+= 1; break;
    case 1: y-= 1; break;
    case 2: x-= 1; break;
    case 3: y+= 1; break;
  }
  return this.moveTo(x,y,speed);
}

Entity.prototype.moveTo = function(x,y,speed){
  this.dragSpeed = speed;
  var c = this.move(x,y);
  this.share();
  return c;
}

Entity.prototype.move = function(x,y){
  if (wrd.collisionCheck(x,y) == []){
    if (this.collision){
      wrd.collisionFree(this.tx,this.ty,this);
      wrd.collisionAdd(x,y,this);
    }
    this.tx = x;
    this.ty = y;
    this.updateBucket();
    return true;
  }else{
    return false;
  }
}

Entity.prototype.getClientData = function(){
  if (this.ent.tile != {}){
    return {x:this.x, y:this.y, image: this.image, id: this.id, imageIndex: this.imageIndex, imageNumber: this.imageNumber, layer: this.layer, tile: this.ent.tile}
  }else{
    return {x:this.x, y:this.y, image: this.image, id: this.id, imageIndex: this.imageIndex, imageNumber: this.imageNumber, layer: this.layer} 
  }
}

Entity.prototype.spawn = function(){
  handy.broadcast('ent_spawn',this.getClientData());
}

Entity.prototype.updateBucket = function(){
  this.changeBucket(wrd.buckets.cellGet(Math.floor(this.tx/config.bucket.width),Math.floor(this.ty/config.bucket.height)));
}

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

module.exports.Entity = Entity;