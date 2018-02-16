//Game object, which handles everything!
const World = require("./world.js");
const Entity = require("./entity.js");
const fs = require("fs");
const path = require("path");

function Game(lobbyController, gamemode, gameConfig, index){
  this.clients = [];
  this.worlds = [];
  this.config = gameConfig;
  this.index = index;
  this.controller = lobbyController;
  this.consolePrefix = "[Game:"+this.index+"]";

  //Load a map
  for (var i = 0; i < gameConfig.maps.length; i++){
    world = new World(this, i);
    world.load("maps/"+gameConfig.maps[i]+".json");
    this.worlds[i] = world;
  }
  this.gamemode = null;
  var pth = path.resolve(__dirname, "./../gamemodes/"+gamemode+".js");
  if (fs.existsSync(pth)){
    var GM = require(pth);
    this.gamemode = new GM(this, gameConfig.gamemodeConfig || {});
    console.log(this.consolePrefix+"Started and using gamemode "+this.gamemode.name);
  }else{
    console.error(this.consolePrefix+"Gamemode not found: "+gamemode);
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
    console.log(this.consolePrefix+"Player can't connect because the lobby is full!");
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
Game.prototype.changeWorld = function(player, index, spawnX, spawnY, extraData){
  if (index < 0 || index >= this.worlds.length) {return false;}
  
  player.socket.emit('clear');

  if (player.world){
    console.log(this.consolePrefix+"Move "+player.name+" from world "+player.world.index+" to "+index);
  }

  var sync = {};
  if (player.ent != null){
    sync = player.ent.sync;
    player.ent.destroy();
    player.ent = null;
  }
  if (extraData && extraData.sync){
    sync = extraData.sync;
  }

  var world = this.worlds[index];

  if (!spawnX){spawnX = world.spawnX}
  if (!spawnY){spawnY = world.spawnY}

  var ent = world.spawnEntity("player", spawnX, spawnY, extraData);
  player.world = world;
  player.ent = ent;
  Object.assign(player.ent.sync, sync);
  player.camSet(ent);
  ent.client = player;
  player.updateBucket();
  if (player.ent.bucket != null){
    player.ent.bucket.sendMegaPacket(player.socket);
  }
  ent.update();
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
  if (filename == null){
    game.showGlobalPopup(id, null, data);
    return;
  }
  
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

//Closes the game
Game.prototype.end = function(){
  console.log(this.consolePrefix + "End game");
  for (let i = 0; i < this.clients.length; i++) {
    const element = this.clients[i];
    element.kick("Game Closed", "The game closed. Reload the page to get into a new one!");
  }
}

//Restarts the game
Game.prototype.restart = function(){
  console.log(this.consolePrefix + "Restart game");
  this.controller.restartGame(this.index);
}

module.exports = Game;