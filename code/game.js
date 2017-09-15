//Game object, which handles everything!
var World = require("./world.js");

function Game(){
  this.players = [];
  //Create worlds
  this.worlds = [];
  //Load a map
  world = new World(this);
  world.load("maps/"+config.startWorld+".json");
  this.worlds[0] = world;
}

//Sends a packet to all players in the game
Game.prototype.broadcast = function(event, data){
  this.players.forEach(function(obj){
    obj.socket.emit(event, data);
  });
}

//Add a player to the game
Game.prototype.addPlayer = function(player){
  player.game = this;
  this.players.push(player);
  player.ent = new Entity(this.worlds[0], "player", this.spawnX, this.spawnY);
  this.changeWorld(player, 0);
}

//Step / Tick in the game
Game.prototype.step = function(delta){
  this.worlds.forEach(function(world){
    world.step(delta);
  });
  this.players.forEach(function(player){
    player.step(delta);
  });
}

//Change the world for one player
Game.prototype.changeWorld = function(player, index){
  if (player.ent != null){
    player.ent.destroy();
    player.ent = null;
  }
  var world = this.worlds[index];
  player.world = world;1
  player.ent = new Entity(world, "player", world.spawnX, world.spawnY);
  player.ent.client = player;
  player.updateBucket();
  if (player.ent.bucket != null){
    player.ent.bucket.sendMegaPacket(player.socket);
  }
  player.socket.emit('cam', player.ent.id);
}

module.exports = Game;