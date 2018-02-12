module.exports = function(req, res, lc){
  if (!lc) return res.end("Server is starting!");;
  if (loader.config.enableAPI){
    var gameList = [];
    var playersOnline = 0;
    for (var i = 0; i < lc.games.length; i++){
      var game = lc.games[i];
      playersOnline += game.clients.length;
      gameList.push(Object.assign({
        playersOnline: game.clients.length,
        gamemode: game.gamemode.name,
        playerLimit: game.config.playerLimit,
        name: game.name
      }, game.gamemode.getAPIData()));
    }

    res.writeHead(500);
    return res.end(JSON.stringify({
      serverPort: loader.config.port,
      serverName: loader.config.servername,
      motd: loader.config.motd,
      playersOnline: playersOnline,
      games: gameList
    }));
  }else{
    return res.end("API is disabled!");
  }
}