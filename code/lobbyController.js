function lobbyController(){
  this.games = [];

  for(var i = 0; i < config.games.length; i++){
    var cGame = config.games[i];
    this.games[i] = new Game(cGame.maps, cGame.gamemode, cGame, i);
  }

}

