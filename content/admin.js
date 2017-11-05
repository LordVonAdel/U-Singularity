item = require('../code/item.js');

module.exports = {
  items: {
    destroyer: {
      name:"Destroyer",
      image:"items/item_destroyer.png",
      actions:["destroy"]
    },
    admin_key: {
      name: "Admin Key",
      image: "items/item_admin_key.png",
      onUseEnt: "admin_locktoggle",
      actions:["admin_locktoggle"],
      range: 10
    },
    world_edit: {
      name:"World Edit",
      onUseFloor:"worldEdit",
      image:"items/item_world_edit.png",
      sync:{mode:0}
    }
  },
  actions: {
    admin_locktoggle: function(ent, item){
      if (ent.sync.isLocked != undefined){
        ent.sync.isLocked = !ent.sync.isLocked;
      }
    }
  },
  commands: {
    give: {
      permission: "master.player.give",
      argNum: 1,
      fun: function(sender,args){
        if (loader.res.items[args[1]] != undefined) {
          var itm = item.create(args[1]);
          sender.give(itm);
        }else{
          sender.msg(args[1] + " is no item!");
        }
      }
    },
    items: {
      permissions: "master.list.items",
      fun: function(sender){
        var msg = "List of items<br>Name | ID<br>";
        for (k in loader.res.items){
          var item = loader.res.items[k];
          msg += item.name+" | "+k+"<br>";
        }
        sender.msg(msg);
      }
    },
    reload: {
      permission: "admin.reload",
      fun: function(sender,args){
        loader.loadConfig();
        loader.loadClasses();

        loader.auto();
        
        games.forEach((game, i) => {
          var a = config;
          game.config = config.games[i];
          game.worlds.forEach((world => {
            for (k in world.ents){
              world.ents[k].reload();
            }
          }));
        })

        sender.msg("Reload complete!")
      }
    }
  }
}