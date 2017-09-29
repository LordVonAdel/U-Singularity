
io.on('connection', function(socket){
  var ip = socket.request.connection.remoteAddress;
  var isPlayerNew = true;

  socket.emit('resource',loader.res);

  playerlist.forEach(function(obj){
    if (obj.ip == ip){
      obj.socket = socket;
      //isPlayerNew = false;
    }
    socket.emit('player_joined',{id: obj.id});
  });
  
  if (isPlayerNew){
    socket.emit('welcome',{id: 0});
    console.log("[Server]A user connected! ("+ip+")");
  }else{
    console.log("[Server]A user reconnected! ("+ip+")");
  }

  socket.on('welcome', function(data){
    var pl = new player.Player(socket);
    //playerlist.push(pl);
    games[0].addPlayer(pl);
    //pl.teleport(wrd.spawnX, wrd.spawnY);
    pl.popup("config","./html/login.html", {error: ""});
    games[0].broadcast('player_joined',{id: pl.id});
    nextPlayerId ++;
  });
});
