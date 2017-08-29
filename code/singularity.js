//require("./static_file_server.js")

fs = require("fs");
loader = require("./loader.js");
player = require("./player.js");
var gameloop = require("node-gameloop");
var world = require("./world.js");
var url = require('url');
spawn = require("./spawn.js");
config = JSON.parse(fs.readFileSync("config.json"));
handy = require("./handy.js");
mixtures = require("./mixtures.js");
atmos = require("./atmos.js");
buckets = require("./bucket.js");

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
  wrd = new world.World(); //Construct World
  wrd.load("maps/"+config.startWorld+".json");
  gm = require("./gamemode.js");
  require("./startup.js");
  
  gameloop.setGameLoop(update,1000/60);
}) 


playerlist = [];

frameCount = 0;
var update = function(delta) {
  playerlist.forEach(function(value){
    value.step(delta);
  });
  gm.loop();
  for (k in wrd.ents){
    var ent = wrd.ents[k];
    if (ent.animation){
      wrd.ents[k].animate();
    }
    ent.step(delta);
  }
}
setInterval(function(){
  playerlist.forEach(function(value){
    value.share();
  });
},1000)