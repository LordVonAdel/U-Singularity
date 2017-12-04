//Game object, which handles everything!
const World = require("./world.js");
const Entity = require("./entity.js");
const fs = require("fs");

function Game(maps, gamemode, gameConfig, index){
  this.clients = [];
  this.worlds = [];
  this.config = gameConfig;
  this.index = index;

  //Load a map
  for (var i = 0; i < maps.length; i++){
    world = new World(this);
    world.load("maps/"+maps[i]+".json");
    this.worlds[i] = world;
  }
  this.gamemode = null;
  var path = __dirname + "./../gamemodes/"+gamemode+".js"
  if (fs.existsSync(path)){
    var GM = require(path);
    this.gamemode = new GM(this);
    console.log("[Game:"+this.index+"]Started and using gamemode "+this.gamemode.name);
  }else{
    console.error("[Game:"+this.index+"]Gamemode not found: "+gamemode);
  }
}

//Sends a packet to all clients in the game
Game.prototype.broadcast = function(event, data){
  for (var i = 0; i < this.clients.length; i++) {
    this.clients[i].socket.emit(event, data);
  }
}

//Add a player to the game
Game.prototype.addPlayer = function(player){
  if (this.config.playerLimit <= this.clients.length){
    player.kick("Sorry", "The player limit of this server have been already reached! Sorry... Try again later");
    console.log("[Game:"+this.index+"]Player can't connect because the lobby is full!");
    return false;
  }
  player.game = this;
  this.clients.push(player);
  player.ent = new Entity(this.worlds[0], "player", this.spawnX, this.spawnY);
  this.changeWorld(player, 0);
  if (this.gamemode){
    this.gamemode.playerJoined(player);
  }
  return true;
}

//Step / Tick in the game
Game.prototype.step = function(delta){
  this.worlds.forEach(function(world){
    world.step(delta);
  });
  this.clients.forEach(function(player){
    player.step(delta);
  });
  if (this.gamemode){
    this.gamemode.step(delta);
  }
}

//Change the world for one player
Game.prototype.changeWorld = function(player, index){
  if (player.ent != null){
    player.ent.destroy();
    player.ent = null;
  }
  var world = this.worlds[index];
  var ent = world.spawnEntity("player", world.spawnX, world.spawnY);
  player.world = world;
  player.ent = ent;
  ent.client = player;
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
  for (var i = 0; i < this.clients.length; i++){
    var player = this.clients[i];
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
  for (var i = 0; i < this.clients.length; i++){
    this.clients[i].msg(message);
  }
}

//Restarts the game
//ToDo: Write function
Game.prototype.restart = function(){

}

module.exports = Game;