//require("./static_file_server.js")

fs = require("fs");
loader = require("./loader.js");
player = require("./player.js");
var gameloop = require("node-gameloop");
var world = require("./world.js");
var url = require('url');
config = JSON.parse(fs.readFileSync("config.json"));
mixtures = require("./mixtures.js");
atmos = require("./atmos.js");
buckets = require("./bucket.js");
var Game = require("./game.js");

var http = require("http").createServer(function( req, res){
  url = req.url;///url.parse(req.url);
  if (url == "/"){url="/game.html"}
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
  games[0] = new Game();
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
}
setInterval(function(){
  playerlist.forEach(function(value){
    value.share();
  });
},1000)