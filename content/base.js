const item = require('../code/item.js');
const utils = require('../code/utils.js');

module.exports = {
  tiles: { //-------------------------Tiles-------------------------
    0:  {"name":"base.rock"         ,"collision":true , "image":"tiles/tile_rock.png", "transparent":false},
    1:  {"name":"base.concrete"     ,"collision":false, "image":"tiles/tile_concrete.png"},
    2:  {"name":"base.wall"         ,"collision":true , "image":"tiles/tile_wall.png"         ,"connectionType":"wall"   ,"connectionGroup": "walls", "transparent": false},
    3:  {"name":"base.wall_window"  ,"collision":true , "image":"tiles/tile_wall_window.png"  ,"connectionType":"wall"   ,"connectionGroup": "walls"},
    4:  {"name":"base.wall_glass"   ,"collision":true , "image":"tiles/tile_wall_glass.png"   ,"connectionType":"wall"   ,"connectionGroup": "walls"},
    5:  {"name":"base.wall_frame"   ,"collision":true , "image":"tiles/tile_wall_frame.png"},
    6:  {"name":"base.floor_metal"  ,"collision":false, "image":"tiles/tile_floor_metalD.png"},
    7:  {"name":"base.wall_chamber" ,"collision":true , "image":"tiles/tile_wall_chamber.png" ,"connectionType":"wall"   ,"connectionGroup": "walls", "transparent": false},
    8:  {"name":"base.floor_chamber","collision":false, "image":"tiles/tile_floor_chamber.png","connectionType":"simple" ,"connectionGroup": "floor_chamber"},
    9:  {"name":"base.grass"        ,"collision":false, "image":"tiles/tile_grass.png"},
    10: {"name":"base.underground"  ,"collision":false, "image":"tiles/tile_underground.png"}
  },
  items: { //-------------------------Items-------------------------
    knife:             {"name":"Knife"            ,"onUseFloor":"test"       ,"image":"items/item_knife.png"            ,"actions":["stab", "cut", "carve"]},
    metal:             {"name":"Metal Sheet"      ,"onUseFloor":"build_metal","image":"items/item_metal.png"},
    crowbar:           {"name":"Crowbar"          ,"onUseFloor":"crowbar"    ,"image":"items/item_crowbar.png", "actions":["crowbar"]},
    glass:             {"name":"Glass"            ,"onUseFloor":"buildGlass" ,"image":"items/item_glass.png"},
    wall_frame:        {"name":"Wall Frame"       ,"onUseFloor":"buildWall"  ,"image":"items/item_wall_frame.png"},
    armor_plating:     {"name":"Armor Plating"    ,"onUseFloor":"buildArmor" ,"image":"items/item_armor_plating.png"},
    fire_ext:          {"name":"Fire Extinguisher","onUseFloor":"extinguish" ,"image":"items/item_fire_extinguisher.png","actions":["fire_ext_box"]},
    atmo_scanner:      {"name":"Atmo scanner"     ,"onUseFloor":"scanAtmo"   ,"image":"items/item_atmo_scanner.png"},
    stick:             {"name":"Stick"                                       ,"image":"items/item_stick.png", on: {carve: function(){item.transform(this, "stick_sharp")}}},
    stick_sharp:       {"name":"Sharp Stick"                                 ,"image":"items/item_stick_sharp.png", "actions":["stab"]}
  },
  commands: {  //-------------------------Commands-------------------------
    ping: {
      permission: "cmd.ping",
      fun(sender,args){
        sender.msg("pong!");
      }
    },
    noclip: {
      permission: "master.player.noclip",
      fun(sender, args){
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
      fun(sender,args){
        if (args.length>=1){
          var filename = "./maps/"+args[1]+".json";
          sender.world.save(filename);
        }
      }
    },
    world_load: {
      permission: "world.load",
      argNum: 1,
      fun(sender, args){
        if (args.length>=1){
          var filename = "./maps/"+args[1]+".json";
          sender.world.load(filename);
        }
      }
    },
    world_clear: {
      permission: "world.clear",
      fun(sender, args){
        sender.world.clear();
      }
    },
    spawn_set: {
      permission: "world.edit.spawn",
      fun(sender,args){
        sender.world.spawnX = sender.ent.tx;
        sender.world.spawnY = sender.ent.ty;
        sender.msg("Spawnpoint set to "+sender.ent.tx+", "+sender.ent.ty+" !");
      }
    },
    spawn: {
      permission: "master.player.spawn",
      fun(sender, args){
        sender.teleport(sender.world.spawnX, sender.world.spawnY);
      }
    },
    tp: {
      permission: "master.player.teleport",
      argNum: 2,
      fun(sender, args){
        if (args.length > 2){
          sender.teleport(+args[1], +args[2]);
        }
      }
    },
    world: {
      permission: "master.player.teleportWorld",
      argNum: 1,
      fun(sender, args){
        sender.game.changeWorld(sender, args[1]);
      }
    },
    start: {
      permission: "master.start",
      fun(sender, args){
        sender.game.gamemode.start();
      }
    }
  },
  actions: { //----------------------------Actions-----------------------------
    build_metal(world, tileX, tileY){
      var index = world.cellGet(tileX,tileY);
      switch(index){
        case 0:
          world.cellSet(tileX,tileY,6);
        break;
        case 5:
          world.cellSet(tileX,tileY,2);
        break;
        case 10: 
          world.cellSet(tileX,tileY,6);
        break;
      }
    },
    buildArmor(world, tileX, tileY){
      var index = world.cellGet(tileX,tileY);
      if (index == 2){
        world.cellSet(tileX,tileY,7);
      }
      if (index == 0){
        world.cellSet(tileX,tileY,8);
      }
    },
    buildGlass(world, tileX,tileY){
      var index = world.cellGet(tileX,tileY);
      if (index == 5){
        world.cellSet(tileX,tileY,4);
      }
      if (index == 2){
        world.cellSet(tileX,tileY,3);
      }
    },
    buildWall(world, tileX, tileY){
      world.cellSet(tileX,tileY,5);
    },
    crowbar(world, tileX, tileY){
      var index = world.cellGet(tileX,tileY);
      switch(index){
        case 6:
          world.cellSet(tileX,tileY,10);
        break;
        default:
          world.cellSet(tileX,tileY,0);
        break;
      }
    },
    extinguish(world, tileX,tileY){
      var index = world.cellGet(tileX,tileY);
      if (!res.tiles[index].collision){
        //world.spawnEntity("gas_argon",tileX,tileY);
      }
    },
    scanAtmo(world, tileX,tileY, user){
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
    fire: {
      image:[{number:4, source:"effects/fire_human_back.png", width:32, height:32}],
      collision: false
    },
    door_default: {
      image:[{"number":8,"source":"objects/door_default.png", "width": 32, "height": 32}],
      collision:true, 
      sync:{open: 0, frame: 0, isLocked: false},
      onInit(){this.sync.open = 0; this.sync.frame = 0;},
      onClick(user){
        if (!this.sync.isLocked){
          this.fire("toggleOpen");
        }
      },
      onAnimation(delta){
        this.sync.frame = utils.transition(this.sync.frame, this.sync.open, delta/100, 0);
        this.sprites[0].index = Math.floor(this.sync.frame*(this.sprites[0].number-1)); 
        this.collision = (Math.floor(this.sync.frame)==0);this.update(); this.share(); 
        if(this.sync.frame == this.sync.open){this.animation = false}
      },
      onPush:function(pusher){
        if (!this.sync.isLocked){
          this.sync.open = 1;
          this.animation = true
          this.checkToStepList();
        }
      },
      onUpdate(){this.changeImageIndex(0, Math.floor(this.sync.frame*(this.sprites[0].number-1)));this.collision = (Math.floor(this.sync.frame)==0);},
      toggleOpen(){
        this.sync.open = 1-this.sync.open;
        this.share();
        this.update();
        this.animation = true;
        this.checkToStepList();
      },
      actions:{},
      tile:{"connectionGroup":"walls"},
    },
    door_control_room: {
      extends: "door_default",
      sync: {open: 0, frame: 0, isLocked: true},
      image:[{"number":8,"source":"objects/door_control_room.png", "width": 32, "height": 32}]
    },
    door_lift: {
      extends: "door_default",
      sync: {open: 0, frame: 0, isLocked: true},
      image:[{"number":4,"source":"objects/door_lift.png", "width": 32, "height": 32}]
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
      onInit(){this.sync.item = item.create("fire_ext")},
      onClick(user){
        if (this.sync.item != null && user.inventory[user.ent.inventoryActive]==null){
          user.ent.sync.inventory[user.ent.sync.inventoryActive] = this.sync.item;
          this.sync.item = null;
          this.sprites[0].index = 1; 
          this.share(); 
          user.shareSelf();
        }
      },
      onUpdate(){
        if(this.sync.item == null){
          this.sprites[0].index = 1
        }else{
          this.sprites[0].index = 0; 
          item.check(this.sync.item)
        };
        this.share()
      },
      actions:{
        fire_ext_box(user,item){
          if (this.sync.item == null){
            this.sync.item = user.ent.sync.inventory[user.ent.sync.inventoryActive]; 
            user.ent.sync.inventory[user.ent.sync.inventoryActive] = null; 
            this.sprites[0].index = 0; 
            this.share(); 
            user.shareSelf();
          }
        }
      }
    },
    lamp_standing: {
      image: [{number: 1, source: "objects/lamp_standing.png", width: 32, height: 32}],
      sync: {isOn: true},
      draggable: true,
      collision: true,
      onUpdate(){
        if (this.sync.isOn){
          this.setLight(0, {radius: 512, color: 0xfffee8});
        }else{
          this.setLight(0, null);
        }
      },
      actions:{ 
        hand(){
          this.sync.isOn = !this.sync.isOn;
          this.update();
        }
      }
    },
    wall_lamp: {
      wallMounted: true,
      layer: 7,
      image: [{number: 8, source: "objects/wall_lamp.png", width: 32, height: 32}],
      onInit(){
        this.power_use = 0.2;
      },
      onUpdate(){
        var cables = this.world.getEntsByPosition(this.tx, this.ty).filter(function(ent){return (ent.power_nw)});

        for (var i = 0; i < cables.length; i++){
          var cable = cables[i];
          if (cable != this && cable.power_nw){
            cable.power_nw.addMember(this);
            this.power_nw = cable.power_nw;
          }
        }
      },
      onPowerChange(income){
        this.setLight(0, {radius: 256, color: 0xfffefe, intensity: 0.9 * income});
      }
    },
    wall_lamp_warning: {
      wallMounted: true,
      layer: 7,
      image: [{number: 8, source: "objects/wall_lamp_warning.png", width:32, height: 32}],
      collision: false,
      sync: {isOn: false},
      onUpdate(){
        if (this.sync.isOn){
          this.setLight(0, {radius: 128, color: 0xff0000, pattern: "0138XXXX0", patternTime: 2000, intensity: 0.6});
        }else{
          this.setLight(0, null);
        }
        this.changeImageIndex(0, this.orientation + 4 * this.sync.isOn);
      }
    }
  }
}