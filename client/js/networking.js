function initNetworking(){
  socket = io();

  socket.on('welcome',function(data){
    player.id = data.id;
    console.log("Connected to Server!");
    socket.emit('welcome',{});
    
    for (k in ents){
      ents[k].destroy();
      delete ents[k];
    }
    for (var i = 0; i < world.chunks.length; i++){
      var chunk = world.chunks[i];
      world.destroyChunk(chunk.x, chunk.y);
    }
    console.log("World Cleared!");
  });

  socket.on('cam',function(data){
    console.log("Change cam to entity with id "+data);
    camId = data;
    var ent = ents[data];
    if (ent != undefined){
      cam = ent;
    }else{
      socket.emit('entRequest',data);
    }
  });

  socket.on('chat',function(data){
    $("#chat_msg").append("<br>"+data.msg);
    $("#chat_msg").scrollTop($("#chat_msg").prop("scrollHeight"));
  });

  socket.on('resource',function(data){
    load(data);
  });

  socket.on('server_content',function(data){
    console.log("Open Popup "+data.id);
    contentSet(data.id,data.html);
  });

  socket.on('change_tile',function(data){
    world.tileSet(data.x, data.y, data.id);
  })

  socket.on('world_region',function(data){
    world.loadRegion(data.str,data.x,data.y,data.w);
    console.log("Received world region data!");
  });

  socket.on('ent_spawn',function(data){
    if (data == null){return;}
    var ent = new Entity(data.id,data.tx*32,data.ty*32,data);
    ent.update(data);
    ents[data.id] = ent;
  });

  socket.on('ent_data',function(data){
    if (data == null){return;}
    var ent = ents[data.id];
    if (ent == undefined){
      socket.emit('entRequest',data.id);
      
      if (data.tx == undefined || data.spriteData == undefined){
        
      }else{
        ents[data.id] = new Entity(data.id,data.tx*32,data.ty*32,data);
        ent = ents[data.id];
      }
    }else{
      ent.update(data);
    }
  });

  socket.on('ent_destroy',function(data){
    var ent = ents[data.id];
    if (ent){
      ent.destroy();
      delete ents[data.id];
    }
  });

  socket.on('gm',function(data){
    Object.assign(gm, data);
  });

  socket.on('pSelf',function(data){
    Object.assign(player, data); //got information about the own player (health, inventory and stuff)
    player.updateUI();
    player.updateMode();
  });

  socket.on('clear',function(data){
    for (k in ents){
      ents[k].destroy();
      delete ents[k];
    }
    for (var i = 0; i < world.chunks.length; i++){
      var chunk = world.chunks[i];
      world.destroyChunk(chunk.x, chunk.y);
    }
    console.log("World Cleared!");
  });

  socket.on('pong', function(latency){
    $('#latency').html(latency);
  });

  socket.on('kick', function(msg){
    
  });
}