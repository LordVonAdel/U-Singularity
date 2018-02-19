var msgids = require('./../msgids.json');

io.on('connection', function(socket){
  var ip = socket.request.connection.remoteAddress;
  var isPlayerNew = true;

  socket.emit('resource',{tiles: loader.res.tiles});
  socket.emit('msgids', msgids);

  /*
  playerlist.forEach(function(obj){
    if (obj.ip == ip){
      obj.socket = socket;
      //isPlayerNew = false;
    }
    socket.emit('player_joined',{id: obj.id});
  });
  */
  
  if (isPlayerNew){
    socket.emit('welcome',{id: 0});
    console.log("[Server]A user connected! ("+ip+")");
  }else{
    console.log("[Server]A user reconnected! ("+ip+")");
  }

  socket.on('welcome', function(data){
    lc.createPlayer(socket);
  });
});
