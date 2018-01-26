//Entrance point

const fs = require("fs");
loader = require("./loader.js");
config = null;
loader.loadConfig();
loader.loadClasses();
const LobbyController = require("./lobbyController.js");

var http = require("http").createServer(function( req, res){
  url = req.url;
  if (url == "/"){url="/game.html"}
  //The api
  if (url == "/api"){
    if (config.enableAPI){
      var gameList = [];
      var playersOnline = 0;
      for (var i = 0; i < games.length; i++){
        var game = games[i];
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
        serverPort: config.port,
        serverName: config.servername,
        motd: config.motd,
        playersOnline: playersOnline,
        games: gameList
      }));
    }else{
      return res.end("API is disabled!");
    }
  }
  var filename = __dirname+"/../client"+url;
  //console.log(filename)
  fs.readFile(filename,function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading file! ('+url+")");
    }
    res.writeHead(200);
    res.end(data);
  });
}).listen(config.port,function(){console.log("[Server]Listening on port "+config.port)});

io = require("socket.io")(http);
require("./networking.js");

lc = null;

loader.auto(function(){ //load all things from the modules directory
  lc = new LobbyController(config);
  res = loader.res;

  /*
  nextPlayerId = 0;
  nextEntId = 0;
  if (!config.games || config.games.length == 0){console.error("No Games defined!")}

  for(var i = 0; i < config.games.length; i++){
    var cGame = config.games[i];
    games[i] = new Game(cGame.maps, cGame.gamemode, cGame, i);
  }
  */
  
  update();
});

/*
playerlist = [];
games = [];
*/

lasttime = Date.now();
var update = function() {
  setTimeout(update, 1000/config.tickRate);
  delta = Date.now() - lasttime;
  lasttime = Date.now();
  /*for (var i = 0; i < games.length; i++) {
    games[i].step(delta);
  }*/

  lc.step(delta);
  
  if (Date.now() - lasttime > (1000/config.tickRate) * 1.5){ //50% tolerance
    console.log("The server is overloaded or the system time changed! Delta: " + delta);
  }
}