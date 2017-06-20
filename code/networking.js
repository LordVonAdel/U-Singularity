
io.on('connection', function(socket){
  var ip = socket.request.connection.remoteAddress;
  var isPlayerNew = true;

  socket.emit('resource',loader.res);
  //socket.emit('world',{w:wrd.width,h:wrd.height,str:wrd.grid.save()});

  //socket.emit('world_region',{str:wrd.grid.save(),x:0,y:0,w:wrd.width})

  playerlist.forEach(function(obj){
    if (obj.ip == ip){
      obj.socket = socket;
      //isPlayerNew = false;
    }
    socket.emit('player_joined',{id: obj.id});
  });
  //send all existing entities to the new player. This will be replaced with the bucket system
  /*for (var k in that.ents) {
    var ent = wrd.ents[k];
    socket.emit('ent_data',ent.getClientData());
  }*/
  
  if (isPlayerNew){
    socket.emit('welcome',{id: nextEntId});
    console.log("[Server]A user connected! ("+ip+")");
  }else{
    console.log("[Server]A user reconnected! ("+ip+")");
  }

  socket.on('welcome', function(data){
    var pl = new player.Player(socket);
    playerlist.push(pl);
    pl.teleport(wrd.spawnX, wrd.spawnY);
    pl.popup("config","./html/login.html");
    handy.broadcast('player_joined',{id: pl.id})
    nextPlayerId ++;
  });
});
