//Game object, which handles everything!
var World = require("./world.js");
var Entity = require("./entity.js");
var fs = require("fs");

function Game(maps, gamemode, gameConfig){
  this.players = [];
  this.worlds = [];
  this.config = gameConfig;
  //Load a map
  for (var i = 0; i < maps.length; i++){
    world = new World(this);
    world.load("maps/"+maps[i]+".json");
    this.worlds[i] = world;
  }

  var GM = require("./../gamemodes/"+gamemode+".js");
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
  if (this.config.playerLimit <= this.players.length){
    player.kick("Sorry", "The player limit of this server have been already reached! Sorry... Try again later");
    console.log("[Game]Player can't connect because the lobby is full!");
    return false;
  }
  player.game = this;
  this.players.push(player);
  player.ent = new Entity(this.worlds[0], "player", this.spawnX, this.spawnY);
  this.changeWorld(player, 0);
  this.gamemode.playerJoined(player);
  return true;
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

//shows a html popup at every player in the game
Game.prototype.showGlobalPopup = function(id, str, data){
  for (var k in data){
    str = str.replace("{"+k+"}", data[k]);
  }
  for (var i = 0; i < this.players.length; i++){
    var player = this.players[i];
    player.socket.emit('server_content', { html: str, id: id });
  }
}

//loads a file and shows it as popup at every player in the game
Game.prototype.showGlobalPopupFromFile = function(id, filename, data){
  var game = this;
  fs.readFile(filename, "utf-8", function (err, str) {
    if (err){return err;}
    game.showGlobalPopup(id, str, data);
  });
}

//Sends a chat message to every player in the game
Game.prototype.sendChatMessage = function(message){
  for (var i = 0; i < this.players.length; i++){
    this.players[i].msg(message);
  }
}

//Restarts the game
//ToDo: Write function
Game.prototype.restart = function(){

}

module.exports = Game;