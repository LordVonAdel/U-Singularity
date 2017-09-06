module.exports = {
tiles: { //-------------------------Tiles-----------------------
  0:  {"id":9, "name":"base.rock"         ,"collision":true , "image":"tiles/tile_rock.png"},
  1:  {"id":1, "name":"base.concrete"     ,"collision":false, "image":"tiles/tile_concrete.png"},
  2:  {"id":2, "name":"base.wall"         ,"collision":true , "image":"tiles/tile_wall.png"         ,"connectionType":"wall"   ,"connectionGroup": "walls"},
  3:  {"id":3, "name":"base.wall_window"  ,"collision":true , "image":"tiles/tile_wall_window.png"  ,"connectionType":"wall"   ,"connectionGroup": "walls"},
  4:  {"id":4, "name":"base.wall_glass"   ,"collision":true , "image":"tiles/tile_wall_glass.png"   ,"connectionType":"wall"   ,"connectionGroup": "walls"},
  5:  {"id":5, "name":"base.wall_frame"   ,"collision":true , "image":"tiles/tile_wall_frame.png"},
  6:  {"id":6, "name":"base.floor_metal"  ,"collision":false, "image":"tiles/tile_floor_metalC.png"},
  7:  {"id":7, "name":"base.wall_chamber" ,"collision":true , "image":"tiles/tile_wall_chamber.png" ,"connectionType":"wall"   ,"connectionGroup": "walls"},
  8:  {"id":8, "name":"base.floor_chamber","collision":false, "image":"tiles/tile_floor_chamber.png","connectionType":"simple" ,"connectionGroup": "floor_chamber"},
  9:  {"id":0, "name":"base.grass"        ,"collision":false, "image":"tiles/tile_grass.png"}
},
items: { //-------------------------Items-----------------------
  knife:             {"id":"knife"            ,"name":"Knife"            ,"onUseFloor":"test"       ,"image":"items/item_knife.png"},
  metal:             {"id":"metal"	          ,"name":"Metal Sheet"      ,"onUseFloor":"build_metal","image":"items/item_metal.png"},
  crowbar:           {"id":"crowbar"          ,"name":"Crowbar"          ,"onUseFloor":"crowbar"    ,"image":"items/item_crowbar.png"},
  wall_frame:        {"id":"wall_frame"       ,"name":"Wall Frame"       ,"onUseFloor":"build_wall" ,"image":"items/item_wall_frame.png"},
  glass:             {"id":"glass"            ,"name":"Glass"            ,"onUseFloor":"build_glass","image":"items/item_glass.png"},
  armor_plating:     {"id":"armor_plating"    ,"name":"Armor Plating"    ,"onUseFloor":"build_armor","image":"items/item_armor_plating.png"},
  destroyer:         {"id":"destroyer"        ,"name":"Destroyer"                                   ,"image":"items/item_destroyer.png"        ,"actions":["destroy"]},
  fire_ext:          {"id":"fire_ext"         ,"name":"Fire Extinguisher","onUseFloor":"extinguish" ,"image":"items/item_fire_extinguisher.png","actions":["fire_ext_box"]},
  atmo_scanner:      {"id":"atmo_scanner"     ,"name":"Atmo scanner"     ,"onUseFloor":"scanAtmo"   ,"image":"items/item_atmo_scanner.png"},
  world_edit:        {"id":"world_edit"       ,"name":"World Edit"       ,"onUseFloor":"worldEdit"  ,"image":"items/item_world_edit.png","sync":{"mode":0}}
},
commands: {  //-------------------------Commands-----------------------
  ping: {
    permission: "cmd.ping",
    fun: function(sender,args){
      sender.msg("pong!")
    }
  },
  noclip: {
    permission: "master.player.noclip",
    fun: function(sender, args){
      sender.noclip = !sender.noclip;
      if (sender.noclip){
        sender.msg("Noclip enabled!");
      }else{
        sender.msg("Noclip disabled!");
      }
    }
  },
  world_save: {
    permission: "world.save",
    argNum: 1,
    fun: function(sender,args){
      if (args.length>=1){
        var filename = "./maps/"+args[1]+".json";
        sender.world.save(filename);
      }
    }
  },
  world_load: {
    permission: "world.load",
    argNum: 1,
    fun: function(sender, args){
      if (args.length>=1){
        var filename = "./maps/"+args[1]+".json";
        sender.world.load(filename);
      }
    }
  },
  world_clear: {
    permission: "world.clear",
    fun: function(sender, args){
      sender.world.clear();
    }
  },
  spawn_set: {
    permission: "world.edit.spawn",
    fun: function(sender,args){
      wrd.spawnX = sender.tileX;
      wrd.spawnY = sender.tileY;
      sender.msg("Spawnpoint set to "+sender.tileX+", "+sender.tileY+" !");
    }
  },
  spawn: {
    fun: function(sender, args){
      sender.teleport(wrd.spawnX, wrd.spawnY);
    }
  },
  tp: {
    permission: "master.player.teleport",
    argNum: 2,
    fun: function(sender,args){
      if (args.length > 2){
        sender.teleport(args[1],args[2]);
      }
    }
  },
  start: {
    permission: "master.gamemode.start",
    fun: function(sender,args){
      if (args.length > 1){
        gm.startCountdown(args[1]);
      }else{
        gm.startCountdown(120);
      }
    }
  },
  reload: {
    permission: "admin.reload",
    fun: function(sender,args){
      loader.auto();
      sender.msg("Reload files")
    }
  },
  give: {
    permission: "master.player.give",
    argNum: 1,
    fun: function(sender,args){
      if (loader.res.items[args[1]]!=undefined){
        var itm = new loader.Item(args[1]);
        sender.give(itm);
      }else{
        sender.msg(args[1]+" is no item!");
      }
    }
  }
},
actions: { //----------------------------Actions-----------------------------
  build_metal: function(world, tileX, tileY){
    var index = world.cellGet(tileX,tileY);
    switch(index){
      case 0:
        world.cellSet(tileX,tileY,6);
      break;
      case 5:
        world.cellSet(tileX,tileY,2);
      break;
    }
  },
  build_armor: function(world, tileX, tileY){
    var index = wrd.cellGet(tileX,tileY);
    if (index == 2){
      world.cellSet(tileX,tileY,7);
    }
    if (index == 0){
      world.cellSet(tileX,tileY,8);
    }
  },
  build_glass: function(world, tileX,tileY){
    var index = world.cellGet(tileX,tileY);
    if (index == 5){
      world.cellSet(tileX,tileY,4);
    }
    if (index == 2){
      world.cellSet(tileX,tileY,3);
    }
  },
  build_wall: function(world, tileX,tileY){
    world.cellSet(tileX,tileY,5);
  },
  crowbar: function(world, tileX,tileY){
    world.cellSet(tileX,tileY,0);
  },
  extinguish: function(world, tileX,tileY){
    var index = wrd.cellGet(tileX,tileY);
    if (!res.tiles[index].collision){
      //spawn.entity("gas_argon",tileX,tileY);
    }
  },
  scanAtmo: function(tileX,tileY,user){
    var str = "---Atmosphere---"
    var tile = wrd.gridAtmos.cellGet(tileX,tileY);
    for(k in tile.content){
      str+="<br>|"+k+": "+tile.content[k];
    }
    str+="<br>Temperature: "+tile.temperature+"K";
    user.msg(str);
  }
},
objects: { //-----------------------Objects-----------------------------
  door_default: {"image":"objects/door_default.png", "imageNumber":8, "imageIndex":0, "collision":true, 
                "sync":{open: 0, frame: 0},
                "onInit":function(ent){ent.sync.open = 0; ent.sync.frame = 0;},
                "onClick":function(user,ent){ent.sync.open = 1-ent.sync.open; ent.share(); ent.update(); ent.animation = true;},
                "onAnimation":function(ent){ent.sync.frame = handy.transition(ent.sync.frame,ent.sync.open,1/30,0);ent.imageIndex = Math.floor(ent.sync.frame*(ent.imageNumber-1)); ent.collision = (Math.floor(ent.sync.frame)==0); ent.update(); ent.share(); if(ent.sync.frame == ent.sync.open){ent.animation = false}},
                "onPush":function(ent,user){ent.sync.open = 1; ent.animation = true},
                "onUpdate":function(ent){ent.imageIndex = Math.floor(ent.sync.frame*(ent.imageNumber-1)); ent.collision = (Math.floor(ent.sync.frame)==0);},
                "actions":{},
                "tile":{"connectionGroup":"walls"},
                "layer":30
                },
  detail:       {"image":"detail/exit_signs.png", "imageNumber":1, "imageIndex":0, "collision":false,
                "actions":{}
                },
  fire_ext_box: {"image":"objects/fire_extinguisher_box.png", "imageNumber":2, "imageIndex":0, "collision":false,
                "sync":{item: null},
                "onInit":function(ent){ent.sync.item = new loader.Item("fire_ext")},
                "onClick":function(user,ent){if (ent.sync.item != null && user.inventory[user.inventoryActive]==null){user.inventory[user.inventoryActive] = ent.sync.item;ent.sync.item = null; ent.imageIndex = 1; ent.share(); user.share();}},
                "onUpdate":function(ent){if(ent.sync.item == null){ent.imageIndex = 1}else{ent.imageIndex = 0}; ent.share()},
                "actions":{
                  "fire_ext_box":function(user,ent,item){if (ent.sync.item == null){ent.sync.item = user.inventory[user.inventoryActive]; user.inventory[user.inventoryActive] = null; ent.imageIndex = 0; ent.share(); user.share()}}
                  }
                }
}
}