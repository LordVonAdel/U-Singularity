
//item factory function
function createItem(type){
  var exp = {};

  var itm = res.items[type];
  if (itm){
    exp.type = type;
    exp.name = itm.name;
    exp.sprite = itm.image;
    exp.sync = Object.assign({}, itm.sync);
    return exp;
  }
  return null;
}

function check(item){
  if (!item){return null;}
  if (item.type){
    var mother = res.items[item.type];
    item.name = item.name || mother.name;
    item.sprite = item.sprite || mother.image;
    item.sync = item.sync || mother.sync;
    return item;
  }else{
    return null;
  }
}

module.exports.create = createItem;
module.exports.check = check;