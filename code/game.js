//Game object, which handles everything!
var World = require("./world.js");

function Game(){
  this.players = [];
  this.worlds = [];
  //Load a map
  world = new World(this);
  world.load("maps/"+config.startWorld+".json");
  this.worlds[0] = world;

  var GM = require("./../gamemodes/gmSingularity.js");
  this.gamemode = new GM(this);
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
  this.gamemode.playerJoined(player);
}

//Step / Tick in the game
Game.prototype.step = function(delta){
  this.worlds.forEach(function(world){
    world.step(delta);
  });
  this.players.forEach(function(player){
    player.step(delta);
  });
  this.gamemode.step(delta);
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

Game.prototype.showGlobalPopup = function(id, str, data){
  for (var k in data){
    str = str.replace("{"+k+"}", data[k]);
  }
  for (var i = 0; i < this.players.length; i++){
    var player = this.players[i];
    player.socket.emit('server_content', { html: str, id: id });
  }
}

Game.prototype.showGlobalPopupFromFile = function(id, filename, data){
  var game = this;
  fs.readFile(filename, "utf-8", function (err, str) {
    if (err){return err;}
    game.showGlobalPopup(id, str, data);
  });
}

Game.prototype.sendChatMessage = function(message){
  for (var i = 0; i < this.players.length; i++){
    this.players[i].msg(message);
  }
}

module.exports = Game;