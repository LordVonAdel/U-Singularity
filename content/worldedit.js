module.exports = {
  items: {
    worldedit: {
      name:"World Edit",
      onUseFloor:"worldEdit",
      image:"items/item_world_edit.png",
      sync:{mode:0},
      range: 100
    }
  },
  commands: {
    e: { //World Edit
      permission: "admin.worldedit",
      fun(sender, args){
        if (sender.worldEditNextPoint == undefined){
          sender.msg("You need to set points first");
          return;
        }

        var p1 = sender.worldEditPoint1;
        var p2 = sender.worldEditPoint2;
        var xmax = Math.max(p1.x, p2.x);
        var ymax = Math.max(p1.y, p2.y);
        var xmin = Math.min(p1.x, p2.x);
        var ymin = Math.min(p1.y, p2.y);
        p1 = {x: xmin, y: ymin};
        p2 = {x: xmax + 1, y: ymax + 1};
        var w = p2.x - p1.x;
        var h = p2.y - p1.y;

        switch (args[1]){
          case "copy": //copy a region to the users clipboard
            sender.worldEditClipboard = sender.world.saveRegion(p1.x, p1.y, w, h, sender.ent.tx - p1.x, sender.ent.ty - p1.y);
            sender.msg(`Copied ${w}x${h} (${w*h}) tiles and ${Object.keys(sender.worldEditClipboard.ents).length} entities to clipboard!`);
          break;
          case "paste": //paste a region from the users clipboard
            if (sender.worldEditClipboard){
              sender.world.loadRegion(sender.worldEditClipboard, sender.ent.tx, sender.ent.ty);
              sender.msg("Pasted clipboard to world!");
            }else{
              sender.msg("You don't have a region in your clipboard!");
            }
          break;
          case "save": //saves the users clipboard to a file
            if (!args[2]){return;}
          break;
          case "load": //loads the users clipboard from a file
            if (!args[2]){return;}
          break;
          case "set": //set every cell in the area of the world
            
          break;
          default: 
            sender.msg("Unknown WorldEdit command: "+args[1]);
          break;
        }
      }
    }
  },
  actions: {
    worldEdit(world, tileX, tileY, user){
      if (user.worldEditNextPoint == undefined){
        user.worldEditNextPoint = 0;
        user.worldEditPoint1 = {x: 0, y: 0};
        user.worldEditPoint2 = {x: 0, y: 0};
        user.worldEditClipboard = null;
      }
      if (user.worldEditNextPoint == 0){
        user.worldEditPoint1 = {x: tileX, y: tileY};
        user.msg("Point 1 set!");
      }else{
        user.worldEditPoint2 = {x: tileX, y: tileY};
        user.msg("Point 2 set!");
      }
      user.worldEditNextPoint = 1-user.worldEditNextPoint;
    }
  }
}