//Entrance point

const fs = require("fs");
const Loader = require("./loader.js");
const LobbyController = require("./lobbyController.js");
const api = require("./api.js");

loader = new Loader();
loader.loadConfig();
loader.loadClasses();
loader.loadPermissions();
var config = loader.config;

var http = require("http").createServer(function(req, res){
  url = req.url;
  if (url == "/"){url="/game.html"}
  //The api
  if (url == "/api"){
    return api(req, res, lc);
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
}).listen(loader.config.port,function(){console.log("[Server]Listening on port "+loader.config.port)});

io = require("socket.io")(http);
require("./networking.js");

lc = null;

loader.auto(function(){ //load all things from the modules directory
  lc = new LobbyController(config);
  step();
});

lasttime = Date.now();
var step = function() {
  setTimeout(step, 1000/config.tickRate);
  delta = Date.now() - lasttime;
  lasttime = Date.now();

  lc.step(delta);
  
  if (Date.now() - lasttime > (1000/config.tickRate) * 1.5){ //50% tolerance
    console.log("The server is overloaded or the system time changed! Delta: " + delta);
  }
}