const Game = require("./game.js");
const Client = require('./client.js');

//Handles joining players and game creation stuff

function LobbyController(config){
  this.games = [];
  this.nextPlayerId = 1;
  this.clients = [];
  this.config = config;

  if (!config.games || config.games.length == 0){console.error("No Games defined!")}
  for(var i = 0; i < config.games.length; i++){
    var cGame = config.games[i];
    this.games[i] = new Game(this, cGame.gamemode, cGame, i);
  }

}

//Will be called every step
LobbyController.prototype.step = function(delta){
  for (var i = 0; i < this.games.length; i++) {
    this.games[i].step(delta);
  }
}

//Creates a player
LobbyController.prototype.createPlayer = function(socket){
  var pl = new Client(socket, this.nextPlayerId++);
  if (this.games[0].addPlayer(pl)){ //return false if the player can't join the game
    //pl.popup("config","./html/login.html", {error: ""});
    this.games[0].broadcast('player_joined',{id: pl.id});
  }
}

//Removes a player
//ToDo: Check if this function is needed
LobbyController.prototype.removePlayer = function(player){
  var index = this.clients.indexOf(player);
  this.clients.splice(index, 1);
  delete player;
}

//Restarts a game
LobbyController.prototype.restartGame = function(index){
  var game = this.games[index];
  if (!game){return; }
  game.end();
  this.games.splice(index, 1);
  delete game;

  var cGame = this.config.games[index];
  this.games[index] = new Game(this, cGame.gamemode, cGame, index);
}

//this will kick every player in all games. Useful when the server is closed
LobbyController.prototype.kickAll = function(title, message){
  for (var i = 0; i < this.games.length; i++){
    var clients = this.games[i].clients;
    for (var j = 0; j < clients.length; j++){
      clients[j].kick(title, message);
    }
  }
}

module.exports = LobbyController;