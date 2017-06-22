function initNetworking(){
  socket = io();

  socket.on('welcome',function(data){
    player.id = data.id;
    console.log("Connected to Server!");
    socket.emit('welcome',{});
  });

  /*
  socket.on('player_joined',function(data){
    console.log("A player joined the game!");
    //var pawn = new Pawn();
    players[data.id] = pawn;
    pawn.id = data.id;
  });*/
  socket.on('cam',function(data){
    camId = data;
    var ent = ents[data];
    if (ent != undefined){
      cam = ent;
    }
  });

  socket.on('player_move',function(data){
    var obj = players[data.id];
    if (obj != undefined){
      obj.tileX = data.x;
      obj.tileY = data.y;
      obj.x = data.w_x;
      obj.y = data.w_y;
      obj.direction = data.dir;
    }
  });

  socket.on('player_stats',function(data){
    var obj = player;
    if (obj != undefined){
      obj.moveSpeed = data.speed;
      obj.health = data.health;
      obj.name = data.name;
      obj.gender = data.gender;
      obj.job = data.job;
      obj.burning = data.burning;
    }
    if (data.inventory){
      player.inventory = data.inventory;
      player.updateUI();
    }
  });

  socket.on('chat',function(data){
    //console.log('chat: '+data.msg);
    $("#chat_msg").append("<br>"+data.msg);
    if (data.player != undefined){
      if (players[data.player] != undefined){
        players[data.player].say(data.raw);
      }
    }
    $("#chat_msg").scrollTop($("#chat_msg").prop("scrollHeight"));
  });

  socket.on('resource',function(data){
    //console.log(data);
    load(data);
  });

  socket.on('server_content',function(data){
    content_set(data.id,data.html);
    //$("#server_content").html(data.html);
    //$("#server_content").css("display","intial");
  });

  socket.on('change_tile',function(data){
    world.grid.cellSet(data.x,data.y,data.id);
  })

  socket.on('world',function(data){
    world.resize(data.w,data.h);
    world.grid.load(data.str);
  });

  socket.on('world_region',function(data){
    world.grid.loadRegion(data.str,data.x,data.y,data.w);
  });

  /*
  socket.on('disc',function(data){
    delete players[data.id]; //player disconnected
  });*/

  socket.on('ent_spawn',function(data){
    var ent = new Entity(data.id,data.x,data.y,data.image,data.image_number,data.image_index,data.tile)
    ent.update(data);
    ents[data.id] = ent;
  });

  socket.on('ent_data',function(data){
    var ent = ents[data.id];
    if (ent == undefined){
      ents[data.id] = new Entity(data.id,data.x,data.y,data.image,data.image_number,data.image_index,data.tile)
      ent = ents[data.id];
    }
    ent.update(data)
  });

  socket.on('ent_destroy',function(data){
    var ent = ents[data.id];
    ent.destroy();
    delete ents[data.id];
  });

  socket.on('gm',function(data){
    Object.assign(gm, data);
  });

  socket.on('pSelf',function(data){
    Object.assign(player, data); //got information about the own player (health, inventory and stuff)
    player.updateUI();
  });

  socket.on('clear',function(data){
    ents = {};
  });
}