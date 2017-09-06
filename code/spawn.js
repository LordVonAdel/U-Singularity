Entity = require("./entity.js");

//spawns an entity at a specific tile or position?
function entity(world, type, x, y){
  var entity = new Entity(world, type,x,y);
  entity.spawn();
  return entity;
}

//spawns an item at a specific tile
function item(world, tx, ty, item){
  var type = item.type;
  var itm = res.items[type];
  if (itm != undefined){
    var entity = new Entity(world, "item", tx, ty);
    entity.sync.item = item;
    entity.update();
    //ent.changeImage(itm.image);
  }
}

module.exports.item = item;
module.exports.entity = entity;