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
    }
  },
  actions: {
    admin_locktoggle(ent, item){
      if (ent.sync.isLocked != undefined){
        ent.sync.isLocked = !ent.sync.isLocked;
      }
    }
  },
  commands: {
    give: {
      permission: "master.player.give",
      argNum: 1,
      fun(sender,args){
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
      fun(sender){
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
      fun(sender,args){
        loader.loadConfig();
        loader.loadClasses();
        loader.loadPermissions();

        loader.auto();
        
        lc.games.forEach((game, i) => {
          game.config = loader.config.games[i];
          game.worlds.forEach((world => {
            for (k in world.ents){
              world.ents[k].reload();
            }
          }));
        })

        sender.msg("Reload complete!")
      }
    },
    mode: {
      permission: "admin.mode",
      fun(sender, args){
        var modelist = {0:"player", 1:"spectator" ,"player": "player", "spectator":"spectator"};
        var m = modelist[args[1]];
        if (m)
          sender.changeMode(m);
      }
    }
  }
}