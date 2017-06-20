ent = require("./entity.js");

function entity(type,x,y){
  var entity = new ent.Entity(type,x,y);
  entity.spawn();
  return entity;
}

function item(tx,ty,item){
  var type = item.type;
  var itm = res.items[type];
  if (itm != undefined){
    var entity = new ent.Entity("item",tx,ty);
    entity.sync.item = item;
    entity.update();
    //ent.changeImage(itm.image);
  }
}
module.exports.item = item;
module.exports.entity = entity;