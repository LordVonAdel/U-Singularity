//A bucket is used to split the world into multiple parts, like chunks in minecraft
const msgids = require('./../msgids.json');

//the constructor for a bucket instance
function Bucket(x,y,world){ 
  this.objects = {};
  this.players = {};
  this.x = x;
  this.y = y;
  this.world = world;
  this.width = loader.config.bucket.width;
  this.height = loader.config.bucket.height;
}

//adds an entity to the bucket. Mostly when it moves in there
Bucket.prototype.addObject = function(object){
  this.objects[object.id] = object;
}

//removes an entity off the bucket. Mostly when it leaves into another bucket
Bucket.prototype.removeObject = function(object){
  delete this.objects[object.id];
}

//the same thing with players instead of entities
Bucket.prototype.addPlayer = function(object){ 
  this.players[object.id] = object;
}

//see above
Bucket.prototype.removePlayer = function(object){ 
  delete this.players[object.id];
}

//sends a message to every player in the bucket
Bucket.prototype.broadcast = function(msg,data){
  for(k in this.players){
    this.players[k].socket.emit(msg,data);
  }
}

//sends a message to every player in this bucket and around
Bucket.prototype.broadcastArea = function(msg,data,range){ 
  var rad = range || 3;
  for(var i = 0; i<rad*rad; i++){
    var x = Math.max(Math.min((i % rad + this.x) - Math.floor(rad/2),this.world.buckets.width),0);
    var y = Math.max(Math.min((Math.floor(i/rad) + this.y) - Math.floor(rad/2),this.world.buckets.height),0);
    var bucket = this.world.buckets.cellGet(x,y);
    if (bucket){
      bucket.broadcast(msg,data);
    }
  }
}


Bucket.prototype.sendMegaPacket = function(socket){ //to the left you see a function which tells everything about himself what a player should know about him
  for (k in this.objects){
    if (!k.isHidden){
      socket.emit(msgids["ent:data"], this.objects[k].getClientData());
    }
  }
  socket.emit('world_region', {str: this.world.grid.saveRegion(this.x*this.width, this.y*this.height, this.width, this.height), x: this.x*this.width , y: this.y*this.height, w: this.width})
}

//and here we have the same but it sends data of his neighbors too
Bucket.prototype.sendMegaPacketArea = function(socket){
  var rad = 3;
  for(var i = 0; i<rad*rad; i++){
    var x = Math.max(Math.min((i % rad + this.x) - Math.floor(rad/2),this.world.buckets.width),0);
    var y = Math.max(Math.min((Math.floor(i/rad) + this.y) - Math.floor(rad/2),this.world.buckets.height),0);
    var bucket = this.world.buckets.cellGet(x,y);
    if (bucket){
      bucket.sendMegaPacket(socket);
    }
  }
}

//and here we kill everything in this bucket. I wonder what happens when a player is removed from the bucket without telling him?
Bucket.prototype.clear = function(){
  this.objects = {};
  this.players = {};
}

//encapsulation shit. Don't know why I have done this.
Bucket.prototype.getClients = function(){
  return this.players;
}

//sends the full region again for the case of big changes
Bucket.prototype.resendRegion = function(){
  for (k in this.players){
    this.sendMegaPacketArea(this.players[k].socket);
  }
}

//and make it so requires can be used to get the bucket. Basic node.js stuff
module.exports = Bucket;