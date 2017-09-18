module.exports = {
  tiles:{
    101: {"id":101, "name":"serverroom.floor_lampertz","collision":false, "image":"tiles/tile_floor_lampertz.png"},
    102: {"id":102, "name":"serverroom.wall_lampertz" ,"collision":true , "image":"tiles/tile_wall_lampertz.png" ,"connectionType":"perspective" ,"connectionGroup": "lampertz"},
  },
  items:{
    lampertz: {"id":"lampertz" ,"name":"Lampertz Plating","onUseFloor":"build_lampertz","image":"items/item_lampertz.png"}
  },
  actions:{
    build_lampertz: function(world, tileX,tileY){
      var index = world.cellGet(tileX,tileY);
      if (index == 5){ //base wall frame
        wrd.cellSet(tileX,tileY,102);
      }
      if (index == 6){ //base floor metal
        wrd.cellSet(tileX,tileY,101);
      }
    }
  },
  commands: {
    create_door: {
      fun: function(sender,args){
        sender.world.spawnEntity("door_default",sender.ent.tx,sender.ent.ty);
      
      }
    },
    create_detail: {
      argNum: 1,
      fun: function(sender,args){
        if (args.length > 1){
          var ent = sender.world.spawnEntity("detail",sender.ent.tx,sender.ent.ty);
          ent.image = args[1];
        }
      }
    },
    create_fire_ext: {
      fun: function(sender,args){
        sender.world.spawnEntity("fire_ext_box",sender.ent.tileX,sender.ent.ty);
      }
    },
    create_argon_tank: {
      fun: function(sender,args){
        sender.world.spawnEntity("argon_tank",sender.ent.tx,sender.ent.ty);
      }
    }
  },
  objects: {
    argon_tank:{
      "image":"objects/argon_tank.png",
      "imageNumber":2,
      "imageIndex":0,
      "sync": {open: 0, fuel: 100},
      "collision":true,
      "dragable":true,
      "onInit":function(){this.sync.fuel = 100, this.sync.open=0},
      "onStep":function(){if(this.sync.fuel > 0 && this.sync.open == 1){this.sync.fuel -= 1; /*atmos.addGas(ent.tx,ent.ty,{ar:1});*/ if(this.sync.fuel <= 0){this.imageIndex=0; this.update(); this.share();}}},
      "actions":{
        "hand":function(user){this.sync.open = 1-this.sync.open; this.imageIndex=this.sync.open; this.update(); this.share();}
      }
    },
    gas_argon:{
      "image":"gas/gas_argon.png",
      "imageNumber":1,
      "imageIndex":0,
      "collision":false,
      "onStep":function(ent){
        var d = Math.floor(Math.random()*4);
        if (d == 0){
          if (!wrd.collisionCheck(ent.tx+1,ent.ty)){
            ent.move(ent.tx+1,ent.ty);
          }
        }
        if (d == 1){
          if (!wrd.collisionCheck(ent.tx,ent.ty-1)){
            ent.move(ent.tx,ent.ty-1);
          }
        }
        if (d == 2){
          if (!wrd.collisionCheck(ent.tx-1,ent.ty)){
            ent.move(ent.tx-1,ent.ty);
          }
        }
        if (d == 3){
          if (!wrd.collisionCheck(ent.tx,ent.ty+1)){
            ent.move(ent.tx,ent.ty+1);
          }
        }
        ent.share();
      }
    }
  }
}