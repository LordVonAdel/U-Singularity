//require("./static_file_server.js")

var fs = require("fs");
loader = require("./loader.js");
var player = require("./player.js");
var gameloop = require("node-gameloop");
var world = require("./world.js");
var url = require('url');
config = null;
loader.loadConfig();
loader.loadClasses();
mixtures = require("./mixtures.js");
atmos = require("./atmos.js");
buckets = require("./bucket.js");
var Game = require("./game.js");

var http = require("http").createServer(function( req, res){
  url = req.url;///url.parse(req.url);
  if (url == "/"){url="/game.html"}
  //The api
  if (url == "/api"){

    var gameList = [];
    var playersOnline = 0;
    for (var i = 0; i < games.length; i++){
      var game = games[i];
      playersOnline += game.players.length;
      gameList.push(Object.assign({
        playersOnline: game.players.length,
        gamemode: game.gamemode.name,
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
}).listen(config.port,function(){console.log("[Server]Listening on port: "+config.port)});

io = require("socket.io")(http);
require("./networking.js");

loader.auto(function(){ //load all things from the modules directory
  res = loader.res;
  nextPlayerId = 0;
  nextEntId = 0;
  if (!config.games || config.games.length == 0){console.error("No Games defined!")}

  for(var i = 0; i < config.games.length; i++){
    var cGame = config.games[i];
    games[i] = new Game(cGame.maps, cGame.gamemode);
  }
  require("./startup.js");
  
  gameloop.setGameLoop(update,1000/60);
});


playerlist = [];
games = [];

frameCount = 0;
var update = function(delta) {
  games.forEach(function(game){
    game.step(delta);
  });
  if (delta >= (1000/60)){
    console.log("The server is overloaded! Delta: " + delta);
  }
}
setInterval(function(){
  playerlist.forEach(function(value){
    value.share();
  });
},1000)