module.exports = {
  tiles: { //-------------------------Tiles-----------------------
    0:  {"id":9, "name":"base.rock"         ,"collision":true , "image":"tiles/tile_rock.png", "transparent":false},
    1:  {"id":1, "name":"base.concrete"     ,"collision":false, "image":"tiles/tile_concrete.png"},
    2:  {"id":2, "name":"base.wall"         ,"collision":true , "image":"tiles/tile_wall.png"         ,"connectionType":"wall"   ,"connectionGroup": "walls", "transparent": false},
    3:  {"id":3, "name":"base.wall_window"  ,"collision":true , "image":"tiles/tile_wall_window.png"  ,"connectionType":"wall"   ,"connectionGroup": "walls"},
    4:  {"id":4, "name":"base.wall_glass"   ,"collision":true , "image":"tiles/tile_wall_glass.png"   ,"connectionType":"wall"   ,"connectionGroup": "walls"},
    5:  {"id":5, "name":"base.wall_frame"   ,"collision":true , "image":"tiles/tile_wall_frame.png"},
    6:  {"id":6, "name":"base.floor_metal"  ,"collision":false, "image":"tiles/tile_floor_metalC.png"},
    7:  {"id":7, "name":"base.wall_chamber" ,"collision":true , "image":"tiles/tile_wall_chamber.png" ,"connectionType":"wall"   ,"connectionGroup": "walls", "transparent": false},
    8:  {"id":8, "name":"base.floor_chamber","collision":false, "image":"tiles/tile_floor_chamber.png","connectionType":"simple" ,"connectionGroup": "floor_chamber"},
    9:  {"id":0, "name":"base.grass"        ,"collision":false, "image":"tiles/tile_grass.png"}
  },
  items: { //-------------------------Items-----------------------
    knife:             {"id":"knife"            ,"name":"Knife"            ,"onUseFloor":"test"       ,"image":"items/item_knife.png"            ,"actions":["cut"]},
    metal:             {"id":"metal"	          ,"name":"Metal Sheet"      ,"onUseFloor":"build_metal","image":"items/item_metal.png"},
    crowbar:           {"id":"crowbar"          ,"name":"Crowbar"          ,"onUseFloor":"crowbar"    ,"image":"items/item_crowbar.png", "actions":["crowbar"]},
    glass:             {"id":"glass"            ,"name":"Glass"            ,"onUseFloor":"buildGlass" ,"image":"items/item_glass.png"},
    wall_frame:        {"id":"wall_frame"       ,"name":"Wall Frame"       ,"onUseFloor":"buildWall"  ,"image":"items/item_wall_frame.png"},
    armor_plating:     {"id":"armor_plating"    ,"name":"Armor Plating"    ,"onUseFloor":"buildArmor" ,"image":"items/item_armor_plating.png"},
    destroyer:         {"id":"destroyer"        ,"name":"Destroyer"                                   ,"image":"items/item_destroyer.png"        ,"actions":["destroy"]},
    fire_ext:          {"id":"fire_ext"         ,"name":"Fire Extinguisher","onUseFloor":"extinguish" ,"image":"items/item_fire_extinguisher.png","actions":["fire_ext_box"]},
    atmo_scanner:      {"id":"atmo_scanner"     ,"name":"Atmo scanner"     ,"onUseFloor":"scanAtmo"   ,"image":"items/item_atmo_scanner.png"},
    world_edit:        {"id":"world_edit"       ,"name":"World Edit"       ,"onUseFloor":"worldEdit"  ,"image":"items/item_world_edit.png","sync":{"mode":0}}
  },
  commands: {  //-------------------------Commands-----------------------
    ping: {
      permission: "cmd.ping",
      fun: function(sender,args){
        sender.msg("pong!");
      }
    },
    noclip: {
      permission: "master.player.noclip",
      fun: function(sender, args){
        sender.ent.noclip = !sender.ent.noclip;
        if (sender.ent.noclip){
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
        sender.world.spawnX = sender.ent.tx;
        sender.world.spawnY = sender.ent.ty;
        sender.msg("Spawnpoint set to "+sender.ent.tx+", "+sender.ent.ty+" !");
      }
    },
    spawn: {
      permission: "master.player.spawn",
      fun: function(sender, args){
        sender.teleport(sender.world.spawnX, sender.world.spawnY);
      }
    },
    tp: {
      permission: "master.player.teleport",
      argNum: 2,
      fun: function(sender,args){
        if (args.length > 2){
          sender.teleport(+args[1], +args[2]);
        }
      }
    },
    reload: {
      permission: "admin.reload",
      fun: function(sender,args){
        loader.auto();
        loader.loadConfig();
        loader.loadClasses();
        sender.msg("Reload complete!")
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
    },
    start: {
      permission: "master.start",
      fun: function(sender, args){
        sender.game.gamemode.start();
      }
    }
  },
  actions: { //----------------------------Actions-----------------------------
    build_metal: function(world, tileX, tileY){
      var index = world.cellGet(tileX,tileY);
      console.log("Build metal! Floor has index: "+index);
      switch(index){
        case 0:
          world.cellSet(tileX,tileY,6);
        break;
        case 5:
          world.cellSet(tileX,tileY,2);
        break;
      }
    },
    buildArmor: function(world, tileX, tileY){
      var index = world.cellGet(tileX,tileY);
      if (index == 2){
        world.cellSet(tileX,tileY,7);
      }
      if (index == 0){
        world.cellSet(tileX,tileY,8);
      }
    },
    buildGlass: function(world, tileX,tileY){
      var index = world.cellGet(tileX,tileY);
      if (index == 5){
        world.cellSet(tileX,tileY,4);
      }
      if (index == 2){
        world.cellSet(tileX,tileY,3);
      }
    },
    buildWall: function(world, tileX, tileY){
      world.cellSet(tileX,tileY,5);
    },
    crowbar: function(world, tileX, tileY){
      world.cellSet(tileX,tileY,0);
    },
    extinguish: function(world, tileX,tileY){
      var index = world.cellGet(tileX,tileY);
      if (!res.tiles[index].collision){
        //world.spawnEntity("gas_argon",tileX,tileY);
      }
    },
    scanAtmo: function(world, tileX,tileY,user){
      var str = "---Atmosphere---"
      var tile = world.gridAtmos.cellGet(tileX,tileY);
      if (tile){
        for(k in tile.content){
          str+="<br>|"+k+": "+tile.content[k];
        }
        str+="<br>Temperature: "+tile.temperature+"K";
        user.msg(str);
      }
    }
  },
  objects: { //-----------------------Objects-----------------------------
    door_default: {
      image:[{"number":8,"source":"objects/door_default.png", "width": 32, "height": 32}],
      collision:true, 
      sync:{open: 0, frame: 0},
      onInit:function(){this.sync.open = 0; this.sync.frame = 0;},
      onClick:function(user){this.sync.open = 1-this.sync.open; this.share(); this.update(); this.animation = true;},
      onAnimation:function(){this.sync.frame = handy.transition(this.sync.frame,this.sync.open,1/30,0);this.sprites[0].index = Math.floor(this.sync.frame*(this.imageNumber-1)); this.collision = (Math.floor(this.sync.frame)==0);this.update(); this.share(); if(this.sync.frame == this.sync.open){this.animation = false}},
      onPush:function(pusher){this.sync.open = 1; this.animation = true},
      onUpdate:function(){this.changeImageIndex(0, Math.floor(this.sync.frame*(this.sprites[0].number-1))); this.collision = (Math.floor(this.sync.frame)==0);},
      actions:{},
      tile:{"connectionGroup":"walls"},
      layer:30
    },
    detail: {
      image:"detail/exit_signs.png",
      imageNumber:1,
      collision:false,
      actions:{}
    },
    fire_ext_box: {
      image:"objects/fire_extinguisher_box.png",
      imageNumber:2,
      collision:false,
        sync:{item: null},
        onInit:function(){this.sync.item = new loader.Item("fire_ext")},
        onClick:function(user){if (this.sync.item != null && user.inventory[user.inventoryActive]==null){user.inventory[user.inventoryActive] = this.sync.item;this.sync.item = null; this.sprites[0].index = 1; this.share(); user.shareSelf();}},
        onUpdate:function(){if(this.sync.item == null){this.sprites[0].index = 1}else{this.sprites[0].index = 0}; this.share()},
        actions:{
          fire_ext_box:function(user,item){if (this.sync.item == null){this.sync.item = user.inventory[user.inventoryActive]; user.inventory[user.inventoryActive] = null; this.sprites[0].index = 0; this.share(); user.shareSelf()}}
        }
      },
    lamp_standing: {
      image: [{number: 1, source: "objects/lamp_standing.png", width: 32, height: 32}],
      sync: {isOn: true},
      dragable: true,
      onInit: function(){ this.update(); },
      collision: true,
      onUpdate: function(){
        if (this.sync.isOn){
          this.setLight(0, {radius: 512, color: 0xfffee8});
        }else{
          this.setLight(0, null);
        }
      },
      actions:{ 
        hand: function(){
          this.sync.isOn = !this.sync.isOn;
          this.update();
        }
      }
    },
    wall_lamp: {
      wallMounted: true,
      image: [{number: 8, source: "objects/wall_lamp.png", width:32, height: 32}],
      onInit: function(){
        this.update();
      },
      onUpdate: function(){
        this.setLight(0, {radius: 256, color: 0xfffefe, intensity: 0.9});
      }
    },
    wall_lamp_warning: {
      wallMounted: true,
      image: [{number: 8, source: "objects/wall_lamp_warning.png", width:32, height: 32}],
      collision: false,
      sync: {isOn: false},
      onInit: function(){
        this.update();
      },
      onUpdate: function(){
        if (this.sync.isOn){
          this.setLight(0, {radius: 128, color: 0xff0000, pattern: "X-", intensity: 0.6});
        }else{
          this.setLight(0, null);
        }
        this.changeImageIndex(0, this.orientation + 4 * this.sync.isOn);
      }
    }
  }
}